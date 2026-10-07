from fastapi import APIRouter, Depends, Query, Request, status
from sqlmodel import Session

from app.database import get_session
from app.schemas.capitulo import CapituloAdmin, CapituloCreate, CapituloListAdmin, CapituloUpdate
from app.services import capitulo_service
from app.services.rate_limit import limiter

router = APIRouter()


@router.get("/capitulos", response_model=CapituloListAdmin)
def list_capitulos_admin(
    arco_id: int | None = Query(None),
    session: Session = Depends(get_session),
) -> CapituloListAdmin:
    return CapituloListAdmin(capitulos=capitulo_service.list_admin(session, arco_id))


@router.get("/capitulos/{capitulo_id}", response_model=CapituloAdmin)
def get_capitulo_admin(
    capitulo_id: int,
    session: Session = Depends(get_session),
) -> CapituloAdmin:
    return capitulo_service.get_admin(session, capitulo_id)


@router.post("/capitulos", response_model=CapituloAdmin, status_code=status.HTTP_201_CREATED)
@limiter.limit("30/minute")
def create_capitulo_admin(
    request: Request,
    payload: CapituloCreate,
    session: Session = Depends(get_session),
) -> CapituloAdmin:
    return capitulo_service.create_capitulo(session, payload)


@router.patch("/capitulos/{capitulo_id}", response_model=CapituloAdmin)
@limiter.limit("30/minute")
def update_capitulo_admin(
    request: Request,
    capitulo_id: int,
    payload: CapituloUpdate,
    session: Session = Depends(get_session),
) -> CapituloAdmin:
    return capitulo_service.update_capitulo(session, capitulo_id, payload)


@router.delete("/capitulos/{capitulo_id}", status_code=status.HTTP_204_NO_CONTENT)
@limiter.limit("30/minute")
def delete_capitulo_admin(
    request: Request,
    capitulo_id: int,
    session: Session = Depends(get_session),
) -> None:
    capitulo_service.delete_capitulo(session, capitulo_id)
