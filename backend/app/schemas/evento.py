from typing import Optional

from pydantic import BaseModel, ConfigDict, Field, field_validator


class EventoRefLocal(BaseModel):
    id: int
    nome: str


class EventoRefPersonagem(BaseModel):
    id: int
    nome: str
    tipo: str
    retrato_url: Optional[str] = None


class EventoPublic(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    titulo: str
    ano: int
    mes: Optional[int] = None
    rotulo_era: Optional[str] = None
    descricao: str = ""
    sessao_id: Optional[int] = None
    locais: list[EventoRefLocal] = Field(default_factory=list)
    personagens: list[EventoRefPersonagem] = Field(default_factory=list)


class EventoAdmin(EventoPublic):
    visivel_para_todos: bool = True


class EventoCreate(BaseModel):
    titulo: str = Field(min_length=1, max_length=200)
    ano: int
    mes: Optional[int] = None
    rotulo_era: Optional[str] = Field(default=None, max_length=100)
    descricao: str = Field(default="", max_length=50000)
    visivel_para_todos: bool = True
    sessao_id: Optional[int] = None
    local_ids: list[int] = Field(default_factory=list)
    personagem_ids: list[int] = Field(default_factory=list)

    @field_validator("titulo")
    @classmethod
    def titulo_nao_vazio(cls, value: str) -> str:
        stripped = value.strip()
        if not stripped:
            raise ValueError("titulo nao pode ser vazio")
        return stripped


class EventoUpdate(BaseModel):
    titulo: Optional[str] = Field(default=None, min_length=1, max_length=200)
    ano: Optional[int] = None
    mes: Optional[int] = None
    rotulo_era: Optional[str] = Field(default=None, max_length=100)
    descricao: Optional[str] = Field(default=None, max_length=50000)
    visivel_para_todos: Optional[bool] = None
    sessao_id: Optional[int] = None
    local_ids: Optional[list[int]] = None
    personagem_ids: Optional[list[int]] = None

    @field_validator("titulo")
    @classmethod
    def titulo_nao_vazio(cls, value: str | None) -> str | None:
        if value is None:
            return None
        stripped = value.strip()
        if not stripped:
            raise ValueError("titulo nao pode ser vazio")
        return stripped


class EventoListPublic(BaseModel):
    eventos: list[EventoPublic]


class EventoListAdmin(BaseModel):
    eventos: list[EventoAdmin]
