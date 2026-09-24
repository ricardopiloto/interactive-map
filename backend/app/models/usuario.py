from __future__ import annotations

from datetime import datetime
from typing import Optional

from sqlmodel import Field

from app.models.campanha import ControlSQLModel


class Usuario(ControlSQLModel, table=True):
    __tablename__ = "usuario"

    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(max_length=320, unique=True, index=True)
    senha_hash: Optional[str] = Field(default=None, max_length=500)
    activo: bool = Field(default=False)
    criado_em: datetime = Field(default_factory=datetime.utcnow)
    actualizado_em: datetime = Field(default_factory=datetime.utcnow)


class Membro(ControlSQLModel, table=True):
    __tablename__ = "membro"

    id: Optional[int] = Field(default=None, primary_key=True)
    usuario_id: int = Field(foreign_key="usuario.id", index=True)
    campanha_id: int = Field(foreign_key="campanha.id", index=True)
    papel: str = Field(default="dono", max_length=40)
    criado_em: datetime = Field(default_factory=datetime.utcnow)


class Convite(ControlSQLModel, table=True):
    __tablename__ = "convite"

    id: Optional[int] = Field(default=None, primary_key=True)
    usuario_id: int = Field(foreign_key="usuario.id", index=True)
    tipo: str = Field(max_length=20)  # activar | reset
    token_hash: str = Field(max_length=128, unique=True, index=True)
    expira_em: datetime
    consumido_em: Optional[datetime] = Field(default=None)
    criado_em: datetime = Field(default_factory=datetime.utcnow)


class Sessao(ControlSQLModel, table=True):
    __tablename__ = "sessao"

    id: Optional[int] = Field(default=None, primary_key=True)
    usuario_id: int = Field(foreign_key="usuario.id", index=True)
    token_hash: str = Field(max_length=128, unique=True, index=True)
    criado_em: datetime = Field(default_factory=datetime.utcnow)
    ultimo_acesso: datetime = Field(default_factory=datetime.utcnow)
    revogada: bool = Field(default=False)


class LoginBloqueio(ControlSQLModel, table=True):
    __tablename__ = "login_bloqueio"

    id: Optional[int] = Field(default=None, primary_key=True)
    chave: str = Field(max_length=400, unique=True, index=True)
    falhas: int = Field(default=0)
    bloqueado_ate: Optional[datetime] = Field(default=None)
    actualizado_em: datetime = Field(default_factory=datetime.utcnow)
