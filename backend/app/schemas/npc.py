from typing import Optional

from pydantic import BaseModel, ConfigDict, Field

from app.models.npc import NPCStatus


class NPCCreate(BaseModel):
    nome: str = Field(min_length=1, max_length=200)
    descricao: str = Field(default="", max_length=10000)
    faccao: Optional[str] = Field(default=None, max_length=200)
    status: Optional[NPCStatus] = NPCStatus.desconhecido
    retrato_url: Optional[str] = Field(default=None, max_length=500)


class NPCUpdate(BaseModel):
    nome: Optional[str] = Field(default=None, min_length=1, max_length=200)
    descricao: Optional[str] = Field(default=None, max_length=10000)
    faccao: Optional[str] = Field(default=None, max_length=200)
    status: Optional[NPCStatus] = None
    retrato_url: Optional[str] = Field(default=None, max_length=500)


class NPCRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    nome: str
    descricao: str
    faccao: Optional[str]
    status: Optional[NPCStatus]
    retrato_url: Optional[str]
    local_ids: list[int] = Field(default_factory=list)
