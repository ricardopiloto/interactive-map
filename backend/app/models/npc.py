from enum import Enum
from typing import TYPE_CHECKING, Optional

from sqlmodel import Field, Relationship, SQLModel

from app.models.links import LocalNPCLink

if TYPE_CHECKING:
    from app.models.local import Local


class NPCStatus(str, Enum):
    vivo = "vivo"
    morto = "morto"
    desaparecido = "desaparecido"
    desconhecido = "desconhecido"


class NPC(SQLModel, table=True):
    __tablename__ = "npc"

    id: Optional[int] = Field(default=None, primary_key=True)
    nome: str = Field(max_length=200, index=True)
    descricao: str = Field(default="", max_length=10000)
    faccao: Optional[str] = Field(default=None, max_length=200)
    status: Optional[NPCStatus] = Field(default=NPCStatus.desconhecido)
    retrato_url: Optional[str] = Field(default=None, max_length=500)

    locais: list["Local"] = Relationship(back_populates="npcs", link_model=LocalNPCLink)
