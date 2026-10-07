from typing import Optional

from sqlalchemy import Column, ForeignKey, Integer
from sqlmodel import Field, SQLModel


class Capitulo(SQLModel, table=True):
    """Adventure prep chapter, optionally belonging to an arc. Sessions reference the
    chapter they played (see Sessao.capitulo_id) — a chapter can span several sessions."""

    __tablename__ = "capitulo"

    id: Optional[int] = Field(default=None, primary_key=True)
    arco_id: Optional[int] = Field(
        default=None,
        sa_column=Column(
            Integer,
            ForeignKey("arco.id", ondelete="CASCADE"),
            nullable=True,
            index=True,
        ),
    )
    titulo: str = Field(max_length=200)
    ordem: int = Field(default=0, index=True)
    corpo_markdown: str = Field(default="", max_length=50000)
    visivel_para_todos: bool = Field(default=False)
