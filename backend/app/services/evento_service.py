"""Evento timeline service: ordering, visibility, link sync."""

from __future__ import annotations

from sqlalchemy import nulls_last
from sqlmodel import Session, col, select

from app.errors import raise_api_error
from app.models.evento import Evento
from app.models.links import EventoLocalLink, EventoNpcLink
from app.models.local import Local
from app.models.npc import NPC
from app.models.sessao import Sessao
from app.schemas.evento import (
    EventoAdmin,
    EventoCreate,
    EventoPublic,
    EventoRefLocal,
    EventoRefPersonagem,
    EventoUpdate,
)
from app.services.visibility import is_visivel_para_jogador


def is_evento_visivel_publico(evento: Evento | None) -> bool:
    if evento is None:
        return False
    return bool(getattr(evento, "visivel_para_todos", True))


def _ordered_eventos(session: Session, *, only_public: bool) -> list[Evento]:
    """ano ASC, mes ASC (nulls last), sessao.numero ASC (nulls last), id ASC."""
    stmt = (
        select(Evento)
        .outerjoin(Sessao, Evento.sessao_id == Sessao.id)
        .order_by(
            col(Evento.ano).asc(),
            nulls_last(col(Evento.mes).asc()),
            nulls_last(col(Sessao.numero).asc()),
            col(Evento.id).asc(),
        )
    )
    if only_public:
        stmt = stmt.where(Evento.visivel_para_todos == True)  # noqa: E712
    return list(session.exec(stmt).all())


def _load_links(session: Session, evento_id: int) -> tuple[list[Local], list[NPC]]:
    local_ids = list(
        session.exec(
            select(EventoLocalLink.local_id).where(EventoLocalLink.evento_id == evento_id)
        ).all()
    )
    npc_ids = list(
        session.exec(
            select(EventoNpcLink.npc_id).where(EventoNpcLink.evento_id == evento_id)
        ).all()
    )
    locais: list[Local] = []
    if local_ids:
        locais = list(session.exec(select(Local).where(col(Local.id).in_(local_ids))).all())
    npcs: list[NPC] = []
    if npc_ids:
        npcs = list(session.exec(select(NPC).where(col(NPC.id).in_(npc_ids))).all())
    return locais, npcs


def to_public(session: Session, evento: Evento, *, filter_hidden: bool) -> EventoPublic:
    assert evento.id is not None
    locais, npcs = _load_links(session, evento.id)
    personagens = [
        EventoRefPersonagem(
            id=n.id,  # type: ignore[arg-type]
            nome=n.nome,
            tipo=(n.tipo.value if hasattr(n.tipo, "value") else str(n.tipo)),
            retrato_url=getattr(n, "retrato_url", None),
        )
        for n in npcs
        if n.id is not None and (not filter_hidden or is_visivel_para_jogador(n))
    ]
    return EventoPublic(
        id=evento.id,
        titulo=evento.titulo,
        ano=evento.ano,
        mes=evento.mes,
        rotulo_era=evento.rotulo_era,
        descricao=evento.descricao or "",
        sessao_id=evento.sessao_id,
        locais=[
            EventoRefLocal(id=loc.id, nome=loc.nome)  # type: ignore[arg-type]
            for loc in locais
            if loc.id is not None and (not filter_hidden or is_visivel_para_jogador(loc))
        ],
        personagens=personagens,
    )


def to_admin(session: Session, evento: Evento) -> EventoAdmin:
    base = to_public(session, evento, filter_hidden=False)
    return EventoAdmin(
        **base.model_dump(),
        visivel_para_todos=bool(evento.visivel_para_todos),
    )


def list_public(session: Session) -> list[EventoPublic]:
    return [to_public(session, e, filter_hidden=True) for e in _ordered_eventos(session, only_public=True)]


def list_admin(session: Session) -> list[EventoAdmin]:
    return [to_admin(session, e) for e in _ordered_eventos(session, only_public=False)]


def get_public(session: Session, evento_id: int) -> EventoPublic:
    evento = session.get(Evento, evento_id)
    if not evento or not is_evento_visivel_publico(evento):
        raise_api_error("EVENTO_NAO_ENCONTRADO", status_code=404)
    return to_public(session, evento, filter_hidden=True)


def get_admin(session: Session, evento_id: int) -> EventoAdmin:
    evento = session.get(Evento, evento_id)
    if not evento:
        raise_api_error("EVENTO_NAO_ENCONTRADO", status_code=404)
    return to_admin(session, evento)


def _validate_sessao(session: Session, sessao_id: int | None) -> None:
    if sessao_id is None:
        return
    if session.get(Sessao, sessao_id) is None:
        raise_api_error("SESSAO_NAO_ENCONTRADA", status_code=400)


def _replace_links(
    session: Session,
    evento_id: int,
    *,
    local_ids: list[int] | None,
    personagem_ids: list[int] | None,
) -> None:
    if local_ids is not None:
        for link in session.exec(
            select(EventoLocalLink).where(EventoLocalLink.evento_id == evento_id)
        ).all():
            session.delete(link)
        for lid in local_ids:
            loc = session.get(Local, lid)
            if loc is None:
                raise_api_error("LOCAL_NAO_ENCONTRADO", status_code=400)
            session.add(EventoLocalLink(evento_id=evento_id, local_id=lid))
    if personagem_ids is not None:
        for link in session.exec(
            select(EventoNpcLink).where(EventoNpcLink.evento_id == evento_id)
        ).all():
            session.delete(link)
        missing: list[int] = []
        for nid in personagem_ids:
            npc = session.get(NPC, nid)
            if npc is None:
                missing.append(nid)
            else:
                session.add(EventoNpcLink(evento_id=evento_id, npc_id=nid))
        if missing:
            raise_api_error(
                "NPCS_NAO_ENCONTRADOS",
                status_code=400,
                detalhes={"ids": missing},
            )


def create_evento(session: Session, payload: EventoCreate) -> EventoAdmin:
    _validate_sessao(session, payload.sessao_id)
    row = Evento(
        titulo=payload.titulo.strip(),
        ano=payload.ano,
        mes=payload.mes,
        rotulo_era=(payload.rotulo_era.strip() if payload.rotulo_era else None) or None,
        descricao=payload.descricao or "",
        sessao_id=payload.sessao_id,
        visivel_para_todos=payload.visivel_para_todos,
    )
    session.add(row)
    session.flush()
    assert row.id is not None
    _replace_links(
        session,
        row.id,
        local_ids=payload.local_ids,
        personagem_ids=payload.personagem_ids,
    )
    session.commit()
    session.refresh(row)
    return to_admin(session, row)


def update_evento(session: Session, evento_id: int, payload: EventoUpdate) -> EventoAdmin:
    row = session.get(Evento, evento_id)
    if not row:
        raise_api_error("EVENTO_NAO_ENCONTRADO", status_code=404)
    data = payload.model_dump(exclude_unset=True)
    local_ids = data.pop("local_ids", None)
    personagem_ids = data.pop("personagem_ids", None)
    if "sessao_id" in data:
        _validate_sessao(session, data["sessao_id"])
    if "titulo" in data and isinstance(data["titulo"], str):
        data["titulo"] = data["titulo"].strip()
    if "rotulo_era" in data:
        raw = data["rotulo_era"]
        data["rotulo_era"] = (raw.strip() if isinstance(raw, str) and raw else None) or None
    for key, value in data.items():
        setattr(row, key, value)
    session.add(row)
    session.flush()
    _replace_links(
        session,
        evento_id,
        local_ids=local_ids,
        personagem_ids=personagem_ids,
    )
    session.commit()
    session.refresh(row)
    return to_admin(session, row)


def delete_evento(session: Session, evento_id: int) -> None:
    row = session.get(Evento, evento_id)
    if not row:
        raise_api_error("EVENTO_NAO_ENCONTRADO", status_code=404)
    for link in session.exec(
        select(EventoLocalLink).where(EventoLocalLink.evento_id == evento_id)
    ).all():
        session.delete(link)
    for link in session.exec(
        select(EventoNpcLink).where(EventoNpcLink.evento_id == evento_id)
    ).all():
        session.delete(link)
    session.delete(row)
    session.commit()
