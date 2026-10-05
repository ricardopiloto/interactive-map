from fastapi import APIRouter, Depends, Request, status
from sqlmodel import Session, select

from app.database import get_session
from app.deps.auth import MembroContext, require_dono
from app.errors import raise_api_error
from app.models.arco import Arco
from app.models.local import Local
from app.schemas.arco import ArcoCreate, ArcoRead, ArcoUpdate, ProporArcosResponse
from app.services.motor_ia_arcos import propor_arcos
from app.services.arco_service import (
    clear_arco_from_sessoes,
    sync_sessao_transicao_do_arco,
    sync_sessoes_do_arco,
    to_arco_read,
)
from app.services.rate_limit import limiter

router = APIRouter()


@router.get("/arcos", response_model=list[ArcoRead])
def list_arcos_admin(session: Session = Depends(get_session)) -> list[ArcoRead]:
    rows = list(session.exec(select(Arco).order_by(Arco.ordem, Arco.id)).all())
    return [to_arco_read(session, a) for a in rows]


@router.post("/arcos/propor", response_model=ProporArcosResponse)
@limiter.limit("10/minute")
def propor_arcos_admin(
    request: Request,
    ctx: MembroContext = Depends(require_dono),
    session: Session = Depends(get_session),
) -> ProporArcosResponse:
    return propor_arcos(session, ctx)


@router.get("/arcos/{arco_id}", response_model=ArcoRead)
def get_arco_admin(arco_id: int, session: Session = Depends(get_session)) -> ArcoRead:
    arco = session.get(Arco, arco_id)
    if not arco:
        raise_api_error("ARCO_NAO_ENCONTRADO", status_code=status.HTTP_404_NOT_FOUND)
    return to_arco_read(session, arco)


@router.post("/arcos", response_model=ArcoRead, status_code=status.HTTP_201_CREATED)
@limiter.limit("30/minute")
def create_arco(
    request: Request,
    payload: ArcoCreate,
    session: Session = Depends(get_session),
) -> ArcoRead:
    arco = Arco.model_validate(payload)
    session.add(arco)
    session.commit()
    session.refresh(arco)
    assert arco.id is not None
    sync_sessoes_do_arco(session, arco.id, payload.sessao_ids)
    sync_sessao_transicao_do_arco(session, arco.id, payload.sessao_transicao_id)
    session.commit()
    session.refresh(arco)
    return to_arco_read(session, arco)


@router.put("/arcos/{arco_id}", response_model=ArcoRead)
@limiter.limit("30/minute")
def update_arco(
    request: Request,
    arco_id: int,
    payload: ArcoUpdate,
    session: Session = Depends(get_session),
) -> ArcoRead:
    arco = session.get(Arco, arco_id)
    if not arco:
        raise_api_error("ARCO_NAO_ENCONTRADO", status_code=status.HTTP_404_NOT_FOUND)

    data = payload.model_dump(exclude_unset=True)
    sessao_ids_provided = "sessao_ids" in data
    sessao_ids = data.pop("sessao_ids", None)
    sessao_transicao_provided = "sessao_transicao_id" in data
    sessao_transicao_id = data.pop("sessao_transicao_id", None)

    for key, value in data.items():
        setattr(arco, key, value)

    session.add(arco)
    session.commit()
    session.refresh(arco)

    if sessao_ids_provided:
        sync_sessoes_do_arco(session, arco_id, sessao_ids)
    if sessao_transicao_provided:
        sync_sessao_transicao_do_arco(session, arco_id, sessao_transicao_id)
    session.commit()
    session.refresh(arco)
    return to_arco_read(session, arco)


@router.delete("/arcos/{arco_id}", status_code=status.HTTP_204_NO_CONTENT)
@limiter.limit("30/minute")
def delete_arco(
    request: Request,
    arco_id: int,
    session: Session = Depends(get_session),
) -> None:
    arco = session.get(Arco, arco_id)
    if not arco:
        raise_api_error("ARCO_NAO_ENCONTRADO", status_code=status.HTTP_404_NOT_FOUND)
    for local in session.exec(select(Local).where(Local.arco_id == arco_id)).all():
        local.arco_id = None
        session.add(local)
    clear_arco_from_sessoes(session, arco_id)
    session.delete(arco)
    session.commit()
