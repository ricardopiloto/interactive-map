from datetime import datetime, timezone
from typing import Optional

from sqlmodel import Field, SQLModel


class FioNarrativo(SQLModel, table=True):
    __tablename__ = "fio_narrativo"

    id: Optional[int] = Field(default=None, primary_key=True)
    titulo: str = Field(max_length=200)
    descricao: str = Field(default="", max_length=5000)
    estado: str = Field(default="aberto", max_length=20)
    origem: str = Field(default="manual", max_length=20)
    sessao_origem_id: Optional[int] = Field(default=None, index=True)
    ordem: int = Field(default=0, index=True)
    criado_em: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
