from fastapi import APIRouter, Depends
from sqlmodel import Session, select

from app.database import get_session
from app.models.vinculo import Vinculo
from app.schemas.vinculo import VinculoRead

router = APIRouter()


def vinculo_to_read(v: Vinculo) -> VinculoRead:
    return VinculoRead(
        id=v.id,  # type: ignore[arg-type]
        personagem_a_id=v.personagem_a_id,
        personagem_b_id=v.personagem_b_id,
        tipo=v.tipo,
        nota=v.nota,
        publico=v.publico,
    )


@router.get("/vinculos", response_model=list[VinculoRead])
def list_vinculos_publicos(session: Session = Depends(get_session)) -> list[VinculoRead]:
    rows = session.exec(select(Vinculo).where(Vinculo.publico == True).order_by(Vinculo.id)).all()  # noqa: E712
    return [vinculo_to_read(v) for v in rows]
