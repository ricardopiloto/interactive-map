from __future__ import annotations

from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel, Field

from app.deps.auth import MembroContext, require_membro
from app.errors import raise_api_error
from app.services.geradores import TIPOS, sortear

router = APIRouter()


class GeradorResultado(BaseModel):
    tipo: str
    resultado: str
    sistema_usado: str
    fallback: bool = False


@router.post("/geradores/{tipo}", response_model=GeradorResultado)
def sortear_gerador(
    tipo: str,
    lang: str | None = Query(default=None),
    ctx: MembroContext = Depends(require_membro),
) -> GeradorResultado:
    if tipo not in TIPOS:
        raise_api_error("GERADOR_TIPO_DESCONHECIDO", status_code=404)
    result = sortear(
        tipo=tipo,
        sistema=ctx.campanha.sistema,
        lang=lang,
        scope=ctx.campanha.slug,
    )
    return GeradorResultado(
        tipo=result.tipo,
        resultado=result.resultado,
        sistema_usado=result.sistema_usado,
        fallback=result.fallback,
    )
