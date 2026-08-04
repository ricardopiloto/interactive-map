from enum import Enum
from typing import Literal, Optional

from pydantic import BaseModel, Field, model_validator


class RouteTipo(str, Enum):
    estrada = "estrada"
    rio = "rio"
    trilha = "trilha"


Ritmo = Literal["normal", "intenso"]


class Point(BaseModel):
    x: float = Field(ge=0.0, le=1.0)
    y: float = Field(ge=0.0, le=1.0)


class WaypointCreate(BaseModel):
    nome: Optional[str] = Field(default=None, max_length=200)
    x: float = Field(ge=0.0, le=1.0)
    y: float = Field(ge=0.0, le=1.0)
    local_id: Optional[int] = None


class WaypointUpdate(BaseModel):
    nome: Optional[str] = Field(default=None, max_length=200)
    x: Optional[float] = Field(default=None, ge=0.0, le=1.0)
    y: Optional[float] = Field(default=None, ge=0.0, le=1.0)
    local_id: Optional[int] = None


class WaypointRead(BaseModel):
    id: int
    nome: Optional[str]
    x: float
    y: float
    local_id: Optional[int]

    model_config = {"from_attributes": True}


class RouteSegmentCreate(BaseModel):
    waypoint_a_id: int
    waypoint_b_id: int
    tipo: RouteTipo = RouteTipo.estrada
    pontos_intermediarios: list[Point] = Field(default_factory=list)
    modificador_velocidade: Optional[float] = Field(default=None, gt=0.0)

    @model_validator(mode="after")
    def no_self_loop(self) -> "RouteSegmentCreate":
        if self.waypoint_a_id == self.waypoint_b_id:
            raise ValueError("Segmento não pode ligar um nó a si mesmo")
        return self


class RouteSegmentUpdate(BaseModel):
    waypoint_a_id: Optional[int] = None
    waypoint_b_id: Optional[int] = None
    tipo: Optional[RouteTipo] = None
    pontos_intermediarios: Optional[list[Point]] = None
    modificador_velocidade: Optional[float] = Field(default=None, gt=0.0)


class RouteSegmentRead(BaseModel):
    id: int
    waypoint_a_id: int
    waypoint_b_id: int
    tipo: RouteTipo
    pontos_intermediarios: list[Point]
    distancia_milhas: float
    modificador_velocidade: Optional[float]


class MapScaleRead(BaseModel):
    id: int
    miles_per_map_unit: float
    notas: Optional[str]

    model_config = {"from_attributes": True}


class MapScaleUpdate(BaseModel):
    miles_per_map_unit: float = Field(gt=0.0)
    notas: Optional[str] = Field(default=None, max_length=500)


class RoutePlanItem(BaseModel):
    waypoint_ids: list[int]
    distancia_milhas: float
    tempo_horas: float
    tempo_dias: int = 0
    tempo_horas_resto: float = 0.0
    tempo_texto: str = ""
    tipos: list[str]
    geometria: list[Point]
    custo_dentro_bp: float = 0.0
    custo_fora_bp: float = 0.0


class RoutePlanResponse(BaseModel):
    rotas: list[RoutePlanItem]
