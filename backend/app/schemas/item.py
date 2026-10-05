from typing import Optional

from pydantic import BaseModel, ConfigDict, Field, field_validator


class ItemRefSessao(BaseModel):
    id: int
    numero: int
    titulo: str


class ItemRefEvento(BaseModel):
    id: int
    titulo: str
    ano: int
    mes: Optional[int] = None


class ItemPublic(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    nome: str
    descricao: str = ""
    sessoes: list[ItemRefSessao] = Field(default_factory=list)
    eventos: list[ItemRefEvento] = Field(default_factory=list)


class ItemAdmin(ItemPublic):
    visivel_para_todos: bool = True


class ItemCreate(BaseModel):
    nome: str = Field(min_length=1, max_length=200)
    descricao: str = Field(default="", max_length=50000)
    visivel_para_todos: bool = True
    sessao_ids: list[int] = Field(default_factory=list)
    evento_ids: list[int] = Field(default_factory=list)

    @field_validator("nome")
    @classmethod
    def nome_nao_vazio(cls, value: str) -> str:
        stripped = value.strip()
        if not stripped:
            raise ValueError("nome nao pode ser vazio")
        return stripped


class ItemUpdate(BaseModel):
    nome: Optional[str] = Field(default=None, min_length=1, max_length=200)
    descricao: Optional[str] = Field(default=None, max_length=50000)
    visivel_para_todos: Optional[bool] = None
    sessao_ids: Optional[list[int]] = None
    evento_ids: Optional[list[int]] = None

    @field_validator("nome")
    @classmethod
    def nome_nao_vazio(cls, value: str | None) -> str | None:
        if value is None:
            return None
        stripped = value.strip()
        if not stripped:
            raise ValueError("nome nao pode ser vazio")
        return stripped


class ItemListPublic(BaseModel):
    itens: list[ItemPublic]


class ItemListAdmin(BaseModel):
    itens: list[ItemAdmin]
