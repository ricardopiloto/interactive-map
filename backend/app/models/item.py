from typing import Optional

from sqlmodel import Field, SQLModel


class Item(SQLModel, table=True):
    """Narrative object registered by the mestre and linked to sessions and events."""

    __tablename__ = "item"

    id: Optional[int] = Field(default=None, primary_key=True)
    nome: str = Field(max_length=200)
    descricao: str = Field(default="", max_length=50000)
    visivel_para_todos: bool = Field(default=True)
