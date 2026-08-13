from typing import Any, Optional

from pydantic import BaseModel, ConfigDict, Field

from app.models.npc import NPCStatus, PersonagemTipo


class PersonagemCreate(BaseModel):
    nome: str = Field(min_length=1, max_length=200)
    tipo: PersonagemTipo = PersonagemTipo.npc
    papel: Optional[str] = Field(default=None, max_length=200)
    descricao: str = Field(default="", max_length=10000)
    faccao: Optional[str] = Field(default=None, max_length=200)
    status: Optional[NPCStatus] = NPCStatus.desconhecido
    retrato_url: Optional[str] = Field(default=None, max_length=500)
    extensoes_mecanica: dict[str, Any] = Field(default_factory=dict)


class PersonagemUpdate(BaseModel):
    nome: Optional[str] = Field(default=None, min_length=1, max_length=200)
    tipo: Optional[PersonagemTipo] = None
    papel: Optional[str] = Field(default=None, max_length=200)
    descricao: Optional[str] = Field(default=None, max_length=10000)
    faccao: Optional[str] = Field(default=None, max_length=200)
    status: Optional[NPCStatus] = None
    retrato_url: Optional[str] = Field(default=None, max_length=500)
    extensoes_mecanica: Optional[dict[str, Any]] = None


class PersonagemRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    nome: str
    tipo: PersonagemTipo
    papel: Optional[str]
    descricao: str
    faccao: Optional[str]
    status: Optional[NPCStatus]
    retrato_url: Optional[str]
    extensoes_mecanica: dict[str, Any] = Field(default_factory=dict)
    local_ids: list[int] = Field(default_factory=list)
