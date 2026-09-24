from fastapi import APIRouter, Depends, Request, status
from sqlmodel import Session

from app.database import get_session
from app.schemas.evento import EventoAdmin, EventoCreate, EventoListAdmin, EventoUpdate
from app.services import evento_service
from app.services.rate_limit import limiter

router = APIRouter()


@router.get("/eventos", response_model=EventoListAdmin)
def list_eventos_admin(session: Session = Depends(get_session)) -> EventoListAdmin:
    return EventoListAdmin(eventos=evento_service.list_admin(session))


@router.get("/eventos/{evento_id}", response_model=EventoAdmin)
def get_evento_admin(evento_id: int, session: Session = Depends(get_session)) -> EventoAdmin:
    return evento_service.get_admin(session, evento_id)


@router.post("/eventos", response_model=EventoAdmin, status_code=status.HTTP_201_CREATED)
@limiter.limit("30/minute")
def create_evento(
    request: Request,
    payload: EventoCreate,
    session: Session = Depends(get_session),
) -> EventoAdmin:
    return evento_service.create_evento(session, payload)


@router.patch("/eventos/{evento_id}", response_model=EventoAdmin)
@limiter.limit("30/minute")
def update_evento(
    request: Request,
    evento_id: int,
    payload: EventoUpdate,
    session: Session = Depends(get_session),
) -> EventoAdmin:
    return evento_service.update_evento(session, evento_id, payload)


@router.delete("/eventos/{evento_id}", status_code=status.HTTP_204_NO_CONTENT)
@limiter.limit("30/minute")
def delete_evento(
    request: Request,
    evento_id: int,
    session: Session = Depends(get_session),
) -> None:
    evento_service.delete_evento(session, evento_id)
