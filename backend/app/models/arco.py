from typing import TYPE_CHECKING, Optional

from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from app.models.local import Local


class Arco(SQLModel, table=True):
    __tablename__ = "arco"

    id: Optional[int] = Field(default=None, primary_key=True)
    titulo: str = Field(max_length=200, index=True)
    resumo: str = Field(default="", max_length=5000)
    ordem: int = Field(default=0, index=True)
    visivel_para_todos: bool = Field(default=True)
    cor: Optional[str] = Field(default=None, max_length=7, description="Cor da raia (#RRGGBB)")

    locais: list["Local"] = Relationship(back_populates="arco")
