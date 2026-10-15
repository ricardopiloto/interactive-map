from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


class CatalogoItem(BaseModel):
    id: int
    slug: str
    nome: str
    sistema: str
    capa_url: str | None = None


class CatalogoResponse(BaseModel):
    campanhas: list[CatalogoItem]


class PainelItem(BaseModel):
    id: int
    slug: str
    nome: str
    sistema: str
    visibilidade: str
    unidade_distancia: str = "mi"
    capa_url: str | None = None
    bytes_usados: int
    cota_bytes: int
    aviso_cota: bool
    modulos_ativos: list[str] = Field(default_factory=list)


class MinhasResponse(BaseModel):
    campanhas: list[PainelItem]


class CriarCampanhaRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    nome: str = Field(min_length=1, max_length=200)
    slug: str = Field(min_length=2, max_length=48)
    sistema: str = Field(min_length=1, max_length=40)
    visibilidade: Literal["listada", "so_link"] | None = None


class CriarCampanhaResponse(BaseModel):
    slug: str
    id: int
    nome: str
    sistema: str
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


# Módulos opcionais que o mestre pode ligar/desligar após a criação da campanha.
# Os modos da Linha do Tempo são escolha de tela, não configuração. Só o gancho de IA.
MODULOS_TOGGLE_PERMITIDOS = ("ia_arcos",)


class ModuloToggleRequest(BaseModel):
    modulo: Literal["ia_arcos"]
    ativo: bool


class ModuloToggleResponse(BaseModel):
    slug: str
    modulos_ativos: list[str]


class CapaRequest(BaseModel):
    capa_arquivo: str | None = None
    limpar_capa: bool = False


class CapaResponse(BaseModel):
    slug: str
    capa_arquivo: str = ""
    capa_url: str | None = None
