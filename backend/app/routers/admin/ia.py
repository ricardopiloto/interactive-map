from fastapi import APIRouter, Depends, Request
from sqlmodel import Session
from pydantic import BaseModel
from typing import Literal

from app.database import get_session
from app.deps.auth import MembroContext, require_dono
from app.errors import raise_api_error
from app.schemas.ia_assistente import AssistirRequest, AssistirResponse
from app.services.ia_provider import modulo_ia_ativo
from app.services import indice_ia
from app.services.motor_ia_assistente import assistir
from app.services.rate_limit import limiter

router = APIRouter()


class IndiceResponse(BaseModel):
    estado: Literal["ausente", "ok", "desatualizado", "indisponivel"]
    registros: int
    trechos: int
    atualizado_em: str | None


def _exigir_ia(ctx: MembroContext) -> None:
    if not modulo_ia_ativo(ctx.campanha.modulos_ativos):
        raise_api_error("IA_MODULO_DESABILITADO", status_code=403)


@router.get("/ia/indice", response_model=IndiceResponse)
def obter_indice(
    ctx: MembroContext = Depends(require_dono),
    session: Session = Depends(get_session),
) -> IndiceResponse:
    _exigir_ia(ctx)
    return IndiceResponse(**indice_ia.estado(session))


@router.post("/ia/indice/reindexar", response_model=IndiceResponse)
@limiter.limit("3/minute")
def reindexar_indice(
    request: Request,
    ctx: MembroContext = Depends(require_dono),
    session: Session = Depends(get_session),
) -> IndiceResponse:
    _exigir_ia(ctx)
    resultado = indice_ia.reconstruir(session)
    session.commit()
    return IndiceResponse(**resultado)


@router.post("/ia/assistir", response_model=AssistirResponse)
@limiter.limit("10/minute")
def assistir_admin(
    request: Request,
    payload: AssistirRequest,
    ctx: MembroContext = Depends(require_dono),
    session: Session = Depends(get_session),
) -> AssistirResponse:
    return assistir(session, ctx, payload)
