from fastapi import APIRouter, Depends
from sqlmodel import Session

from app.database import get_session
from app.schemas.item import ItemListPublic, ItemPublic
from app.services import item_service

router = APIRouter()


@router.get("/itens", response_model=ItemListPublic)
def list_itens(session: Session = Depends(get_session)) -> ItemListPublic:
    return ItemListPublic(itens=item_service.list_public(session))


@router.get("/itens/{item_id}", response_model=ItemPublic)
def get_item(item_id: int, session: Session = Depends(get_session)) -> ItemPublic:
    return item_service.get_public(session, item_id)
