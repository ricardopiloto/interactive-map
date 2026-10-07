"""Arco (narrative arc) session associations and read projection.

Session membership in an arc is stored on Sessao (Sessao.arco_id /
Sessao.arco_transicao_id — see app/models/sessao.py), not as a link table on
Arco. These helpers let the Arco admin form set that membership in bulk
(FR-003/FR-004 of linha-tempo-por-arcos) while keeping Sessao as the single
source of truth.
"""

from __future__ import annotations

from sqlmodel import Session, col, select

from app.errors import raise_api_error
from app.models.arco import Arco
from app.models.sessao import Sessao
from app.schemas.arco import ArcoRead


def to_arco_read(session: Session, arco: Arco, *, apenas_visiveis: bool = False) -> ArcoRead:
    """apenas_visiveis=True (player reads) excludes hidden sessions from the lists below,
    so an arc's session membership never reveals the existence of a hidden session."""
    assert arco.id is not None
    membro_stmt = select(Sessao.id).where(Sessao.arco_id == arco.id)
    transicao_stmt = select(Sessao.id).where(Sessao.arco_transicao_id == arco.id)
    if apenas_visiveis:
        membro_stmt = membro_stmt.where(col(Sessao.visivel_para_todos) == True)  # noqa: E712
        transicao_stmt = transicao_stmt.where(col(Sessao.visivel_para_todos) == True)  # noqa: E712
    sessao_ids = list(session.exec(membro_stmt).all())
    transicao = session.exec(transicao_stmt).first()
    return ArcoRead(
        id=arco.id,
        titulo=arco.titulo,
        resumo=arco.resumo,
        ordem=arco.ordem,
        visivel_para_todos=arco.visivel_para_todos,
        cor=arco.cor,
        sessao_ids=sessao_ids,
        sessao_transicao_id=transicao,
    )


def sync_sessoes_do_arco(session: Session, arco_id: int, sessao_ids: list[int] | None) -> None:
    """Replace the set of sessions with normal membership (Sessao.arco_id) in this arc.

    A session with a Capitulo vinculado has its arco_id derived from that Capitulo
    (capitulo-prep capability) — this bulk sync cannot move or detach such a session;
    the mestre must change it via the Capitulo instead."""
    if sessao_ids is None:
        return
    missing: list[int] = []
    bloqueadas: list[int] = []
    wanted = set(sessao_ids)
    for row in session.exec(select(Sessao).where(Sessao.arco_id == arco_id)).all():
        if row.id not in wanted:
            if row.capitulo_id is not None:
                bloqueadas.append(row.id)  # type: ignore[arg-type]
                continue
            row.arco_id = None
            session.add(row)
    for sid in sessao_ids:
        row = session.get(Sessao, sid)
        if row is None:
            missing.append(sid)
            continue
        if row.arco_id == arco_id:
            continue
        if row.capitulo_id is not None:
            bloqueadas.append(sid)
            continue
        row.arco_id = arco_id
        session.add(row)
    if missing:
        raise_api_error("SESSOES_NAO_ENCONTRADAS", status_code=400, detalhes={"ids": missing})
    if bloqueadas:
        raise_api_error(
            "SESSAO_ARCO_DERIVADO_DE_CAPITULO", status_code=409, detalhes={"ids": bloqueadas}
        )


def sync_sessao_transicao_do_arco(
    session: Session, arco_id: int, sessao_transicao_id: int | None
) -> None:
    """Replace the single session that transitions into this arc (Sessao.arco_transicao_id)."""
    for row in session.exec(
        select(Sessao).where(Sessao.arco_transicao_id == arco_id)
    ).all():
        if row.id != sessao_transicao_id:
            row.arco_transicao_id = None
            session.add(row)
    if sessao_transicao_id is None:
        return
    row = session.get(Sessao, sessao_transicao_id)
    if row is None:
        raise_api_error("SESSAO_NAO_ENCONTRADA", status_code=400)
    if row.arco_id is None:
        raise_api_error("SESSAO_TRANSICAO_SEM_ARCO", status_code=400)
    if row.arco_id == arco_id:
        raise_api_error("SESSAO_TRANSICAO_ARCO_IGUAL", status_code=400)
    row.arco_transicao_id = arco_id
    session.add(row)


def clear_arco_from_sessoes(session: Session, arco_id: int) -> None:
    """Detach every session from a deleted arc (both normal and transition membership)."""
    for row in session.exec(
        select(Sessao).where(
            col(Sessao.arco_id) == arco_id
        )
    ).all():
        row.arco_id = None
        session.add(row)
    for row in session.exec(
        select(Sessao).where(col(Sessao.arco_transicao_id) == arco_id)
    ).all():
        row.arco_transicao_id = None
        session.add(row)
