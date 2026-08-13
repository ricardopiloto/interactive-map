from pydantic import BaseModel, Field


class InstanceConfigRead(BaseModel):
    sistema: str
    modulos_ativos: list[str] = Field(default_factory=list)
    has_map_image: bool
