from fastapi import APIRouter, Depends
from sqlmodel import Session

from app.database import get_session
from app.schemas.descoberta import DescobertaPublic
from app.services import descoberta_service

router = APIRouter()


@router.get("/descoberta", response_model=DescobertaPublic)
def list_descoberta(session: Session = Depends(get_session)) -> DescobertaPublic:
    return descoberta_service.list_public(session)
