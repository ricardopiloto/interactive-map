"""Validate and import campaign packages (spec 097)."""

from __future__ import annotations

import json
import logging
import re
import shutil
import tempfile
import uuid
import zipfile
from datetime import datetime
from pathlib import Path
from typing import Any

from sqlmodel import Session, select

from app.campaign_db import (
    campaign_db_path,
    campaign_site_path,
    campaign_uploads_path,
    ensure_campaign_schema,
    get_campaign_engine,
    get_control_engine,
)
from app.models.arco import Arco
from app.models.campanha import Campanha
from app.models.grupo import GrupoPosicao
from app.models.links import LocalConexaoLink, LocalNPCLink, SessaoLocalLink, SessaoNpcLink
from app.models.local import Local
from app.models.npc import NPC, NPCStatus, PersonagemTipo
from app.models.sessao import Sessao
from app.models.usuario import Usuario
from app.models.vinculo import Vinculo, VinculoDirecao, VinculoTipo
from app.models.waypoint import MapScale, RouteSegment, RouteTipo, Waypoint
from app.services.auth_admin import assign_owner
from app.services.campanha_admin import (
    DEFAULT_COTA_BYTES,
    ensure_upload_tree,
    validate_slug,
    CampanhaAdminError,
)
from app.services.genre_palette import genero_from_legacy, normalize_genero
from app.services.package_schema import (
    CONTENT_FILENAME,
    COTA_EXCEDIDA,
    ENTRADA_PROIBIDA,
    CONTEUDO_INVALIDO,
    MANIFEST_FILENAME,
    MANIFESTO_INVALIDO,
    PACKAGE_FORMAT,
    PACOTE_INVALIDO,
    PackageError,
    SLUG_INVALIDO,
    SLUG_OCUPADO,
    UPLOAD_CATEGORIES,
    ZIP_DEMASIADO_GRANDE,
    ZIP_MAX_ENTRIES,
    ZIP_SIZE_MARGIN_BYTES,
    is_allowed_zip_member,
    migrate_to_head,
)
from app.services.uploads import reconcile_bytes_usados

logger = logging.getLogger(__name__)

_MEDIA_SLUG_RE = re.compile(
    r"(?:/api/c/|/uploads/c/)(?P<slug>[^/]+)/(?:media/)?(?P<rest>map|portraits|locals|covers)/(?P<file>[^/?#]+)"
)


def rewrite_media_urls_for_slug(content: dict[str, Any], new_slug: str) -> dict[str, Any]:
    def fix(url: Any) -> Any:
        if not isinstance(url, str) or not url:
            return url
        m = _MEDIA_SLUG_RE.search(url)
        if not m:
            return url
        return f"/api/c/{new_slug}/media/{m.group('rest')}/{m.group('file')}"

    out = dict(content)
    npcs = []
    for row in content.get("npcs") or []:
        r = dict(row)
        r["retrato_url"] = fix(r.get("retrato_url"))
        npcs.append(r)
    out["npcs"] = npcs
    locais = []
    for row in content.get("locais") or []:
        r = dict(row)
        r["imagem_url"] = fix(r.get("imagem_url"))
        locais.append(r)
    out["locais"] = locais
    return out


def _basename_from_media_url(url: str | None) -> str | None:
    if not url:
        return None
    m = _MEDIA_SLUG_RE.search(url)
    if m:
        return m.group("file")
    # bare filename
    name = Path(url).name
    return name if name else None


def _validate_fks(content: dict[str, Any]) -> None:
    arco_ids = {r["id"] for r in content.get("arcos") or [] if r.get("id") is not None}
    npc_ids = {r["id"] for r in content.get("npcs") or [] if r.get("id") is not None}
    local_ids = {r["id"] for r in content.get("locais") or [] if r.get("id") is not None}
    wp_ids = {r["id"] for r in content.get("waypoints") or [] if r.get("id") is not None}

    for loc in content.get("locais") or []:
        aid = loc.get("arco_id")
        if aid is not None and aid not in arco_ids:
            raise PackageError(CONTEUDO_INVALIDO)
    for link in content.get("local_npc") or []:
        if link.get("local_id") not in local_ids or link.get("npc_id") not in npc_ids:
            raise PackageError(CONTEUDO_INVALIDO)
    sessao_ids = {r["id"] for r in content.get("sessoes") or [] if r.get("id") is not None}
    for link in content.get("sessao_local") or []:
        if link.get("sessao_id") not in sessao_ids or link.get("local_id") not in local_ids:
            raise PackageError(CONTEUDO_INVALIDO)
    for link in content.get("sessao_npc") or []:
        if link.get("sessao_id") not in sessao_ids or link.get("npc_id") not in npc_ids:
            raise PackageError(CONTEUDO_INVALIDO)
    for link in content.get("local_conexao") or []:
        if link.get("origem_id") not in local_ids or link.get("destino_id") not in local_ids:
            raise PackageError(CONTEUDO_INVALIDO)
    for v in content.get("vinculos") or []:
        if v.get("personagem_a_id") not in npc_ids or v.get("personagem_b_id") not in npc_ids:
            raise PackageError(CONTEUDO_INVALIDO)
    for wp in content.get("waypoints") or []:
        lid = wp.get("local_id")
        if lid is not None and lid not in local_ids:
            raise PackageError(CONTEUDO_INVALIDO)
    for seg in content.get("route_segments") or []:
        if seg.get("waypoint_a_id") not in wp_ids or seg.get("waypoint_b_id") not in wp_ids:
            raise PackageError(CONTEUDO_INVALIDO)


def _referenced_images(manifest: dict[str, Any], content: dict[str, Any]) -> set[tuple[str, str]]:
    refs: set[tuple[str, str]] = set()
    mapa = (manifest.get("mapa_arquivo") or "").strip()
    if mapa:
        refs.add(("map", Path(mapa).name))
    capa = (manifest.get("capa_arquivo") or "").strip()
    if capa:
        refs.add(("covers", Path(capa).name))
    for npc in content.get("npcs") or []:
        name = _basename_from_media_url(npc.get("retrato_url"))
        if name:
            refs.add(("portraits", name))
    for loc in content.get("locais") or []:
        name = _basename_from_media_url(loc.get("imagem_url"))
        if name:
            refs.add(("locals", name))
    return refs


def _read_zip_members(zip_path: Path) -> tuple[dict[str, bytes], int]:
    try:
        zf = zipfile.ZipFile(zip_path, "r")
    except zipfile.BadZipFile as exc:
        raise PackageError(PACOTE_INVALIDO) from exc

    with zf:
        infos = zf.infolist()
        if len(infos) > ZIP_MAX_ENTRIES:
            raise PackageError(ZIP_DEMASIADO_GRANDE)
        total_uncomp = 0
        members: dict[str, bytes] = {}
        for info in infos:
            name = info.filename.replace("\\", "/").lstrip("/")
            if not name or name.endswith("/"):
                continue
            if name.startswith("/") or name.startswith("..") or "/../" in f"/{name}/":
                raise PackageError(ENTRADA_PROIBIDA)
            if ".." in Path(name).parts:
                raise PackageError(ENTRADA_PROIBIDA)
            if not is_allowed_zip_member(name):
                raise PackageError(ENTRADA_PROIBIDA)
            total_uncomp += max(info.file_size, 0)
            if total_uncomp > DEFAULT_COTA_BYTES + ZIP_SIZE_MARGIN_BYTES:
                raise PackageError(ZIP_DEMASIADO_GRANDE)
            members[name] = zf.read(info)
        return members, total_uncomp


def _parse_manifest_content(
    members: dict[str, bytes],
) -> tuple[dict[str, Any], dict[str, Any], dict[tuple[str, str], bytes]]:
    if MANIFEST_FILENAME not in members or CONTENT_FILENAME not in members:
        raise PackageError(MANIFESTO_INVALIDO if MANIFEST_FILENAME not in members else CONTEUDO_INVALIDO)
    try:
        manifest = json.loads(members[MANIFEST_FILENAME].decode("utf-8"))
        content = json.loads(members[CONTENT_FILENAME].decode("utf-8"))
    except (UnicodeDecodeError, json.JSONDecodeError) as exc:
        raise PackageError(MANIFESTO_INVALIDO) from exc
    if not isinstance(manifest, dict) or not isinstance(content, dict):
        raise PackageError(MANIFESTO_INVALIDO)
    fmt = manifest.get("package_format")
    if fmt is not None and int(fmt) > PACKAGE_FORMAT:
        raise PackageError(MANIFESTO_INVALIDO)
    for key in ("schema_version", "sistema", "slug_origem", "nome", "visibilidade"):
        if key not in manifest:
            raise PackageError(MANIFESTO_INVALIDO)
    if "modulos_ativos" not in manifest:
        raise PackageError(MANIFESTO_INVALIDO)

    images: dict[tuple[str, str], bytes] = {}
    for name, data in members.items():
        if name in (MANIFEST_FILENAME, CONTENT_FILENAME):
            continue
        parts = name.split("/")
        images[(parts[1], parts[2])] = data
    return manifest, content, images


def validate_package_members(
    members: dict[str, bytes],
) -> tuple[dict[str, Any], dict[str, Any], dict[tuple[str, str], bytes]]:
    manifest, content, images = _parse_manifest_content(members)
    manifest, content = migrate_to_head(manifest, content)
    _validate_fks(content)
    refs = _referenced_images(manifest, content)
    for cat, fname in refs:
        if (cat, fname) not in images:
            raise PackageError(CONTEUDO_INVALIDO)
    image_bytes = sum(len(v) for v in images.values())
    if image_bytes > DEFAULT_COTA_BYTES:
        raise PackageError(COTA_EXCEDIDA)
    return manifest, content, images


def resolve_import_slug(manifest: dict[str, Any], override: str | None) -> str:
    if override:
        slug = override.strip()
        try:
            validate_slug(slug)
        except CampanhaAdminError as exc:
            raise PackageError(SLUG_INVALIDO) from exc
    else:
        slug = str(manifest.get("slug_origem") or "").strip()
        try:
            validate_slug(slug)
        except CampanhaAdminError as exc:
            raise PackageError(SLUG_INVALIDO) from exc

    with Session(get_control_engine()) as session:
        existing = session.exec(select(Campanha).where(Campanha.slug == slug)).first()
        if existing is not None:
            raise PackageError(SLUG_OCUPADO)
    return slug


def _insert_content(session: Session, content: dict[str, Any]) -> None:
    for row in content.get("arcos") or []:
        session.add(Arco(**{k: v for k, v in row.items() if k in Arco.model_fields}))
    session.flush()
    for row in content.get("npcs") or []:
        data = {k: v for k, v in row.items() if k in NPC.model_fields}
        if "tipo" in data and isinstance(data["tipo"], str):
            data["tipo"] = PersonagemTipo(data["tipo"])
        if "status" in data and isinstance(data["status"], str):
            data["status"] = NPCStatus(data["status"])
        session.add(NPC(**data))
    session.flush()
    for row in content.get("locais") or []:
        session.add(Local(**{k: v for k, v in row.items() if k in Local.model_fields}))
    session.flush()
    for row in content.get("local_npc") or []:
        session.add(LocalNPCLink(local_id=row["local_id"], npc_id=row["npc_id"]))
    for row in content.get("local_conexao") or []:
        session.add(
            LocalConexaoLink(origem_id=row["origem_id"], destino_id=row["destino_id"])
        )
    for row in content.get("grupo_posicao") or []:
        data = {k: v for k, v in row.items() if k in GrupoPosicao.model_fields}
        if isinstance(data.get("atualizado_em"), str):
            data["atualizado_em"] = datetime.fromisoformat(data["atualizado_em"])
        session.add(GrupoPosicao(**data))
    for row in content.get("vinculos") or []:
        data = {k: v for k, v in row.items() if k in Vinculo.model_fields}
        for ek, enum_cls in (
            ("tipo_ab", VinculoTipo),
            ("tipo_ba", VinculoTipo),
            ("direcao", VinculoDirecao),
        ):
            if data.get(ek) is not None and isinstance(data[ek], str):
                data[ek] = enum_cls(data[ek])
        session.add(Vinculo(**data))
    session.flush()
    for row in content.get("waypoints") or []:
        session.add(Waypoint(**{k: v for k, v in row.items() if k in Waypoint.model_fields}))
    session.flush()
    for row in content.get("route_segments") or []:
        data = {k: v for k, v in row.items() if k in RouteSegment.model_fields}
        if isinstance(data.get("tipo"), str):
            data["tipo"] = RouteTipo(data["tipo"])
        session.add(RouteSegment(**data))
    ms = content.get("map_scale")
    if isinstance(ms, dict):
        session.add(MapScale(**{k: v for k, v in ms.items() if k in MapScale.model_fields}))
    session.flush()
    for row in content.get("sessoes") or []:
        session.add(Sessao(**{k: v for k, v in row.items() if k in Sessao.model_fields}))
    session.flush()
    for row in content.get("sessao_local") or []:
        session.add(SessaoLocalLink(sessao_id=row["sessao_id"], local_id=row["local_id"]))
    for row in content.get("sessao_npc") or []:
        session.add(SessaoNpcLink(sessao_id=row["sessao_id"], npc_id=row["npc_id"]))
    session.commit()


def _resolve_manifest_genero(manifest: dict[str, Any]) -> str:
    raw = manifest.get("genero")
    if raw is not None and str(raw).strip() != "":
        try:
            return normalize_genero(str(raw).strip())
        except ValueError as exc:
            raise PackageError(str(exc)) from None
    acento = manifest.get("acento_id")
    acento_s = str(acento).strip() if acento else None
    return genero_from_legacy(str(manifest.get("sistema") or ""), acento_s)


def import_campaign_from_zip(
    zip_path: Path,
    *,
    owner_email: str,
    slug_override: str | None = None,
) -> Campanha:
    members, _ = _read_zip_members(Path(zip_path))
    manifest, content, images = validate_package_members(members)
    slug = resolve_import_slug(manifest, slug_override)
    content = rewrite_media_urls_for_slug(content, slug)

    camp_uuid = str(uuid.uuid4())
    caminho = f"campanhas/{camp_uuid}"
    site = campaign_site_path(caminho)
    control = get_control_engine()

    try:
        site.mkdir(parents=True, exist_ok=False)
        ensure_upload_tree(site)
        db_file = campaign_db_path(caminho)
        db_file.touch()
        camp_engine = get_campaign_engine(camp_uuid, caminho)
        ensure_campaign_schema(camp_engine, fresh=True)

        with Session(camp_engine) as session:
            _insert_content(session, content)

        uploads = campaign_uploads_path(caminho)
        for (cat, fname), data in images.items():
            dest = uploads / cat / fname
            dest.write_bytes(data)

        row = Campanha(
            slug=slug,
            nome=str(manifest["nome"]),
            sistema=str(manifest["sistema"]),
            genero=_resolve_manifest_genero(manifest),
            modulos_ativos=list(manifest.get("modulos_ativos") or []),
            visibilidade=str(manifest.get("visibilidade") or "listada"),
            caminho=caminho,
            mapa_arquivo=str(manifest.get("mapa_arquivo") or ""),
            capa_arquivo=str(manifest.get("capa_arquivo") or ""),
            cota_bytes=DEFAULT_COTA_BYTES,
            bytes_usados=0,
            activa=True,
        )
        with Session(control) as session:
            session.add(row)
            session.commit()
            session.refresh(row)
            session.expunge(row)
            assign_owner(session, slug, owner_email)

        reconcile_bytes_usados(slug)
        with Session(control) as session:
            refreshed = session.exec(select(Campanha).where(Campanha.slug == slug)).first()
            assert refreshed is not None
            session.expunge(refreshed)
            return refreshed
    except PackageError:
        if site.exists():
            shutil.rmtree(site, ignore_errors=True)
        with Session(control) as session:
            orphan = session.exec(select(Campanha).where(Campanha.caminho == caminho)).first()
            if orphan is not None:
                session.delete(orphan)
                session.commit()
        raise
    except Exception:
        logger.exception("import_failed")
        if site.exists():
            shutil.rmtree(site, ignore_errors=True)
        with Session(control) as session:
            orphan = session.exec(select(Campanha).where(Campanha.caminho == caminho)).first()
            if orphan is not None:
                session.delete(orphan)
                session.commit()
        raise


def import_campaign_from_bytes(
    data: bytes,
    *,
    owner_email: str,
    slug_override: str | None = None,
) -> Campanha:
    with tempfile.NamedTemporaryFile(suffix=".zip", delete=False) as tmp:
        tmp.write(data)
        path = Path(tmp.name)
    try:
        return import_campaign_from_zip(
            path, owner_email=owner_email, slug_override=slug_override
        )
    finally:
        path.unlink(missing_ok=True)


def owner_email_exists(email: str) -> bool:
    from app.services.auth_admin import normalize_email

    with Session(get_control_engine()) as session:
        user = session.exec(
            select(Usuario).where(Usuario.email == normalize_email(email))
        ).first()
        return user is not None and bool(user.activo)
