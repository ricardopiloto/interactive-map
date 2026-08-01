from fastapi import APIRouter, Depends
from sqlmodel import Session

from app.database import get_session
from app.models.grupo import GrupoPosicao
from app.schemas.grupo import GrupoPosicaoRead

router = APIRouter()


def _get_or_create(session: Session) -> GrupoPosicao:
    grupo = session.get(GrupoPosicao, 1)
    if grupo is None:
        grupo = GrupoPosicao(id=1, x=0.5, y=0.5, formato="bandeira")
        session.add(grupo)
        session.commit()
        session.refresh(grupo)
    elif not getattr(grupo, "formato", None):
        grupo.formato = "bandeira"
        session.add(grupo)
        session.commit()
        session.refresh(grupo)
    return grupo


@router.get("/grupo", response_model=GrupoPosicaoRead)
def get_grupo(session: Session = Depends(get_session)) -> GrupoPosicao:
    return _get_or_create(session)
