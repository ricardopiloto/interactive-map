from __future__ import annotations

from fastapi import APIRouter, Depends, Request, Response
from pydantic import BaseModel, Field
from sqlmodel import Session, select

from app.campaign_db import get_control_engine
from app.deps.auth import require_session_user
from app.errors import raise_api_error
from app.models.usuario import Usuario
from app.services.auth_admin import normalize_email
from app.services.auth_invite import InviteError, accept_activate_invite, confirm_reset
from app.services.auth_lockout import (
    clear_failures,
    email_key,
    ip_key,
    is_locked,
    record_failure,
)
from app.services.auth_password import verify_password
from app.services.auth_session import (
    COOKIE_NAME,
    clear_session_cookie,
    create_session,
    revoke_session_by_token,
    set_session_cookie,
)
from app.services.client_ip import client_ip

router = APIRouter(prefix="/api/auth", tags=["auth"])


class LoginBody(BaseModel):
    email: str
    password: str


class TokenPasswordBody(BaseModel):
    token: str
    password: str = Field(min_length=1)


@router.post("/login")
def login(body: LoginBody, request: Request, response: Response) -> dict[str, str]:
    email = normalize_email(body.email)
    ip = client_ip(request)
    with Session(get_control_engine()) as session:
        if is_locked(session, email_key(email)) or is_locked(session, ip_key(ip)):
            raise_api_error("LOGIN_BLOQUEADO", status_code=429)

        user = session.exec(select(Usuario).where(Usuario.email == email)).first()
        ok = False
        if user is not None and user.senha_hash and user.activo:
            ok = verify_password(body.password, user.senha_hash)

        if not ok:
            record_failure(session, email_key(email))
            record_failure(session, ip_key(ip))
            if user is not None and not user.activo:
                raise_api_error("CONTA_INACTIVA", status_code=401)
            raise_api_error("CREDENCIAIS_INVALIDAS", status_code=401)

        clear_failures(session, email_key(email))
        clear_failures(session, ip_key(ip))
        token = create_session(session, user.id)  # type: ignore[arg-type]
        set_session_cookie(response, token)
        return {"email": user.email}


@router.post("/logout", status_code=204)
def logout(request: Request, response: Response) -> None:
    token = request.cookies.get(COOKIE_NAME)
    if token:
        with Session(get_control_engine()) as session:
            revoke_session_by_token(session, token)
    clear_session_cookie(response)


@router.get("/me")
def me(usuario: Usuario = Depends(require_session_user)) -> dict:
    return {"email": usuario.email, "id": usuario.id}


@router.post("/convite/aceitar")
def aceitar_convite(body: TokenPasswordBody, response: Response) -> dict[str, str]:
    with Session(get_control_engine()) as session:
        try:
            user = accept_activate_invite(session, body.token, body.password)
        except InviteError as exc:
            status = 400
            if exc.codigo in ("CONVITE_INVALIDO", "CONVITE_JA_USADO", "CONVITE_EXPIRADO"):
                status = 400
            raise_api_error(exc.codigo, status_code=status)
        token = create_session(session, user.id)  # type: ignore[arg-type]
        set_session_cookie(response, token)
        return {"email": user.email}


@router.post("/reset/confirmar")
def reset_confirmar(body: TokenPasswordBody) -> dict[str, str]:
    with Session(get_control_engine()) as session:
        try:
            user = confirm_reset(session, body.token, body.password)
        except InviteError as exc:
            raise_api_error(exc.codigo, status_code=400)
        return {"email": user.email}
