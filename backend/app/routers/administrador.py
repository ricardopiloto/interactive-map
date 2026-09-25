from __future__ import annotations

from fastapi import APIRouter, Depends, Query, Request, Response, status
from pydantic import BaseModel

from app.campaign_db import get_control_engine
from app.deps.auth import require_admin
from app.errors import raise_api_error
from app.services.rate_limit import limiter
from app.schemas.admin_console import (
    AdminCampaignsResponse,
    AdminUsersResponse,
    CampaignOwnerRequest,
    CampaignStateRequest,
    CreateInviteResponse,
    ResetLinkResponse,
    UserStateRequest,
)
from app.services.admin_console import (
    AdminConsoleError,
    create_invite,
    create_reset_link,
    delete_campaign,
    delete_user,
    list_campaigns,
    list_users,
    set_campaign_active,
    set_user_active,
    transfer_campaign_owner,
)
from sqlmodel import Session

router = APIRouter(prefix="/api/admin", tags=["administrador"], dependencies=[Depends(require_admin)])


def _admin_error_status(codigo: str) -> int:
    if codigo in {
        "EMAIL_DUPLICADO",
        "USUARIO_PENDENTE",
        "USUARIO_INACTIVO",
        "ULTIMO_ADMINISTRADOR",
        "PROPRIETARIO_COM_MESAS",
        "CAMINHO_CAMPANHA_INVALIDO",
        "EXCLUSAO_EM_RECUPERACAO",
        "FALHA_EXCLUSAO_CAMPANHA",
    }:
        return 409
    if codigo in {"USUARIO_NAO_ENCONTRADO", "CAMPANHA_NAO_ENCONTRADA"}:
        return 404
    return 400


def _raise_admin_error(exc: AdminConsoleError) -> None:
    details = {"campanhas": exc.campaigns} if exc.campaigns else None
    raise_api_error(exc.codigo, status_code=_admin_error_status(exc.codigo), detalhes=details)


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
            result = create_invite(session, body.email)
        except AdminConsoleError as exc:
            _raise_admin_error(exc)
        return CriarConviteResponse(**result)


@router.get("/usuarios", response_model=AdminUsersResponse)
def admin_list_users(
    email: str | None = Query(default=None), estado: str | None = Query(default=None)
) -> dict:
    if estado not in (None, "ativa", "pendente", "inativa"):
        raise_api_error("FILTRO_ESTADO_INVALIDO", status_code=400)
    with Session(get_control_engine()) as session:
        return {"usuarios": list_users(session, email=email, estado=estado)}


@router.post("/usuarios/{user_id}/reset", response_model=ResetLinkResponse, status_code=201)
def reset_user(user_id: int) -> dict:
    with Session(get_control_engine()) as session:
        try:
            return create_reset_link(session, user_id)
        except AdminConsoleError as exc:
            _raise_admin_error(exc)


@router.patch("/usuarios/{user_id}/estado")
def change_user_state(user_id: int, body: UserStateRequest) -> dict:
    with Session(get_control_engine()) as session:
        try:
            return set_user_active(session, user_id, body.activo)
        except AdminConsoleError as exc:
            _raise_admin_error(exc)


@router.delete("/usuarios/{user_id}", status_code=204)
def remove_user(user_id: int) -> Response:
    with Session(get_control_engine()) as session:
        try:
            delete_user(session, user_id)
        except AdminConsoleError as exc:
            _raise_admin_error(exc)
    return Response(status_code=204)


@router.get("/campanhas", response_model=AdminCampaignsResponse)
def admin_list_campaigns(q: str | None = Query(default=None), estado: str | None = Query(default=None)) -> dict:
    if estado not in (None, "ativa", "inativa"):
        raise_api_error("FILTRO_ESTADO_INVALIDO", status_code=400)
    with Session(get_control_engine()) as session:
        return {"campanhas": list_campaigns(session, q=q, estado=estado)}


@router.patch("/campanhas/{campaign_id}/estado")
def change_campaign_state(campaign_id: int, body: CampaignStateRequest) -> dict:
    with Session(get_control_engine()) as session:
        try:
            return set_campaign_active(session, campaign_id, body.activa)
        except AdminConsoleError as exc:
            _raise_admin_error(exc)


@router.patch("/campanhas/{campaign_id}/proprietario")
def change_campaign_owner(campaign_id: int, body: CampaignOwnerRequest) -> dict:
    with Session(get_control_engine()) as session:
        try:
            return transfer_campaign_owner(session, campaign_id, body.email)
        except AdminConsoleError as exc:
            _raise_admin_error(exc)


@router.delete("/campanhas/{campaign_id}", status_code=204)
def remove_campaign(campaign_id: int) -> Response:
    with Session(get_control_engine()) as session:
        try:
            delete_campaign(session, campaign_id)
        except AdminConsoleError as exc:
            _raise_admin_error(exc)
    return Response(status_code=204)
