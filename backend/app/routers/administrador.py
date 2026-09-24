from __future__ import annotations

from fastapi import APIRouter, Depends, Request, status
from pydantic import BaseModel

from app.campaign_db import get_control_engine
from app.deps.auth import require_admin
from app.errors import raise_api_error
from app.services.auth_admin import AuthAdminError, create_usuario_with_invite, invite_url
from app.services.rate_limit import limiter
from sqlmodel import Session

router = APIRouter(prefix="/api/admin", tags=["administrador"], dependencies=[Depends(require_admin)])


def _admin_error_status(codigo: str) -> int:
    if codigo == "EMAIL_DUPLICADO":
        return 409
    return 400


class CriarConviteRequest(BaseModel):
    email: str


class CriarConviteResponse(BaseModel):
    email: str
    link: str


@router.post("/convites", response_model=CriarConviteResponse, status_code=status.HTTP_201_CREATED)
@limiter.limit("30/minute")
def criar_convite(request: Request, body: CriarConviteRequest) -> CriarConviteResponse:
    with Session(get_control_engine()) as session:
        try:
            user, token = create_usuario_with_invite(session, body.email)
        except AuthAdminError as exc:
            raise_api_error(exc.codigo, status_code=_admin_error_status(exc.codigo))
        return CriarConviteResponse(email=user.email, link=invite_url(token, "activar"))
