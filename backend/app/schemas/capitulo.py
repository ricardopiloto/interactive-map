from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class CapituloRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    arco_id: Optional[int] = None
    titulo: str
    ordem: int
    corpo_markdown: str = ""


class CapituloAdmin(CapituloRead):
    visivel_para_todos: bool = False


class CapituloCreate(BaseModel):
    arco_id: Optional[int] = None
    titulo: str = Field(min_length=1, max_length=200)
    ordem: Optional[int] = None
    corpo_markdown: str = Field(default="", max_length=50000)
    visivel_para_todos: bool = False


class CapituloUpdate(BaseModel):
    arco_id: Optional[int] = None
    titulo: Optional[str] = Field(default=None, min_length=1, max_length=200)
    ordem: Optional[int] = None
    corpo_markdown: Optional[str] = Field(default=None, max_length=50000)
    visivel_para_todos: Optional[bool] = None


class CapituloListPublic(BaseModel):
    capitulos: list[CapituloRead]


class CapituloListAdmin(BaseModel):
    capitulos: list[CapituloAdmin]
