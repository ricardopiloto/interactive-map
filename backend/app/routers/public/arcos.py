from fastapi import APIRouter, Depends, status
from sqlmodel import Session, select

from app.database import get_session
from app.errors import raise_api_error
from app.models.arco import Arco
from app.schemas.arco import ArcoRead
from app.services.arco_service import to_arco_read
from app.services.visibility import is_visivel_para_jogador

router = APIRouter()


@router.get("/arcos", response_model=list[ArcoRead])
def list_arcos(session: Session = Depends(get_session)) -> list[ArcoRead]:
    statement = select(Arco).order_by(Arco.ordem, Arco.id)
    rows = list(session.exec(statement).all())
    return [
        to_arco_read(session, a, apenas_visiveis=True) for a in rows if is_visivel_para_jogador(a)
    ]


@router.get("/arcos/{arco_id}", response_model=ArcoRead)
def get_arco(arco_id: int, session: Session = Depends(get_session)) -> ArcoRead:
    arco = session.get(Arco, arco_id)
    if not arco or not is_visivel_para_jogador(arco):
        raise_api_error("ARCO_NAO_ENCONTRADO", status_code=status.HTTP_404_NOT_FOUND)
    return to_arco_read(session, arco, apenas_visiveis=True)
