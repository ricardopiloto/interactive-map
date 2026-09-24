from fastapi import APIRouter, Depends
from sqlmodel import Session

from app.database import get_session
from app.schemas.evento import EventoListPublic, EventoPublic
from app.services import evento_service

router = APIRouter()


@router.get("/eventos", response_model=EventoListPublic)
def list_eventos(session: Session = Depends(get_session)) -> EventoListPublic:
    return EventoListPublic(eventos=evento_service.list_public(session))


@router.get("/eventos/{evento_id}", response_model=EventoPublic)
def get_evento(evento_id: int, session: Session = Depends(get_session)) -> EventoPublic:
    return evento_service.get_public(session, evento_id)
