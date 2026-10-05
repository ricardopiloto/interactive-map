from fastapi import APIRouter, Depends, Request, status
from sqlmodel import Session

from app.database import get_session
from app.deps.auth import MembroContext, require_dono
from app.schemas.item import ItemAdmin, ItemCreate, ItemListAdmin, ItemUpdate
from app.services import item_service
from app.services.rate_limit import limiter

router = APIRouter()


@router.get("/itens", response_model=ItemListAdmin)
def list_itens_admin(
    _dono: MembroContext = Depends(require_dono),
    session: Session = Depends(get_session),
) -> ItemListAdmin:
    return ItemListAdmin(itens=item_service.list_admin(session))


@router.get("/itens/{item_id}", response_model=ItemAdmin)
def get_item_admin(
    item_id: int,
    _dono: MembroContext = Depends(require_dono),
    session: Session = Depends(get_session),
) -> ItemAdmin:
    return item_service.get_admin(session, item_id)


@router.post("/itens", response_model=ItemAdmin, status_code=status.HTTP_201_CREATED)
@limiter.limit("30/minute")
def create_item(
    request: Request,
    payload: ItemCreate,
    _dono: MembroContext = Depends(require_dono),
    session: Session = Depends(get_session),
) -> ItemAdmin:
    return item_service.create_item(session, payload)


@router.patch("/itens/{item_id}", response_model=ItemAdmin)
@limiter.limit("30/minute")
def update_item(
    request: Request,
    item_id: int,
    payload: ItemUpdate,
    _dono: MembroContext = Depends(require_dono),
    session: Session = Depends(get_session),
) -> ItemAdmin:
    return item_service.update_item(session, item_id, payload)


@router.delete("/itens/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
@limiter.limit("30/minute")
def delete_item(
    request: Request,
    item_id: int,
    _dono: MembroContext = Depends(require_dono),
    session: Session = Depends(get_session),
) -> None:
    item_service.delete_item(session, item_id)
