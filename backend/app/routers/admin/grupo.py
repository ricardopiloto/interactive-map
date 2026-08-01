from datetime import datetime, timezone

from fastapi import APIRouter, Depends, Request
from sqlmodel import Session

from app.database import get_session
from app.models.grupo import GrupoPosicao
from app.routers.public.grupo import _get_or_create
from app.schemas.grupo import GrupoPosicaoRead, GrupoPosicaoUpdate
from app.services.rate_limit import limiter

router = APIRouter()


@router.put("/grupo", response_model=GrupoPosicaoRead)
@limiter.limit("30/minute")
def update_grupo(
    request: Request,
    payload: GrupoPosicaoUpdate,
    session: Session = Depends(get_session),
) -> GrupoPosicao:
    grupo = _get_or_create(session)
    grupo.x = payload.x
    grupo.y = payload.y
    if payload.formato is not None:
        grupo.formato = payload.formato
    grupo.atualizado_em = datetime.now(timezone.utc)
    session.add(grupo)
    session.commit()
    session.refresh(grupo)
    return grupo
