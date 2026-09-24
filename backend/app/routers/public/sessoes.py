from fastapi import APIRouter, Depends
from sqlmodel import Session

from app.database import get_session
from app.schemas.sessao import SessaoListPublic, SessaoPublic
from app.services import sessao_service

router = APIRouter()


@router.get("/sessoes", response_model=SessaoListPublic)
def list_sessoes(session: Session = Depends(get_session)) -> SessaoListPublic:
    return SessaoListPublic(sessoes=sessao_service.list_public(session))


@router.get("/sessoes/{sessao_id}", response_model=SessaoPublic)
def get_sessao(sessao_id: int, session: Session = Depends(get_session)) -> SessaoPublic:
    return sessao_service.get_public(session, sessao_id)
