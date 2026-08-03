from typing import TYPE_CHECKING, Optional

from sqlmodel import Field, Relationship, SQLModel

from app.models.links import LocalNPCLink

if TYPE_CHECKING:
    from app.models.arco import Arco
    from app.models.npc import NPC


class Local(SQLModel, table=True):
    __tablename__ = "local"

    id: Optional[int] = Field(default=None, primary_key=True)
    nome: str = Field(max_length=200, index=True)
    descricao: str = Field(default="", max_length=10000)
    x: float = Field(ge=0.0, le=1.0, description="Coordenada relativa X (0–1)")
    y: float = Field(ge=0.0, le=1.0, description="Coordenada relativa Y (0–1)")
    imagem_url: Optional[str] = Field(default=None, max_length=500)
    data_sessao: Optional[str] = Field(default=None, max_length=100, description="Rótulo livre, ex.: Sessão 3")
    arco_id: Optional[int] = Field(default=None, foreign_key="arco.id", index=True)
    cor_pin: str = Field(
        default="#c4b5fd",
        max_length=7,
        description="Cor do pin no mapa (#RRGGBB)",
    )

    arco: Optional["Arco"] = Relationship(back_populates="locais")
    npcs: list["NPC"] = Relationship(back_populates="locais", link_model=LocalNPCLink)
