from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select

from app.database import get_session
from app.models.arco import Arco
from app.schemas.arco import ArcoRead

router = APIRouter()


@router.get("/arcos", response_model=list[ArcoRead])
def list_arcos(session: Session = Depends(get_session)) -> list[Arco]:
    statement = select(Arco).order_by(Arco.ordem, Arco.id)
    return list(session.exec(statement).all())


@router.get("/arcos/{arco_id}", response_model=ArcoRead)
def get_arco(arco_id: int, session: Session = Depends(get_session)) -> Arco:
    arco = session.get(Arco, arco_id)
    if not arco:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Arco não encontrado")
    return arco
