from __future__ import annotations

from dataclasses import dataclass

from sqlmodel import Session

from app.models.arco import Arco
from app.models.evento import Evento
from app.models.links import EventoLocalLink, EventoNpcLink, SessaoLocalLink, SessaoNpcLink
from app.models.local import Local
from app.models.npc import NPC, PersonagemTipo
from app.models.sessao import Sessao
from app.models.vinculo import Vinculo, VinculoTipo
from app.models.waypoint import RouteSegment, RouteTipo, Waypoint
from app.campaign_db import campaign_uploads_path, lookup_campanha
from app.services.media_paths import media_url


def _pair(a: int, b: int) -> tuple[int, int]:
    return (a, b) if a < b else (b, a)


def seed_arco(
    session: Session,
    *,
    titulo: str = "Arco teste",
    ordem: int = 1,
    visivel: bool = True,
) -> Arco:
    row = Arco(titulo=titulo, resumo="Resumo", ordem=ordem, visivel_para_todos=visivel)
    session.add(row)
    session.commit()
    session.refresh(row)
    assert row.id is not None
    return row


def seed_local(
    session: Session,
    *,
    nome: str = "Local teste",
    arco_id: int | None = None,
    visivel: bool = True,
) -> Local:
    row = Local(
        nome=nome,
        descricao="",
        x=0.3,
        y=0.4,
        arco_id=arco_id,
        visivel_para_todos=visivel,
    )
    session.add(row)
    session.commit()
    session.refresh(row)
    assert row.id is not None
    return row


def seed_personagem(
    session: Session,
    *,
    nome: str,
    visivel: bool = True,
    tipo: PersonagemTipo = PersonagemTipo.pj,
) -> NPC:
    row = NPC(
        nome=nome,
        tipo=tipo,
        visivel_para_todos=visivel,
        descricao="",
    )
    session.add(row)
    session.commit()
    session.refresh(row)
    assert row.id is not None
    return row


def seed_sessao(
    session: Session,
    *,
    numero: int,
    titulo: str = "Sessão",
    visivel: bool = True,
    data_rotulo: str | None = None,
    resumo: str = "",
    local_ids: list[int] | None = None,
    personagem_ids: list[int] | None = None,
) -> Sessao:
    row = Sessao(
        numero=numero,
        titulo=titulo,
        data_rotulo=data_rotulo,
        resumo=resumo,
        visivel_para_todos=visivel,
    )
    session.add(row)
    session.commit()
    session.refresh(row)
    assert row.id is not None
    for lid in local_ids or []:
        session.add(SessaoLocalLink(sessao_id=row.id, local_id=lid))
    for nid in personagem_ids or []:
        session.add(SessaoNpcLink(sessao_id=row.id, npc_id=nid))
    if local_ids or personagem_ids:
        session.commit()
    return row


def seed_evento(
    session: Session,
    *,
    titulo: str = "Evento",
    ano: int = 2500,
    mes: int | None = None,
    visivel: bool = True,
    rotulo_era: str | None = None,
    descricao: str = "",
    sessao_id: int | None = None,
    local_ids: list[int] | None = None,
    personagem_ids: list[int] | None = None,
) -> Evento:
    row = Evento(
        titulo=titulo,
        ano=ano,
        mes=mes,
        rotulo_era=rotulo_era,
        descricao=descricao,
        sessao_id=sessao_id,
        visivel_para_todos=visivel,
    )
    session.add(row)
    session.commit()
    session.refresh(row)
    assert row.id is not None
    for lid in local_ids or []:
        session.add(EventoLocalLink(evento_id=row.id, local_id=lid))
    for nid in personagem_ids or []:
        session.add(EventoNpcLink(evento_id=row.id, npc_id=nid))
    if local_ids or personagem_ids:
        session.commit()
    return row


def seed_vinculo_publico(session: Session, a_id: int, b_id: int) -> Vinculo:
    pa, pb = _pair(a_id, b_id)
    row = Vinculo(
        personagem_a_id=pa,
        personagem_b_id=pb,
        tipo_ab=VinculoTipo.aliado,
        publico=True,
        conhecido_ab=True,
        conhecido_ba=True,
    )
    session.add(row)
    session.commit()
    session.refresh(row)
    assert row.id is not None
    return row


def seed_waypoints_pair(session: Session) -> tuple[Waypoint, Waypoint]:
    a = Waypoint(nome="Origem", x=0.2, y=0.2)
    b = Waypoint(nome="Destino", x=0.8, y=0.8)
    session.add(a)
    session.add(b)
    session.commit()
    session.refresh(a)
    session.refresh(b)
    assert a.id is not None and b.id is not None
    return a, b


def seed_segment(
    session: Session,
    waypoint_a_id: int,
    waypoint_b_id: int,
    *,
    distancia_milhas: float = 10.0,
) -> RouteSegment:
    row = RouteSegment(
        waypoint_a_id=waypoint_a_id,
        waypoint_b_id=waypoint_b_id,
        tipo=RouteTipo.estrada,
        distancia_milhas=distancia_milhas,
        pontos_intermediarios="[]",
    )
    session.add(row)
    session.commit()
    session.refresh(row)
    assert row.id is not None
    return row


@dataclass
class PublicCatalog:
    arco: Arco
    local: Local
    visivel: NPC
    npc_visivel: NPC
    vinculo: Vinculo


def seed_public_catalog(session: Session) -> PublicCatalog:
    arco = seed_arco(session)
    local = seed_local(session, arco_id=arco.id)
    visivel = seed_personagem(session, nome="PJ Visivel", visivel=True, tipo=PersonagemTipo.pj)
    npc_visivel = seed_personagem(
        session, nome="NPC Visivel", visivel=True, tipo=PersonagemTipo.npc
    )
    vinculo = seed_vinculo_publico(session, visivel.id, npc_visivel.id)  # type: ignore[arg-type]
    return PublicCatalog(
        arco=arco,
        local=local,
        visivel=visivel,
        npc_visivel=npc_visivel,
        vinculo=vinculo,
    )


def seed_exportable_campaign(session: Session, *, slug: str) -> PublicCatalog:
    """Seed content + one portrait + one map file for export/import tests."""
    catalog = seed_public_catalog(session)
    camp = lookup_campanha(slug)
    uploads = campaign_uploads_path(camp.caminho)
    (uploads / "portraits").mkdir(parents=True, exist_ok=True)
    (uploads / "map").mkdir(parents=True, exist_ok=True)
    portrait = uploads / "portraits" / "p1.png"
    portrait.write_bytes(b"\x89PNG\r\n\x1a\n" + b"portrait")
    mapa = uploads / "map" / "mapa1.webp"
    mapa.write_bytes(b"RIFF....WEBP")
    catalog.visivel.retrato_url = media_url(slug, "portraits", "p1.png")
    session.add(catalog.visivel)
    session.commit()
    session.refresh(catalog.visivel)
    from sqlmodel import Session as CtrlSession, select

    from app.campaign_db import get_control_engine
    from app.models.campanha import Campanha

    with CtrlSession(get_control_engine()) as ctrl:
        row = ctrl.exec(select(Campanha).where(Campanha.slug == slug)).first()
        assert row is not None
        row.mapa_arquivo = "mapa1.webp"
        row.bytes_usados = portrait.stat().st_size + mapa.stat().st_size
        ctrl.add(row)
        ctrl.commit()
    return catalog
