from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class SessaoRefLocal(BaseModel):
    id: int
    nome: str


class SessaoRefPersonagem(BaseModel):
    id: int
    nome: str
    tipo: str


class SessaoPublic(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    numero: int
    titulo: str
    data_rotulo: Optional[str] = None
    resumo: str = ""
    locais: list[SessaoRefLocal] = Field(default_factory=list)
    personagens: list[SessaoRefPersonagem] = Field(default_factory=list)


class SessaoAdmin(SessaoPublic):
    visivel_para_todos: bool = True


class SessaoCreate(BaseModel):
    numero: int = Field(ge=1)
    titulo: str = Field(min_length=1, max_length=200)
    data_rotulo: Optional[str] = Field(default=None, max_length=100)
    resumo: str = Field(default="", max_length=50000)
    visivel_para_todos: bool = True
    local_ids: list[int] = Field(default_factory=list)
    personagem_ids: list[int] = Field(default_factory=list)


class SessaoUpdate(BaseModel):
    numero: Optional[int] = Field(default=None, ge=1)
    titulo: Optional[str] = Field(default=None, min_length=1, max_length=200)
    data_rotulo: Optional[str] = Field(default=None, max_length=100)
    resumo: Optional[str] = Field(default=None, max_length=50000)
    visivel_para_todos: Optional[bool] = None
    local_ids: Optional[list[int]] = None
    personagem_ids: Optional[list[int]] = None


class ProximoNumeroResponse(BaseModel):
    numero: int


class SessaoListPublic(BaseModel):
    sessoes: list[SessaoPublic]


class SessaoListAdmin(BaseModel):
    sessoes: list[SessaoAdmin]
