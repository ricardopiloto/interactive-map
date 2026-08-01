from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class LocalCreate(BaseModel):
    nome: str = Field(min_length=1, max_length=200)
    descricao: str = Field(default="", max_length=10000)
    x: float = Field(ge=0.0, le=1.0)
    y: float = Field(ge=0.0, le=1.0)
    imagem_url: Optional[str] = Field(default=None, max_length=500)
    data_sessao: Optional[str] = Field(default=None, max_length=100)
    arco_id: Optional[int] = None
    npc_ids: list[int] = Field(default_factory=list)


class LocalUpdate(BaseModel):
    nome: Optional[str] = Field(default=None, min_length=1, max_length=200)
    descricao: Optional[str] = Field(default=None, max_length=10000)
    x: Optional[float] = Field(default=None, ge=0.0, le=1.0)
    y: Optional[float] = Field(default=None, ge=0.0, le=1.0)
    imagem_url: Optional[str] = Field(default=None, max_length=500)
    data_sessao: Optional[str] = Field(default=None, max_length=100)
    arco_id: Optional[int] = None
    npc_ids: Optional[list[int]] = None


class LocalRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    nome: str
    descricao: str
    x: float
    y: float
    imagem_url: Optional[str]
    data_sessao: Optional[str]
    arco_id: Optional[int]
    npc_ids: list[int] = Field(default_factory=list)
