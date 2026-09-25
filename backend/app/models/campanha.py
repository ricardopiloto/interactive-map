from __future__ import annotations

from datetime import datetime
from typing import Any, Optional

from sqlalchemy import Column, MetaData
from sqlalchemy.types import JSON
from sqlmodel import Field, SQLModel

control_metadata = MetaData()


class ControlSQLModel(SQLModel):
    """Base for tables that live only in control.db."""

    metadata = control_metadata


class Campanha(ControlSQLModel, table=True):
    __tablename__ = "campanha"

    id: Optional[int] = Field(default=None, primary_key=True)
    slug: str = Field(max_length=48, unique=True, index=True)
    nome: str = Field(max_length=200)
    sistema: str = Field(max_length=40)
    modulos_ativos: list[Any] = Field(
        default_factory=list,
        sa_column=Column(JSON, nullable=False),
    )
    visibilidade: str = Field(default="listada", max_length=20)
    unidade_distancia: str = Field(default="mi", max_length=8)
    genero: str = Field(default="fantasia", max_length=16)
    capa_arquivo: str = Field(default="", max_length=500)
    caminho: str = Field(max_length=200)
    mapa_arquivo: str = Field(default="", max_length=500)
    cota_bytes: int = Field(default=10 * 1024**3)
    bytes_usados: int = Field(default=0)
    activa: bool = Field(default=True)
    criado_em: Optional[datetime] = Field(default=None)
    modificado_em: Optional[datetime] = Field(default=None)
