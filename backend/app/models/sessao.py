from typing import Optional

from sqlmodel import Field, SQLModel


class Sessao(SQLModel, table=True):
    """Campaign chronicle session entry."""

    __tablename__ = "sessao"

    id: Optional[int] = Field(default=None, primary_key=True)
    numero: int = Field(nullable=False, unique=True, index=True)
    titulo: str = Field(max_length=200)
    data_rotulo: Optional[str] = Field(default=None, max_length=100)
    resumo: str = Field(default="", max_length=50000)
    visivel_para_todos: bool = Field(default=True)
