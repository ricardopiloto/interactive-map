from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

GrupoFormato = Literal["bandeira", "brasao"]


class GrupoPosicaoUpdate(BaseModel):
    x: float = Field(ge=0.0, le=1.0)
    y: float = Field(ge=0.0, le=1.0)
    formato: GrupoFormato | None = None


class GrupoPosicaoRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    x: float
    y: float
    formato: GrupoFormato = "bandeira"
    atualizado_em: datetime
