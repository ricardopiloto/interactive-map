"""Import a trusted operator instance tree (mapa.db + uploads/) into a new campaign site."""

from __future__ import annotations

import hashlib
import json
import shutil
import sqlite3
from pathlib import Path
from typing import Any

from alembic.runtime.migration import MigrationContext
from sqlalchemy.engine import Engine
from sqlmodel import SQLModel, Session, select

from app.campaign_db import (
    campaign_db_path,
    campaign_site_path,
    campaign_uploads_path,
    ensure_campaign_schema,
    forget_campaign_engine,
    get_campaign_engine,
    get_control_engine,
    init_control,
)
from app.models.campanha import Campanha
from app.models.local import Local
from app.models.npc import NPC
from app.models.usuario import Membro
import app.models.arco  # noqa: F401
import app.models.grupo  # noqa: F401
import app.models.links  # noqa: F401
import app.models.vinculo  # noqa: F401
import app.models.waypoint  # noqa: F401
from app.services.auth_admin import assign_owner
from app.services.campanha_admin import (
    DEFAULT_COTA_BYTES,
    CampanhaAdminError,
    create_campanha,
    ensure_upload_tree,
)
from app.services.campaign_import import owner_email_exists
from app.services.instance_config import _stamp_mapa_arquivo_if_needed
from app.services.uploads import reconcile_bytes_usados
from app.services.url_rewrite import MediaUrlRewriteError, rewrite_legacy_url_for_slug

CONTENT_TABLES = (
    "arco",
    "npc",
    "local",
    "local_npc",
    "local_conexao",
    "grupo_posicao",
    "vinculo",
    "waypoint",
    "route_segment",
    "map_scale",
)


class LegacyImportError(Exception):
    def __init__(self, codigo: str, message: str = "") -> None:
        self.codigo = codigo
        super().__init__(message or codigo)


def resolve_origin_paths(origem: Path) -> tuple[Path, Path]:
    """Return (mapa.db, uploads dir) or raise ORIGEM_INVALIDA."""
    root = Path(origem)
    if not root.is_dir():
        raise LegacyImportError("ORIGEM_INVALIDA")
    db = root / "mapa.db"
    if not db.is_file():
        db = root / "data" / "mapa.db"
    uploads = root / "uploads"
    if not uploads.is_dir():
        uploads = root / "data" / "uploads"
    if not db.is_file() or not uploads.is_dir():
        raise LegacyImportError("ORIGEM_INVALIDA")
    return db.resolve(), uploads.resolve()


def hash_tree(root: Path) -> str:
    digest = hashlib.sha256()
    if not root.exists():
        return digest.hexdigest()
    files = sorted(p for p in root.rglob("*") if p.is_file())
    for path in files:
        rel = path.relative_to(root).as_posix()
        digest.update(rel.encode("utf-8"))
        digest.update(b"\0")
        digest.update(path.read_bytes())
    return digest.hexdigest()


def count_upload_files(uploads: Path) -> int:
    if not uploads.is_dir():
        return 0
    return sum(1 for p in uploads.rglob("*") if p.is_file())


def count_sqlite_tables(db_path: Path) -> dict[str, int]:
    """Missing table counts as 0 (Alembic may add empty tables on dest)."""
    out = {name: 0 for name in CONTENT_TABLES}
    if not db_path.is_file():
        return out
    conn = sqlite3.connect(str(db_path))
    try:
        names = {
            row[0]
            for row in conn.execute(
                "SELECT name FROM sqlite_master WHERE type='table'"
            ).fetchall()
        }
        for name in CONTENT_TABLES:
            if name not in names:
                continue
            (n,) = conn.execute(f'SELECT COUNT(*) FROM "{name}"').fetchone()
            out[name] = int(n)
    finally:
        conn.close()
    return out


def _alembic_revision(engine: Engine) -> str | None:
    with engine.connect() as conn:
        return MigrationContext.configure(conn).get_current_revision()


def _rollback(caminho: str, slug: str) -> None:
    site = campaign_site_path(caminho)
    uuid_key = Path(caminho).name
    forget_campaign_engine(uuid_key)
    if site.exists():
        shutil.rmtree(site, ignore_errors=True)
    with Session(get_control_engine()) as session:
        camp = session.exec(select(Campanha).where(Campanha.slug == slug)).first()
        if camp is None:
            return
        for membro in session.exec(select(Membro).where(Membro.campanha_id == camp.id)).all():
            session.delete(membro)
        session.delete(camp)
        session.commit()


def _chmod_writable(path: Path) -> None:
    if path.is_dir():
        path.chmod(0o755)
        for child in path.rglob("*"):
            if child.is_dir():
                child.chmod(0o755)
            elif child.is_file():
                child.chmod(0o644)
    elif path.is_file():
        path.chmod(0o644)


def _ensure_content_tables(engine: Engine) -> None:
    """Stamp does not CREATE tables missing from a sparse legado DB (093)."""
    SQLModel.metadata.create_all(engine)


def _copy_uploads(origin_uploads: Path, dest_uploads: Path) -> None:
    if dest_uploads.exists():
        shutil.rmtree(dest_uploads)
    shutil.copytree(origin_uploads, dest_uploads)
    _chmod_writable(dest_uploads)
    ensure_upload_tree(dest_uploads.parent)
    map_dir = dest_uploads / "map"
    map_dir.mkdir(parents=True, exist_ok=True)
    for item in list(dest_uploads.iterdir()):
        if item.is_file() and item.name.startswith("campaign-map."):
            item.rename(map_dir / item.name)


def _persist_media_urls(engine: Engine, slug: str) -> None:
    with Session(engine) as session:
        for npc in session.exec(select(NPC)).all():
            try:
                npc.retrato_url = rewrite_legacy_url_for_slug(npc.retrato_url, slug)
            except MediaUrlRewriteError as exc:
                raise LegacyImportError("URL_MIDIA_DESCONHECIDA") from exc
            session.add(npc)
        for loc in session.exec(select(Local)).all():
            try:
                loc.imagem_url = rewrite_legacy_url_for_slug(loc.imagem_url, slug)
            except MediaUrlRewriteError as exc:
                raise LegacyImportError("URL_MIDIA_DESCONHECIDA") from exc
            session.add(loc)
        session.commit()


def _build_report(
    *,
    origem: Path,
    origin_db: Path,
    origin_uploads: Path,
    dest_db: Path,
    dest_uploads: Path,
    slug: str,
    uuid_key: str,
    alembic_rev: str | None,
    origin_hash_before: str,
    origin_hash_after: str,
) -> dict[str, Any]:
    antes = count_sqlite_tables(origin_db)
    depois = count_sqlite_tables(dest_db)
    tabelas = {
        name: {"antes": antes[name], "depois": depois[name]} for name in CONTENT_TABLES
    }
    files_before = count_upload_files(origin_uploads)
    files_after = count_upload_files(dest_uploads)
    intact = origin_hash_before == origin_hash_after
    counts_ok = all(antes[n] == depois[n] for n in CONTENT_TABLES)
    files_ok = files_before == files_after
    resultado = "PASS" if counts_ok and files_ok and intact and alembic_rev else "FAIL"
    return {
        "origem": str(origem),
        "destino_slug": slug,
        "destino_uuid": uuid_key,
        "tabelas": tabelas,
        "ficheiros_uploads": {"antes": files_before, "depois": files_after},
        "alembic_destino": alembic_rev,
        "origem_intacta": intact,
        "resultado": resultado,
    }


def import_legacy_instance(
    origem: Path,
    *,
    slug: str,
    sistema: str,
    nome: str,
    email: str,
    visibilidade: str = "listada",
    cota_bytes: int | None = None,
    relatorio_path: Path | None = None,
) -> tuple[Campanha, dict[str, Any]]:
    init_control()
    origin_db, origin_uploads = resolve_origin_paths(origem)
    origin_root = Path(origem).resolve()
    origin_hash_before = hash_tree(origin_root)

    if not owner_email_exists(email):
        raise LegacyImportError("USUARIO_NAO_ENCONTRADO")

    cap = DEFAULT_COTA_BYTES if cota_bytes is None else int(cota_bytes)
    if cap <= 0:
        raise LegacyImportError("COTA_EXCEDIDA")

    row: Campanha | None = None
    caminho = ""
    try:
        row = create_campanha(
            slug=slug,
            nome=nome,
            sistema=sistema,
            visibilidade=visibilidade,
        )
        caminho = row.caminho
        uuid_key = Path(caminho).name
        forget_campaign_engine(uuid_key)

        dest_db = campaign_db_path(caminho)
        dest_db.unlink(missing_ok=True)
        shutil.copy2(origin_db, dest_db)
        dest_db.chmod(0o644)

        dest_uploads = campaign_uploads_path(caminho)
        _copy_uploads(origin_uploads, dest_uploads)

        engine = get_campaign_engine(uuid_key, caminho)
        ensure_campaign_schema(engine, fresh=False)
        _ensure_content_tables(engine)
        _persist_media_urls(engine, slug)

        with Session(get_control_engine()) as session:
            camp = session.exec(select(Campanha).where(Campanha.slug == slug)).one()
            camp.cota_bytes = cap
            session.add(camp)
            session.commit()

        camp = _stamp_mapa_arquivo_if_needed(
            lookup_by_slug(slug)
        )
        with Session(get_control_engine()) as session:
            assign_owner(session, slug, email)

        camp = reconcile_bytes_usados(slug)
        if camp.bytes_usados > camp.cota_bytes:
            raise LegacyImportError("COTA_EXCEDIDA")

        alembic_rev = _alembic_revision(engine)
        origin_hash_after = hash_tree(origin_root)
        report = _build_report(
            origem=origin_root,
            origin_db=origin_db,
            origin_uploads=origin_uploads,
            dest_db=dest_db,
            dest_uploads=dest_uploads,
            slug=slug,
            uuid_key=uuid_key,
            alembic_rev=alembic_rev,
            origin_hash_before=origin_hash_before,
            origin_hash_after=origin_hash_after,
        )
        if relatorio_path is not None:
            relatorio_path.write_text(
                json.dumps(report, indent=2, ensure_ascii=False) + "\n",
                encoding="utf-8",
            )
        if report["resultado"] != "PASS":
            raise LegacyImportError("CONTAGEM_DIVERGENTE")

        with Session(get_control_engine()) as session:
            out = session.exec(select(Campanha).where(Campanha.slug == slug)).one()
            session.expunge(out)
            return out, report
    except LegacyImportError:
        if caminho:
            _rollback(caminho, slug)
        raise
    except CampanhaAdminError:
        if caminho:
            _rollback(caminho, slug)
        raise
    except Exception:
        if caminho:
            _rollback(caminho, slug)
        raise


def lookup_by_slug(slug: str) -> Campanha:
    with Session(get_control_engine()) as session:
        row = session.exec(select(Campanha).where(Campanha.slug == slug)).one()
        session.expunge(row)
        return row
