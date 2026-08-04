from typing import Optional

from pydantic import BaseModel, ConfigDict, Field, field_validator

_HEX_PIN = r"^#[0-9A-Fa-f]{6}$"


def _normalize_hex(value: str) -> str:
    return value.lower()


class LocalCreate(BaseModel):
    nome: str = Field(min_length=1, max_length=200)
    descricao: str = Field(default="", max_length=10000)
    x: float = Field(ge=0.0, le=1.0)
    y: float = Field(ge=0.0, le=1.0)
    imagem_url: Optional[str] = Field(default=None, max_length=500)
    data_sessao: Optional[str] = Field(default=None, max_length=100)
    arco_id: Optional[int] = None
    npc_ids: list[int] = Field(default_factory=list)
    saida_ids: list[int] = Field(default_factory=list)
    cor_pin: str = Field(min_length=7, max_length=7, pattern=_HEX_PIN)
    waypoint_id: Optional[int] = None

    @field_validator("cor_pin")
    @classmethod
    def normalize_cor_pin(cls, value: str) -> str:
        return _normalize_hex(value)


class LocalUpdate(BaseModel):
    nome: Optional[str] = Field(default=None, min_length=1, max_length=200)
    descricao: Optional[str] = Field(default=None, max_length=10000)
    x: Optional[float] = Field(default=None, ge=0.0, le=1.0)
    y: Optional[float] = Field(default=None, ge=0.0, le=1.0)
    imagem_url: Optional[str] = Field(default=None, max_length=500)
    data_sessao: Optional[str] = Field(default=None, max_length=100)
    arco_id: Optional[int] = None
    npc_ids: Optional[list[int]] = None
    saida_ids: Optional[list[int]] = None
    cor_pin: Optional[str] = Field(default=None, min_length=7, max_length=7, pattern=_HEX_PIN)
    waypoint_id: Optional[int] = None

    @field_validator("cor_pin")
    @classmethod
    def normalize_cor_pin(cls, value: Optional[str]) -> Optional[str]:
        return _normalize_hex(value) if value is not None else None


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
    saida_ids: list[int] = Field(default_factory=list)
    cor_pin: str
    waypoint_id: Optional[int] = None
