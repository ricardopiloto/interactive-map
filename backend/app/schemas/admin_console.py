from __future__ import annotations

from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict


UserState = Literal["ativa", "pendente", "inativa"]
CampaignState = Literal["ativa", "inativa"]


class AdminSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)


class CampaignOwnerView(AdminSchema):
    id: int
    email: str


class OwnedCampaignView(AdminSchema):
    id: int
    slug: str
    nome: str
    activa: bool


class AdminUserView(AdminSchema):
    id: int
    email: str
    estado: UserState
    is_admin: bool
    criado_em: datetime
    mesas_proprietarias: list[OwnedCampaignView]


class AdminUsersResponse(AdminSchema):
    usuarios: list[AdminUserView]


class CreateInviteRequest(AdminSchema):
    email: str


class CreateInviteResponse(AdminSchema):
    email: str
    link: str


class ResetLinkResponse(CreateInviteResponse):
    pass


class UserStateRequest(AdminSchema):
    activo: bool


class CampaignOwnerRequest(AdminSchema):
    email: str


class CampaignStateRequest(AdminSchema):
    activa: bool


class AdminCampaignView(AdminSchema):
    id: int
    nome: str
    slug: str
    sistema: str
    proprietario: CampaignOwnerView
    activa: bool
    visibilidade: str
    criado_em: datetime | None
    modificado_em: datetime | None
    ultima_alteracao_em: datetime | None


class AdminCampaignsResponse(AdminSchema):
    campanhas: list[AdminCampaignView]


class AdminErrorResponse(AdminSchema):
    detail: dict[str, str]
