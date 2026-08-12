from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlmodel import Session, select

from app.database import get_session
from app.models.npc import NPC
from app.models.vinculo import Vinculo
from app.routers.public.personagens import personagem_to_read
from app.schemas.personagem import PersonagemCreate, PersonagemRead, PersonagemUpdate
from app.services.rate_limit import limiter

router = APIRouter()


def _delete_vinculos_for(session: Session, personagem_id: int) -> None:
    rows = session.exec(
        select(Vinculo).where(
            (Vinculo.personagem_a_id == personagem_id) | (Vinculo.personagem_b_id == personagem_id)
        )
    ).all()
    for v in rows:
        session.delete(v)


@router.post("/personagens", response_model=PersonagemRead, status_code=status.HTTP_201_CREATED)
@limiter.limit("30/minute")
def create_personagem(
    request: Request,
    payload: PersonagemCreate,
    session: Session = Depends(get_session),
) -> PersonagemRead:
    row = NPC.model_validate(payload)
    session.add(row)
    session.commit()
    session.refresh(row)
    return personagem_to_read(row)


@router.put("/personagens/{personagem_id}", response_model=PersonagemRead)
@limiter.limit("30/minute")
def update_personagem(
    request: Request,
    personagem_id: int,
    payload: PersonagemUpdate,
    session: Session = Depends(get_session),
) -> PersonagemRead:
    row = session.get(NPC, personagem_id)
    if not row:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Personagem não encontrado")

    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(row, key, value)

    session.add(row)
    session.commit()
    session.refresh(row)
    return personagem_to_read(row)


@router.delete("/personagens/{personagem_id}", status_code=status.HTTP_204_NO_CONTENT)
@limiter.limit("30/minute")
def delete_personagem(
    request: Request,
    personagem_id: int,
    session: Session = Depends(get_session),
) -> None:
    row = session.get(NPC, personagem_id)
    if not row:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Personagem não encontrado")
    _delete_vinculos_for(session, personagem_id)
    session.delete(row)
    session.commit()
