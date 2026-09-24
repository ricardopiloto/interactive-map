from fastapi import APIRouter, Depends, Request, status
from sqlmodel import Session

from app.database import get_session
from app.schemas.sessao import (
    ProximoNumeroResponse,
    SessaoAdmin,
    SessaoCreate,
    SessaoListAdmin,
    SessaoUpdate,
)
from app.services import sessao_service
from app.services.rate_limit import limiter

router = APIRouter()


@router.get("/sessoes", response_model=SessaoListAdmin)
def list_sessoes_admin(session: Session = Depends(get_session)) -> SessaoListAdmin:
    return SessaoListAdmin(sessoes=sessao_service.list_admin(session))


@router.get("/sessoes/proximo-numero", response_model=ProximoNumeroResponse)
def get_proximo_numero(session: Session = Depends(get_session)) -> ProximoNumeroResponse:
    return ProximoNumeroResponse(numero=sessao_service.proximo_numero(session))


@router.get("/sessoes/{sessao_id}", response_model=SessaoAdmin)
def get_sessao_admin(sessao_id: int, session: Session = Depends(get_session)) -> SessaoAdmin:
    return sessao_service.get_admin(session, sessao_id)


@router.post("/sessoes", response_model=SessaoAdmin, status_code=status.HTTP_201_CREATED)
@limiter.limit("30/minute")
def create_sessao(
    request: Request,
    payload: SessaoCreate,
    session: Session = Depends(get_session),
) -> SessaoAdmin:
    return sessao_service.create_sessao(session, payload)


@router.patch("/sessoes/{sessao_id}", response_model=SessaoAdmin)
@limiter.limit("30/minute")
def update_sessao(
    request: Request,
    sessao_id: int,
    payload: SessaoUpdate,
    session: Session = Depends(get_session),
) -> SessaoAdmin:
    return sessao_service.update_sessao(session, sessao_id, payload)


@router.delete("/sessoes/{sessao_id}", status_code=status.HTTP_204_NO_CONTENT)
@limiter.limit("30/minute")
def delete_sessao(
    request: Request,
    sessao_id: int,
    session: Session = Depends(get_session),
) -> None:
    sessao_service.delete_sessao(session, sessao_id)
