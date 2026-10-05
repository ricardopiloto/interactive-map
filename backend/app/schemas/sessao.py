from typing import Literal, Optional

from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.schemas.descoberta import AlertaInconsistencia


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
    arco_id: Optional[int] = None
    arco_transicao_id: Optional[int] = None


class SessaoAdmin(SessaoPublic):
    visivel_para_todos: bool = True
    alertas_inconsistencia: list[AlertaInconsistencia] = Field(default_factory=list)


class SessaoCreate(BaseModel):
    numero: int = Field(ge=1)
    titulo: str = Field(min_length=1, max_length=200)
    data_rotulo: Optional[str] = Field(default=None, max_length=100)
    resumo: str = Field(default="", max_length=50000)
    visivel_para_todos: bool = True
    local_ids: list[int] = Field(default_factory=list)
    personagem_ids: list[int] = Field(default_factory=list)
    arco_id: Optional[int] = None
    arco_transicao_id: Optional[int] = None


class SessaoUpdate(BaseModel):
    numero: Optional[int] = Field(default=None, ge=1)
    titulo: Optional[str] = Field(default=None, min_length=1, max_length=200)
    data_rotulo: Optional[str] = Field(default=None, max_length=100)
    resumo: Optional[str] = Field(default=None, max_length=50000)
    visivel_para_todos: Optional[bool] = None
    local_ids: Optional[list[int]] = None
    personagem_ids: Optional[list[int]] = None
    arco_id: Optional[int] = None
    arco_transicao_id: Optional[int] = None


class ProximoNumeroResponse(BaseModel):
    numero: int


class SessaoListPublic(BaseModel):
    sessoes: list[SessaoPublic]


class SessaoListAdmin(BaseModel):
    sessoes: list[SessaoAdmin]


class SugestaoAssociacoesRequest(BaseModel):
    resumo: str = Field(max_length=50000)

    @field_validator("resumo")
    @classmethod
    def resumo_util(cls, value: str) -> str:
        stripped = value.strip()
        if not stripped:
            raise ValueError("resumo vazio")
        return stripped


class SugestaoAssociacoesResponse(BaseModel):
    estado: Literal["sugestoes", "vazio", "falha"]
    mensagem: str = ""
    local_ids: list[int] = Field(default_factory=list)
    personagem_ids: list[int] = Field(default_factory=list)
