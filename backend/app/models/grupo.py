from datetime import datetime, timezone
from typing import Literal, Optional

from sqlmodel import Field, SQLModel


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


GrupoFormato = Literal["bandeira", "brasao"]


class GrupoPosicao(SQLModel, table=True):
    """Singleton lógico: a aplicação mantém um único registro (id=1)."""

    __tablename__ = "grupo_posicao"

    id: Optional[int] = Field(default=None, primary_key=True)
    x: float = Field(ge=0.0, le=1.0, default=0.5)
    y: float = Field(ge=0.0, le=1.0, default=0.5)
    formato: str = Field(default="bandeira", max_length=20)
    atualizado_em: datetime = Field(default_factory=_utcnow)
