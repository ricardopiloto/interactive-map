from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlmodel import Session, select

from app.database import get_session
from app.models.npc import NPC
from app.models.vinculo import Vinculo
from app.routers.public.vinculos import vinculo_to_read
from app.schemas.vinculo import VinculoCreate, VinculoRead, VinculoUpdate
from app.services.rate_limit import limiter

router = APIRouter()


def _canonical_pair(a: int, b: int) -> tuple[int, int]:
    return (a, b) if a < b else (b, a)


def _ensure_pair_exists(session: Session, a: int, b: int) -> None:
    if not session.get(NPC, a) or not session.get(NPC, b):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Personagem inválido")


@router.get("/vinculos", response_model=list[VinculoRead])
def list_vinculos(session: Session = Depends(get_session)) -> list[VinculoRead]:
    rows = session.exec(select(Vinculo).order_by(Vinculo.id)).all()
    return [vinculo_to_read(v) for v in rows]


@router.post("/vinculos", response_model=VinculoRead, status_code=status.HTTP_201_CREATED)
@limiter.limit("30/minute")
def create_vinculo(
    request: Request,
    payload: VinculoCreate,
    session: Session = Depends(get_session),
) -> VinculoRead:
    a, b = _canonical_pair(payload.personagem_a_id, payload.personagem_b_id)
    _ensure_pair_exists(session, a, b)
    existing = session.exec(
        select(Vinculo).where(Vinculo.personagem_a_id == a, Vinculo.personagem_b_id == b)
    ).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Vínculo já existe")

    row = Vinculo(
        personagem_a_id=a,
        personagem_b_id=b,
        tipo=payload.tipo,
        nota=payload.nota,
        publico=payload.publico,
    )
    session.add(row)
    session.commit()
    session.refresh(row)
    return vinculo_to_read(row)


@router.put("/vinculos/{vinculo_id}", response_model=VinculoRead)
@limiter.limit("30/minute")
def update_vinculo(
    request: Request,
    vinculo_id: int,
    payload: VinculoUpdate,
    session: Session = Depends(get_session),
) -> VinculoRead:
    row = session.get(Vinculo, vinculo_id)
    if not row:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vínculo não encontrado")

    data = payload.model_dump(exclude_unset=True)
    a = data.pop("personagem_a_id", row.personagem_a_id)
    b = data.pop("personagem_b_id", row.personagem_b_id)
    if a == b:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Vínculo não pode ligar um personagem a si mesmo",
        )
    a, b = _canonical_pair(a, b)
    _ensure_pair_exists(session, a, b)

    clash = session.exec(
        select(Vinculo).where(
            Vinculo.personagem_a_id == a,
            Vinculo.personagem_b_id == b,
            Vinculo.id != vinculo_id,
        )
    ).first()
    if clash:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Vínculo já existe")

    row.personagem_a_id = a
    row.personagem_b_id = b
    for key, value in data.items():
        setattr(row, key, value)

    session.add(row)
    session.commit()
    session.refresh(row)
    return vinculo_to_read(row)


@router.delete("/vinculos/{vinculo_id}", status_code=status.HTTP_204_NO_CONTENT)
@limiter.limit("30/minute")
def delete_vinculo(
    request: Request,
    vinculo_id: int,
    session: Session = Depends(get_session),
) -> None:
    row = session.get(Vinculo, vinculo_id)
    if not row:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vínculo não encontrado")
    session.delete(row)
    session.commit()
