from pydantic import BaseModel, Field


class InstanceConfigRead(BaseModel):
    slug: str
    nome: str
    sistema: str
    modulos_ativos: list[str] = Field(default_factory=list)
    has_map_image: bool
    mapa_arquivo: str | None = None
    map_url: str | None = None
    unidade_distancia: str = "mi"
    genero: str = "fantasia"
    capa_url: str | None = None
