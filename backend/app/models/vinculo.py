from enum import Enum
from typing import Optional

from sqlalchemy import UniqueConstraint
from sqlmodel import Field, SQLModel


class VinculoTipo(str, Enum):
    aliado = "aliado"
    amizade = "amizade"
    inimizade = "inimizade"
    romance = "romance"
    familia = "familia"
    conhecido = "conhecido"


class VinculoDirecao(str, Enum):
    a_para_b = "a_para_b"
    b_para_a = "b_para_a"


class Vinculo(SQLModel, table=True):
    __tablename__ = "vinculo"
    __table_args__ = (
        UniqueConstraint("personagem_a_id", "personagem_b_id", name="uq_vinculo_pair"),
    )

    id: Optional[int] = Field(default=None, primary_key=True)
    personagem_a_id: int = Field(foreign_key="npc.id", index=True)
    personagem_b_id: int = Field(foreign_key="npc.id", index=True)
    tipo_ab: VinculoTipo = Field(max_length=20)
    tipo_ba: Optional[VinculoTipo] = Field(default=None, max_length=20)
    nota_ab: str = Field(default="", max_length=500)
    nota_ba: str = Field(default="", max_length=500)
    publico: bool = Field(default=False)
    conhecido_ab: bool = Field(default=True)
    conhecido_ba: bool = Field(default=True)
    qualificador: str = Field(default="", max_length=80)
    direcao: Optional[VinculoDirecao] = Field(default=None, max_length=20)
