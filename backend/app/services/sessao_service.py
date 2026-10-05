"""Sessão chronicle service: numbering, visibility, link sync."""

from __future__ import annotations

from sqlalchemy.exc import IntegrityError
from sqlmodel import Session, col, select

from app.errors import raise_api_error
from app.models.arco import Arco
from app.models.links import ItemSessaoLink, SessaoLocalLink, SessaoNpcLink
from app.schemas.descoberta import AlertaInconsistencia
from app.models.local import Local
from app.models.npc import NPC
from app.models.sessao import Sessao
from app.schemas.sessao import (
    SessaoAdmin,
    SessaoCreate,
    SessaoPublic,
    SessaoRefLocal,
    SessaoRefPersonagem,
    SessaoUpdate,
)
from app.services.visibility import is_visivel_para_jogador


def proximo_numero(session: Session) -> int:
    rows = list(session.exec(select(Sessao.numero)).all())
    if not rows:
        return 1
    return max(int(n) for n in rows) + 1


def is_sessao_visivel_publica(sessao: Sessao | None) -> bool:
    if sessao is None:
        return False
    return bool(getattr(sessao, "visivel_para_todos", True))


def _load_links(session: Session, sessao_id: int) -> tuple[list[Local], list[NPC]]:
    local_ids = list(
        session.exec(
            select(SessaoLocalLink.local_id).where(SessaoLocalLink.sessao_id == sessao_id)
        ).all()
    )
    npc_ids = list(
        session.exec(
            select(SessaoNpcLink.npc_id).where(SessaoNpcLink.sessao_id == sessao_id)
        ).all()
    )
    locais: list[Local] = []
    if local_ids:
        locais = list(session.exec(select(Local).where(col(Local.id).in_(local_ids))).all())
    npcs: list[NPC] = []
    if npc_ids:
        npcs = list(session.exec(select(NPC).where(col(NPC.id).in_(npc_ids))).all())
    return locais, npcs


def to_public(session: Session, sessao: Sessao, *, filter_hidden_npcs: bool) -> SessaoPublic:
    assert sessao.id is not None
    locais, npcs = _load_links(session, sessao.id)
    personagens = [
        SessaoRefPersonagem(
            id=n.id,  # type: ignore[arg-type]
            nome=n.nome,
            tipo=(n.tipo.value if hasattr(n.tipo, "value") else str(n.tipo)),
        )
        for n in npcs
        if n.id is not None and (not filter_hidden_npcs or is_visivel_para_jogador(n))
    ]
    return SessaoPublic(
        id=sessao.id,
        numero=sessao.numero,
        titulo=sessao.titulo,
        data_rotulo=sessao.data_rotulo,
        resumo=sessao.resumo or "",
        locais=[
            SessaoRefLocal(id=loc.id, nome=loc.nome)  # type: ignore[arg-type]
            for loc in locais
            if loc.id is not None
            and (not filter_hidden_npcs or is_visivel_para_jogador(loc))
        ],
        personagens=personagens,
        arco_id=sessao.arco_id,
        arco_transicao_id=sessao.arco_transicao_id,
    )


def to_admin(
    session: Session,
    sessao: Sessao,
    *,
    alertas: list[AlertaInconsistencia] | None = None,
) -> SessaoAdmin:
    base = to_public(session, sessao, filter_hidden_npcs=False)
    return SessaoAdmin(
        **base.model_dump(),
        visivel_para_todos=bool(sessao.visivel_para_todos),
        alertas_inconsistencia=list(alertas or []),
    )


def list_public(session: Session) -> list[SessaoPublic]:
    rows = list(
        session.exec(
            select(Sessao)
            .where(Sessao.visivel_para_todos == True)  # noqa: E712
            .order_by(col(Sessao.numero).desc(), col(Sessao.id).desc())
        ).all()
    )
    return [to_public(session, s, filter_hidden_npcs=True) for s in rows]


def list_admin(
    session: Session,
    *,
    alertas_por_id: dict[int, list[AlertaInconsistencia]] | None = None,
) -> list[SessaoAdmin]:
    rows = list(
        session.exec(
            select(Sessao).order_by(col(Sessao.numero).desc(), col(Sessao.id).desc())
        ).all()
    )
    mapa = alertas_por_id or {}
    return [to_admin(session, s, alertas=mapa.get(s.id or 0, [])) for s in rows]


def get_public(session: Session, sessao_id: int) -> SessaoPublic:
    sessao = session.get(Sessao, sessao_id)
    if not sessao or not is_sessao_visivel_publica(sessao):
        raise_api_error("SESSAO_NAO_ENCONTRADA", status_code=404)
    return to_public(session, sessao, filter_hidden_npcs=True)


def get_admin(
    session: Session,
    sessao_id: int,
    *,
    alertas: list[AlertaInconsistencia] | None = None,
) -> SessaoAdmin:
    sessao = session.get(Sessao, sessao_id)
    if not sessao:
        raise_api_error("SESSAO_NAO_ENCONTRADA", status_code=404)
    return to_admin(session, sessao, alertas=alertas)


def _replace_links(
    session: Session,
    sessao_id: int,
    *,
    local_ids: list[int] | None,
    personagem_ids: list[int] | None,
) -> None:
    if local_ids is not None:
        for link in session.exec(
            select(SessaoLocalLink).where(SessaoLocalLink.sessao_id == sessao_id)
        ).all():
            session.delete(link)
        for lid in local_ids:
            loc = session.get(Local, lid)
            if loc is None:
                raise_api_error("LOCAL_NAO_ENCONTRADO", status_code=400)
            session.add(SessaoLocalLink(sessao_id=sessao_id, local_id=lid))
    if personagem_ids is not None:
        for link in session.exec(
            select(SessaoNpcLink).where(SessaoNpcLink.sessao_id == sessao_id)
        ).all():
            session.delete(link)
        missing: list[int] = []
        for nid in personagem_ids:
            npc = session.get(NPC, nid)
            if npc is None:
                missing.append(nid)
            else:
                session.add(SessaoNpcLink(sessao_id=sessao_id, npc_id=nid))
        if missing:
            raise_api_error(
                "NPCS_NAO_ENCONTRADOS",
                status_code=400,
                detalhes={"ids": missing},
            )


def _validate_arco_vinculo(
    session: Session, arco_id: int | None, arco_transicao_id: int | None
) -> None:
    """Enforce: at most one arc per session, except the transition exception (FR-004)."""
    if arco_id is not None and session.get(Arco, arco_id) is None:
        raise_api_error("ARCO_NAO_ENCONTRADO", status_code=400)
    if arco_transicao_id is not None:
        if session.get(Arco, arco_transicao_id) is None:
            raise_api_error("ARCO_NAO_ENCONTRADO", status_code=400)
        if arco_id is None:
            raise_api_error("SESSAO_TRANSICAO_SEM_ARCO", status_code=400)
        if arco_transicao_id == arco_id:
            raise_api_error("SESSAO_TRANSICAO_ARCO_IGUAL", status_code=400)


def create_sessao(session: Session, payload: SessaoCreate) -> SessaoAdmin:
    _validate_arco_vinculo(session, payload.arco_id, payload.arco_transicao_id)
    row = Sessao(
        numero=payload.numero,
        titulo=payload.titulo.strip(),
        data_rotulo=(payload.data_rotulo.strip() if payload.data_rotulo else None) or None,
        resumo=payload.resumo or "",
        visivel_para_todos=payload.visivel_para_todos,
        arco_id=payload.arco_id,
        arco_transicao_id=payload.arco_transicao_id,
    )
    session.add(row)
    try:
        session.flush()
    except IntegrityError:
        session.rollback()
        raise_api_error("NUMERO_DUPLICADO", status_code=400)
    assert row.id is not None
    _replace_links(
        session,
        row.id,
        local_ids=payload.local_ids,
        personagem_ids=payload.personagem_ids,
    )
    try:
        session.commit()
        session.refresh(row)
    except IntegrityError:
        session.rollback()
        raise_api_error("NUMERO_DUPLICADO", status_code=400)
    return to_admin(session, row)


def update_sessao(session: Session, sessao_id: int, payload: SessaoUpdate) -> SessaoAdmin:
    row = session.get(Sessao, sessao_id)
    if not row:
        raise_api_error("SESSAO_NAO_ENCONTRADA", status_code=404)
    data = payload.model_dump(exclude_unset=True)
    local_ids = data.pop("local_ids", None)
    personagem_ids = data.pop("personagem_ids", None)
    if "titulo" in data and isinstance(data["titulo"], str):
        data["titulo"] = data["titulo"].strip()
    if "data_rotulo" in data:
        raw = data["data_rotulo"]
        data["data_rotulo"] = (raw.strip() if isinstance(raw, str) and raw else None) or None
    if "arco_id" in data or "arco_transicao_id" in data:
        effective_arco_id = data.get("arco_id", row.arco_id)
        effective_arco_transicao_id = data.get("arco_transicao_id", row.arco_transicao_id)
        _validate_arco_vinculo(session, effective_arco_id, effective_arco_transicao_id)
    for key, value in data.items():
        setattr(row, key, value)
    session.add(row)
    try:
        session.flush()
    except IntegrityError:
        session.rollback()
        raise_api_error("NUMERO_DUPLICADO", status_code=400)
    _replace_links(
        session,
        sessao_id,
        local_ids=local_ids,
        personagem_ids=personagem_ids,
    )
    try:
        session.commit()
        session.refresh(row)
    except IntegrityError:
        session.rollback()
        raise_api_error("NUMERO_DUPLICADO", status_code=400)
    return to_admin(session, row)


def delete_sessao(session: Session, sessao_id: int) -> None:
    row = session.get(Sessao, sessao_id)
    if not row:
        raise_api_error("SESSAO_NAO_ENCONTRADA", status_code=404)
    for link in session.exec(
        select(SessaoLocalLink).where(SessaoLocalLink.sessao_id == sessao_id)
    ).all():
        session.delete(link)
    for link in session.exec(
        select(SessaoNpcLink).where(SessaoNpcLink.sessao_id == sessao_id)
    ).all():
        session.delete(link)
    for link in session.exec(
        select(ItemSessaoLink).where(ItemSessaoLink.sessao_id == sessao_id)
    ).all():
        session.delete(link)
    session.delete(row)
    session.commit()
