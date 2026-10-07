from __future__ import annotations

from fastapi import status
from sqlmodel import Session, col, select

from app.errors import raise_api_error
from app.models.arco import Arco
from app.models.capitulo import Capitulo
from app.models.sessao import Sessao
from app.schemas.capitulo import CapituloAdmin, CapituloCreate, CapituloRead, CapituloUpdate
from app.services.visibility import is_visivel_para_jogador


def _to_admin(row: Capitulo) -> CapituloAdmin:
    assert row.id is not None
    return CapituloAdmin(
        id=row.id,
        arco_id=row.arco_id,
        titulo=row.titulo,
        ordem=row.ordem,
        corpo_markdown=row.corpo_markdown,
        visivel_para_todos=row.visivel_para_todos,
    )


def _to_public(row: Capitulo) -> CapituloRead:
    admin = _to_admin(row)
    return CapituloRead.model_validate(admin.model_dump(exclude={"visivel_para_todos"}))


def _require_arco(session: Session, arco_id: int) -> Arco:
    arco = session.get(Arco, arco_id)
    if arco is None:
        raise_api_error("CAPITULO_ARCO_INVALIDO", status_code=status.HTTP_422_UNPROCESSABLE_ENTITY)
    return arco


def _sync_sessoes_do_capitulo(session: Session, capitulo_id: int, arco_id: int | None) -> None:
    """Propagate a chapter's arco to every session that references it (N:1 Sessao -> Capitulo)."""
    for row in session.exec(select(Sessao).where(Sessao.capitulo_id == capitulo_id)).all():
        if row.arco_id != arco_id:
            row.arco_id = arco_id
            session.add(row)


def _next_ordem(session: Session, arco_id: int | None) -> int:
    rows = session.exec(select(Capitulo.ordem).where(Capitulo.arco_id == arco_id)).all()
    if not rows:
        return 1
    return max(rows) + 1


def create_capitulo(session: Session, payload: CapituloCreate) -> CapituloAdmin:
    if payload.arco_id is not None:
        _require_arco(session, payload.arco_id)
    ordem = payload.ordem if payload.ordem is not None else _next_ordem(session, payload.arco_id)
    row = Capitulo(
        arco_id=payload.arco_id,
        titulo=payload.titulo,
        ordem=ordem,
        corpo_markdown=payload.corpo_markdown,
        visivel_para_todos=payload.visivel_para_todos,
    )
    session.add(row)
    session.commit()
    session.refresh(row)
    return _to_admin(row)


def update_capitulo(session: Session, capitulo_id: int, payload: CapituloUpdate) -> CapituloAdmin:
    row = session.get(Capitulo, capitulo_id)
    if row is None:
        raise_api_error("CAPITULO_NAO_ENCONTRADO", status_code=status.HTTP_404_NOT_FOUND)
    data = payload.model_dump(exclude_unset=True)
    if "arco_id" in data and data["arco_id"] is not None:
        _require_arco(session, data["arco_id"])
    arco_mudou = "arco_id" in data and data["arco_id"] != row.arco_id
    for key, value in data.items():
        setattr(row, key, value)
    session.add(row)
    if arco_mudou:
        assert row.id is not None
        _sync_sessoes_do_capitulo(session, row.id, row.arco_id)
    session.commit()
    session.refresh(row)
    return _to_admin(row)


def delete_capitulo(session: Session, capitulo_id: int) -> None:
    row = session.get(Capitulo, capitulo_id)
    if row is None:
        raise_api_error("CAPITULO_NAO_ENCONTRADO", status_code=status.HTTP_404_NOT_FOUND)
    for sessao in session.exec(select(Sessao).where(Sessao.capitulo_id == capitulo_id)).all():
        sessao.capitulo_id = None
        session.add(sessao)
    session.delete(row)
    session.commit()


def get_admin(session: Session, capitulo_id: int) -> CapituloAdmin:
    row = session.get(Capitulo, capitulo_id)
    if row is None:
        raise_api_error("CAPITULO_NAO_ENCONTRADO", status_code=status.HTTP_404_NOT_FOUND)
    return _to_admin(row)


def list_admin(session: Session, arco_id: int | None) -> list[CapituloAdmin]:
    stmt = select(Capitulo)
    if arco_id is not None:
        _require_arco(session, arco_id)
        stmt = stmt.where(Capitulo.arco_id == arco_id)
    rows = session.exec(stmt.order_by(Capitulo.ordem, Capitulo.id)).all()
    return [_to_admin(row) for row in rows]


def list_public(session: Session, arco_id: int | None) -> list[CapituloRead]:
    stmt = select(Capitulo)
    if arco_id is not None:
        _require_arco(session, arco_id)
        stmt = stmt.where(Capitulo.arco_id == arco_id)
    rows = session.exec(stmt.order_by(Capitulo.ordem, Capitulo.id)).all()
    return [_to_public(row) for row in rows if is_visivel_para_jogador(row)]


def get_public(session: Session, capitulo_id: int) -> CapituloRead:
    row = session.get(Capitulo, capitulo_id)
    if row is None or not is_visivel_para_jogador(row):
        raise_api_error("CAPITULO_NAO_ENCONTRADO", status_code=status.HTTP_404_NOT_FOUND)
    return _to_public(row)


def delete_capitulos_do_arco(session: Session, arco_id: int) -> None:
    rows = session.exec(select(Capitulo).where(Capitulo.arco_id == arco_id)).all()
    ids = [row.id for row in rows]
    if ids:
        for sessao in session.exec(select(Sessao).where(col(Sessao.capitulo_id).in_(ids))).all():
            sessao.capitulo_id = None
            session.add(sessao)
    for row in rows:
        session.delete(row)
