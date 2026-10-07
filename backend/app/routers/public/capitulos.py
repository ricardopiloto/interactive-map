from fastapi import APIRouter, Depends, Query
from sqlmodel import Session

from app.database import get_session
from app.schemas.capitulo import CapituloListPublic, CapituloRead
from app.services import capitulo_service

router = APIRouter()


@router.get("/capitulos", response_model=CapituloListPublic)
def list_capitulos(
    arco_id: int | None = Query(None),
    session: Session = Depends(get_session),
) -> CapituloListPublic:
    return CapituloListPublic(capitulos=capitulo_service.list_public(session, arco_id))


@router.get("/capitulos/{capitulo_id}", response_model=CapituloRead)
def get_capitulo(capitulo_id: int, session: Session = Depends(get_session)) -> CapituloRead:
    return capitulo_service.get_public(session, capitulo_id)
