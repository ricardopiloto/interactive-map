"""Item catalogue: CRUD and session/event links."""

from __future__ import annotations

from sqlmodel import Session, col, select

from app.errors import raise_api_error
from app.models.evento import Evento
from app.models.item import Item
from app.models.links import ItemEventoLink, ItemSessaoLink
from app.models.sessao import Sessao
from app.schemas.item import (
    ItemAdmin,
    ItemCreate,
    ItemPublic,
    ItemRefEvento,
    ItemRefSessao,
    ItemUpdate,
)
from app.services.visibility import is_visivel_para_jogador


def is_item_visivel_publico(item: Item | None) -> bool:
    if item is None:
        return False
    return bool(getattr(item, "visivel_para_todos", True))


def _links(session: Session, item_id: int) -> tuple[list[Sessao], list[Evento]]:
    sessao_ids = list(
        session.exec(select(ItemSessaoLink.sessao_id).where(ItemSessaoLink.item_id == item_id)).all()
    )
    evento_ids = list(
        session.exec(select(ItemEventoLink.evento_id).where(ItemEventoLink.item_id == item_id)).all()
    )
    sessoes: list[Sessao] = []
    if sessao_ids:
        sessoes = list(session.exec(select(Sessao).where(col(Sessao.id).in_(sessao_ids))).all())
    eventos: list[Evento] = []
    if evento_ids:
        eventos = list(session.exec(select(Evento).where(col(Evento.id).in_(evento_ids))).all())
    sessoes.sort(key=lambda s: (s.numero, s.id or 0))
    eventos.sort(key=lambda e: (e.ano, e.mes if e.mes is not None else 13, e.id or 0))
    return sessoes, eventos


def to_public(session: Session, item: Item, *, filter_hidden: bool) -> ItemPublic:
    assert item.id is not None
    sessoes, eventos = _links(session, item.id)
    return ItemPublic(
        id=item.id,
        nome=item.nome,
        descricao=item.descricao or "",
        sessoes=[
            ItemRefSessao(id=s.id, numero=s.numero, titulo=s.titulo)  # type: ignore[arg-type]
            for s in sessoes
            if s.id is not None and (not filter_hidden or is_visivel_para_jogador(s))
        ],
        eventos=[
            ItemRefEvento(id=e.id, titulo=e.titulo, ano=e.ano, mes=e.mes)  # type: ignore[arg-type]
            for e in eventos
            if e.id is not None and (not filter_hidden or is_visivel_para_jogador(e))
        ],
    )


def to_admin(session: Session, item: Item) -> ItemAdmin:
    base = to_public(session, item, filter_hidden=False)
    return ItemAdmin(**base.model_dump(), visivel_para_todos=bool(item.visivel_para_todos))


def list_public(session: Session) -> list[ItemPublic]:
    rows = list(session.exec(select(Item).order_by(col(Item.nome).asc(), col(Item.id).asc())).all())
    return [
        to_public(session, row, filter_hidden=True)
        for row in rows
        if is_item_visivel_publico(row)
    ]


def list_admin(session: Session) -> list[ItemAdmin]:
    rows = list(session.exec(select(Item).order_by(col(Item.nome).asc(), col(Item.id).asc())).all())
    return [to_admin(session, row) for row in rows]


def get_public(session: Session, item_id: int) -> ItemPublic:
    item = session.get(Item, item_id)
    if not item or not is_item_visivel_publico(item):
        raise_api_error("ITEM_NAO_ENCONTRADO", status_code=404)
    return to_public(session, item, filter_hidden=True)


def get_admin(session: Session, item_id: int) -> ItemAdmin:
    item = session.get(Item, item_id)
    if not item:
        raise_api_error("ITEM_NAO_ENCONTRADO", status_code=404)
    return to_admin(session, item)


def _replace_links(
    session: Session,
    item_id: int,
    *,
    sessao_ids: list[int] | None,
    evento_ids: list[int] | None,
) -> None:
    if sessao_ids is not None:
        for link in session.exec(select(ItemSessaoLink).where(ItemSessaoLink.item_id == item_id)).all():
            session.delete(link)
        session.flush()
        for sid in sessao_ids:
            if session.get(Sessao, sid) is None:
                raise_api_error("SESSAO_NAO_ENCONTRADA", status_code=400)
            session.add(ItemSessaoLink(item_id=item_id, sessao_id=sid))
    if evento_ids is not None:
        for link in session.exec(select(ItemEventoLink).where(ItemEventoLink.item_id == item_id)).all():
            session.delete(link)
        session.flush()
        for eid in evento_ids:
            if session.get(Evento, eid) is None:
                raise_api_error("EVENTO_NAO_ENCONTRADO", status_code=400)
            session.add(ItemEventoLink(item_id=item_id, evento_id=eid))


def create_item(session: Session, payload: ItemCreate) -> ItemAdmin:
    row = Item(
        nome=payload.nome.strip(),
        descricao=payload.descricao or "",
        visivel_para_todos=payload.visivel_para_todos,
    )
    session.add(row)
    session.flush()
    assert row.id is not None
    _replace_links(session, row.id, sessao_ids=payload.sessao_ids, evento_ids=payload.evento_ids)
    session.commit()
    session.refresh(row)
    return to_admin(session, row)


def update_item(session: Session, item_id: int, payload: ItemUpdate) -> ItemAdmin:
    row = session.get(Item, item_id)
    if not row:
        raise_api_error("ITEM_NAO_ENCONTRADO", status_code=404)
    data = payload.model_dump(exclude_unset=True)
    sessao_ids = data.pop("sessao_ids", None)
    evento_ids = data.pop("evento_ids", None)
    if "nome" in data and isinstance(data["nome"], str):
        data["nome"] = data["nome"].strip()
    for key, value in data.items():
        setattr(row, key, value)
    session.add(row)
    session.flush()
    _replace_links(session, item_id, sessao_ids=sessao_ids, evento_ids=evento_ids)
    session.commit()
    session.refresh(row)
    return to_admin(session, row)


def delete_item(session: Session, item_id: int) -> None:
    row = session.get(Item, item_id)
    if not row:
        raise_api_error("ITEM_NAO_ENCONTRADO", status_code=404)
    for link in session.exec(select(ItemSessaoLink).where(ItemSessaoLink.item_id == item_id)).all():
        session.delete(link)
    for link in session.exec(select(ItemEventoLink).where(ItemEventoLink.item_id == item_id)).all():
        session.delete(link)
    session.delete(row)
    session.commit()
