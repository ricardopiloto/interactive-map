from typing import Literal, Optional

from pydantic import BaseModel, ConfigDict, Field


class ArcoCreate(BaseModel):
    titulo: str = Field(min_length=1, max_length=200)
    resumo: str = Field(default="", max_length=5000)
    ordem: int = Field(default=0, ge=0)
    visivel_para_todos: bool = True
    cor: Optional[str] = Field(default=None, max_length=7)
    sessao_ids: list[int] = Field(default_factory=list)
    sessao_transicao_id: Optional[int] = None


class ArcoUpdate(BaseModel):
    titulo: Optional[str] = Field(default=None, min_length=1, max_length=200)
    resumo: Optional[str] = Field(default=None, max_length=5000)
    ordem: Optional[int] = Field(default=None, ge=0)
    visivel_para_todos: Optional[bool] = None
    cor: Optional[str] = Field(default=None, max_length=7)
    sessao_ids: Optional[list[int]] = None
    sessao_transicao_id: Optional[int] = None


class ArcoRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    titulo: str
    resumo: str
    ordem: int
    visivel_para_todos: bool = True
    cor: Optional[str] = None
    sessao_ids: list[int] = Field(default_factory=list)
    sessao_transicao_id: Optional[int] = None


class PropostaArcoRead(BaseModel):
    titulo: str
    resumo: str = ""
    sessao_ids: list[int] = Field(default_factory=list)
    sessao_transicao_id: Optional[int] = None
    local_ids: list[int] = Field(default_factory=list)


class ProporArcosResponse(BaseModel):
    estado: Literal["propostas", "sessoes_insuficientes", "falha"]
    mensagem: str = ""
    propostas: list[PropostaArcoRead] = Field(default_factory=list)
