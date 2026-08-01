from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class ArcoCreate(BaseModel):
    titulo: str = Field(min_length=1, max_length=200)
    resumo: str = Field(default="", max_length=5000)
    ordem: int = Field(default=0, ge=0)


class ArcoUpdate(BaseModel):
    titulo: Optional[str] = Field(default=None, min_length=1, max_length=200)
    resumo: Optional[str] = Field(default=None, max_length=5000)
    ordem: Optional[int] = Field(default=None, ge=0)


class ArcoRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    titulo: str
    resumo: str
    ordem: int
