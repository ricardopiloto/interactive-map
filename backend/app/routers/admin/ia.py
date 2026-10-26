from fastapi import APIRouter, Depends, Request
from sqlmodel import Session

from app.database import get_session
from app.deps.auth import MembroContext, require_dono
from app.schemas.ia_assistente import AssistirRequest, AssistirResponse
from app.services.motor_ia_assistente import assistir
from app.services.rate_limit import limiter

router = APIRouter()


@router.post("/ia/assistir", response_model=AssistirResponse)
@limiter.limit("10/minute")
def assistir_admin(
    request: Request,
    payload: AssistirRequest,
    ctx: MembroContext = Depends(require_dono),
    session: Session = Depends(get_session),
) -> AssistirResponse:
    return assistir(session, ctx, payload)
