from fastapi import APIRouter, Depends
from sqlmodel import Session

from app.database import get_session
from app.deps.auth import MembroContext, require_dono
from app.schemas.descoberta import DescobertaAdmin
from app.services import descoberta_service

router = APIRouter()


@router.get("/descoberta", response_model=DescobertaAdmin)
def list_descoberta_admin(
    _dono: MembroContext = Depends(require_dono),
    session: Session = Depends(get_session),
) -> DescobertaAdmin:
    return descoberta_service.list_admin(session)
