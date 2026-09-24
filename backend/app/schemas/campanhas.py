from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, Field


class CatalogoItem(BaseModel):
    slug: str
    nome: str
    sistema: str
    genero: str = "fantasia"
    capa_url: str | None = None


class CatalogoResponse(BaseModel):
    campanhas: list[CatalogoItem]


class PainelItem(BaseModel):
    slug: str
    nome: str
    sistema: str
    visibilidade: str
    unidade_distancia: str = "mi"
    genero: str = "fantasia"
    capa_url: str | None = None
    bytes_usados: int
    cota_bytes: int
    aviso_cota: bool


class MinhasResponse(BaseModel):
    campanhas: list[PainelItem]


class CriarCampanhaRequest(BaseModel):
    nome: str = Field(min_length=1, max_length=200)
    slug: str = Field(min_length=2, max_length=48)
    sistema: str = Field(min_length=1, max_length=40)
    genero: Literal["fantasia", "gotico", "scifi", "urbano"]
    visibilidade: Literal["listada", "so_link"] | None = None


class CriarCampanhaResponse(BaseModel):
    slug: str
    id: int
    nome: str
    sistema: str
    genero: str
    visibilidade: str


class VisibilidadeRequest(BaseModel):
    visibilidade: Literal["listada", "so_link"]


class VisibilidadeResponse(BaseModel):
    slug: str
    visibilidade: str


class UnidadeDistanciaRequest(BaseModel):
    unidade_distancia: Literal["mi", "km"]


class UnidadeDistanciaResponse(BaseModel):
    slug: str
    unidade_distancia: str


class CapaRequest(BaseModel):
    capa_arquivo: str | None = None
    limpar_capa: bool = False


class CapaResponse(BaseModel):
    slug: str
    capa_arquivo: str = ""
    capa_url: str | None = None
