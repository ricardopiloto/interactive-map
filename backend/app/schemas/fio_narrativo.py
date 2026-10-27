from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

EstadoFio = Literal["aberto", "resolvido"]
OrigemFio = Literal["manual", "ia"]


class FioCreate(BaseModel):
    titulo: str = Field(min_length=1, max_length=200)
    descricao: str = Field(default="", max_length=5000)
    origem: OrigemFio = "manual"
    sessao_origem_id: int | None = Field(default=None, gt=0)


class FioUpdate(BaseModel):
    titulo: str | None = Field(default=None, min_length=1, max_length=200)
    descricao: str | None = Field(default=None, max_length=5000)
    estado: EstadoFio | None = None
    sessao_origem_id: int | None = Field(default=None, gt=0)


class FioRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    titulo: str
    descricao: str
    estado: EstadoFio
    origem: OrigemFio
    sessao_origem_id: int | None
    ordem: int
    criado_em: datetime


class FioLote(BaseModel):
    fios: list[FioCreate] = Field(min_length=1, max_length=10)


class FioOrdem(BaseModel):
    ids: list[int]
