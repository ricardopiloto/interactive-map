from enum import Enum
from typing import TYPE_CHECKING, Any, Optional

from sqlalchemy import Column
from sqlalchemy.types import JSON
from sqlmodel import Field, Relationship, SQLModel

from app.models.links import LocalNPCLink

if TYPE_CHECKING:
    from app.models.local import Local


class NPCStatus(str, Enum):
    vivo = "vivo"
    morto = "morto"
    desaparecido = "desaparecido"
    desconhecido = "desconhecido"


class PersonagemTipo(str, Enum):
    pj = "pj"
    npc = "npc"


class NPC(SQLModel, table=True):
    """Personagem unificado (PJ|NPC). Table name kept as `npc` for SQLite stability."""

    __tablename__ = "npc"

    id: Optional[int] = Field(default=None, primary_key=True)
    nome: str = Field(max_length=200, index=True)
    tipo: PersonagemTipo = Field(default=PersonagemTipo.npc, max_length=10)
    papel: Optional[str] = Field(default=None, max_length=200)
    descricao: str = Field(default="", max_length=10000)
    faccao: Optional[str] = Field(default=None, max_length=200)
    status: Optional[NPCStatus] = Field(default=NPCStatus.desconhecido)
    retrato_url: Optional[str] = Field(default=None, max_length=500)
    visivel_para_todos: bool = Field(default=True)
    extensoes_mecanica: dict[str, Any] = Field(
        default_factory=dict,
        sa_column=Column(JSON, nullable=False),
    )

    locais: list["Local"] = Relationship(back_populates="npcs", link_model=LocalNPCLink)
