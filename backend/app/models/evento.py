from typing import Optional

from sqlmodel import Field, SQLModel


class Evento(SQLModel, table=True):
    """Campaign timeline event (manual chronicle entry)."""

    __tablename__ = "evento"

    id: Optional[int] = Field(default=None, primary_key=True)
    titulo: str = Field(max_length=200)
    ano: int = Field(nullable=False, index=True)
    mes: Optional[int] = Field(default=None)
    rotulo_era: Optional[str] = Field(default=None, max_length=100)
    descricao: str = Field(default="", max_length=50000)
    sessao_id: Optional[int] = Field(default=None, foreign_key="sessao.id")
    visivel_para_todos: bool = Field(default=True)
