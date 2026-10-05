from typing import Literal, Optional

from pydantic import BaseModel, Field


class IntervaloAparicao(BaseModel):
    """Elapsed time since the previous appearance. Zeros are valid — nothing is hidden by a threshold."""

    anos: int = 0
    meses: int = 0
    sessoes: Optional[int] = None


class AparicaoPublic(BaseModel):
    origem: Literal["sessao", "evento"]
    id: int
    titulo: str
    numero: Optional[int] = None
    ano: Optional[int] = None
    mes: Optional[int] = None
    reaparicao: bool = False
    intervalo: Optional[IntervaloAparicao] = None


class AparicaoAdmin(AparicaoPublic):
    visivel_para_todos: bool = True


class EntidadeDescobertaPublic(BaseModel):
    tipo: Literal["personagem", "local", "faccao", "item"]
    id: Optional[int] = None
    nome: str
    descricao: Optional[str] = None
    aparicoes: list[AparicaoPublic] = Field(default_factory=list)


class EntidadeDescobertaAdmin(BaseModel):
    tipo: Literal["personagem", "local", "faccao", "item"]
    id: Optional[int] = None
    nome: str
    descricao: Optional[str] = None
    aparicoes: list[AparicaoAdmin] = Field(default_factory=list)


class AlertaInconsistencia(BaseModel):
    personagem_id: int
    personagem_nome: str
    sessao_visivel_id: int
    sessao_visivel_numero: int
    sessao_oculta_id: int
    sessao_oculta_numero: int
    sessao_oculta_titulo: str


class DescobertaPublic(BaseModel):
    entidades: list[EntidadeDescobertaPublic]


class DescobertaAdmin(BaseModel):
    entidades: list[EntidadeDescobertaAdmin]
    alertas: list[AlertaInconsistencia] = Field(default_factory=list)
