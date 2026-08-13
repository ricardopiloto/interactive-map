from typing import Optional

from pydantic import BaseModel, ConfigDict, Field

from app.models.npc import NPCStatus, PersonagemTipo


class NPCCreate(BaseModel):
    nome: str = Field(min_length=1, max_length=200)
    tipo: PersonagemTipo = PersonagemTipo.npc
    papel: Optional[str] = Field(default=None, max_length=200)
    descricao: str = Field(default="", max_length=10000)
    faccao: Optional[str] = Field(default=None, max_length=200)
    status: Optional[NPCStatus] = NPCStatus.desconhecido
    retrato_url: Optional[str] = Field(default=None, max_length=500)
    visivel_para_todos: bool = True


class NPCUpdate(BaseModel):
    nome: Optional[str] = Field(default=None, min_length=1, max_length=200)
    tipo: Optional[PersonagemTipo] = None
    papel: Optional[str] = Field(default=None, max_length=200)
    descricao: Optional[str] = Field(default=None, max_length=10000)
    faccao: Optional[str] = Field(default=None, max_length=200)
    status: Optional[NPCStatus] = None
    retrato_url: Optional[str] = Field(default=None, max_length=500)
    visivel_para_todos: Optional[bool] = None


class NPCRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    nome: str
    tipo: PersonagemTipo = PersonagemTipo.npc
    papel: Optional[str] = None
    descricao: str
    faccao: Optional[str]
    status: Optional[NPCStatus]
    retrato_url: Optional[str]
    visivel_para_todos: bool = True
    local_ids: list[int] = Field(default_factory=list)
