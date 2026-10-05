from fastapi import APIRouter, Depends, Request, status
from sqlmodel import Session

from app.database import get_session
from app.deps.auth import MembroContext, require_dono, require_membro
from app.schemas.descoberta import AlertaInconsistencia
from app.schemas.sessao import (
    ProximoNumeroResponse,
    SessaoAdmin,
    SessaoCreate,
    SessaoListAdmin,
    SessaoUpdate,
    SugestaoAssociacoesRequest,
    SugestaoAssociacoesResponse,
)
from app.services import descoberta_service, sessao_service
from app.services.motor_ia_sessao_associacoes import sugerir_associacoes
from app.services.rate_limit import limiter

router = APIRouter()


def _alertas_do_mestre(
    ctx: MembroContext, session: Session
) -> dict[int, list[AlertaInconsistencia]]:
    if ctx.membro.papel != "dono":
        return {}
    return descoberta_service.alertas_por_sessao(session)


@router.get("/sessoes", response_model=SessaoListAdmin)
def list_sessoes_admin(
    ctx: MembroContext = Depends(require_membro),
    session: Session = Depends(get_session),
) -> SessaoListAdmin:
    return SessaoListAdmin(
        sessoes=sessao_service.list_admin(session, alertas_por_id=_alertas_do_mestre(ctx, session))
    )


@router.get("/sessoes/proximo-numero", response_model=ProximoNumeroResponse)
def get_proximo_numero(session: Session = Depends(get_session)) -> ProximoNumeroResponse:
    return ProximoNumeroResponse(numero=sessao_service.proximo_numero(session))


@router.post("/sessoes/sugerir-associacoes", response_model=SugestaoAssociacoesResponse)
@limiter.limit("10/minute")
def sugerir_associacoes_admin(
    request: Request,
    payload: SugestaoAssociacoesRequest,
    ctx: MembroContext = Depends(require_dono),
    session: Session = Depends(get_session),
) -> SugestaoAssociacoesResponse:
    return sugerir_associacoes(session, ctx, payload.resumo)


@router.get("/sessoes/{sessao_id}", response_model=SessaoAdmin)
def get_sessao_admin(
    sessao_id: int,
    ctx: MembroContext = Depends(require_membro),
    session: Session = Depends(get_session),
) -> SessaoAdmin:
    return sessao_service.get_admin(
        session,
        sessao_id,
        alertas=_alertas_do_mestre(ctx, session).get(sessao_id, []),
    )


@router.post("/sessoes", response_model=SessaoAdmin, status_code=status.HTTP_201_CREATED)
@limiter.limit("30/minute")
def create_sessao(
    request: Request,
    payload: SessaoCreate,
    ctx: MembroContext = Depends(require_membro),
    session: Session = Depends(get_session),
) -> SessaoAdmin:
    created = sessao_service.create_sessao(session, payload)
    return sessao_service.get_admin(
        session,
        created.id,
        alertas=_alertas_do_mestre(ctx, session).get(created.id, []),
    )


@router.patch("/sessoes/{sessao_id}", response_model=SessaoAdmin)
@limiter.limit("30/minute")
def update_sessao(
    request: Request,
    sessao_id: int,
    payload: SessaoUpdate,
    ctx: MembroContext = Depends(require_membro),
    session: Session = Depends(get_session),
) -> SessaoAdmin:
    sessao_service.update_sessao(session, sessao_id, payload)
    return sessao_service.get_admin(
        session,
        sessao_id,
        alertas=_alertas_do_mestre(ctx, session).get(sessao_id, []),
    )


@router.delete("/sessoes/{sessao_id}", status_code=status.HTTP_204_NO_CONTENT)
@limiter.limit("30/minute")
def delete_sessao(
    request: Request,
    sessao_id: int,
    session: Session = Depends(get_session),
) -> None:
    sessao_service.delete_sessao(session, sessao_id)
