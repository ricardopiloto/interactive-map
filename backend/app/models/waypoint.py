from enum import Enum
from typing import Optional

from sqlmodel import Field, SQLModel


class RouteTipo(str, Enum):
    estrada = "estrada"
    rio = "rio"
    trilha = "trilha"


class Waypoint(SQLModel, table=True):
    __tablename__ = "waypoint"

    id: Optional[int] = Field(default=None, primary_key=True)
    nome: Optional[str] = Field(default=None, max_length=200)
    x: float = Field(ge=0.0, le=1.0)
    y: float = Field(ge=0.0, le=1.0)
    local_id: Optional[int] = Field(
        default=None,
        foreign_key="local.id",
        index=True,
        unique=True,
        description="Local vinculado (no máximo um waypoint por local)",
    )


class RouteSegment(SQLModel, table=True):
    __tablename__ = "route_segment"

    id: Optional[int] = Field(default=None, primary_key=True)
    waypoint_a_id: int = Field(foreign_key="waypoint.id", index=True)
    waypoint_b_id: int = Field(foreign_key="waypoint.id", index=True)
    tipo: RouteTipo = Field(default=RouteTipo.estrada)
    # JSON list of {x,y} along A→B (excluding endpoints)
    pontos_intermediarios: str = Field(default="[]", max_length=50000)
    distancia_milhas: float = Field(default=0.0, ge=0.0)
    modificador_velocidade: Optional[float] = Field(default=None, gt=0.0)


class MapScale(SQLModel, table=True):
    __tablename__ = "map_scale"

    id: Optional[int] = Field(default=None, primary_key=True)
    miles_per_map_unit: float = Field(default=100.0, gt=0.0)
    notas: Optional[str] = Field(default=None, max_length=500)
