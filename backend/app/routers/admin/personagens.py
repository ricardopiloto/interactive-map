from fastapi import APIRouter, Depends, Request, status
from sqlmodel import Session, select

from app.database import get_session
from app.errors import raise_api_error
from app.models.npc import NPC
from app.models.vinculo import Vinculo
from app.routers.public.personagens import personagem_to_read
from app.schemas.personagem import PersonagemCreate, PersonagemRead, PersonagemUpdate
from app.services.mecanica import sanitize_extensoes
from app.services.rate_limit import limiter

router = APIRouter()


@router.get("/personagens", response_model=list[PersonagemRead])
def list_personagens_admin(session: Session = Depends(get_session)) -> list[PersonagemRead]:
    rows = list(session.exec(select(NPC).order_by(NPC.nome)).all())
    return [personagem_to_read(n) for n in rows]


def _apply_personagem_payload(row: NPC, payload: PersonagemCreate | PersonagemUpdate, *, is_create: bool) -> None:
    data = payload.model_dump(exclude_unset=not is_create)
    extensoes = data.pop("extensoes_mecanica", None)
    for key, value in data.items():
        setattr(row, key, value)
    if extensoes is not None or is_create:
        merged = dict(row.extensoes_mecanica if isinstance(row.extensoes_mecanica, dict) else {})
        if extensoes is not None:
            merged.update(extensoes)
        row.extensoes_mecanica = sanitize_extensoes(merged)


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
    row = NPC.model_validate(payload.model_dump(exclude={"extensoes_mecanica"}))
    _apply_personagem_payload(row, payload, is_create=True)
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
        raise_api_error("PERSONAGEM_NAO_ENCONTRADO", status_code=status.HTTP_404_NOT_FOUND)

    _apply_personagem_payload(row, payload, is_create=False)

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
        raise_api_error("PERSONAGEM_NAO_ENCONTRADO", status_code=status.HTTP_404_NOT_FOUND)
    _delete_vinculos_for(session, personagem_id)
    session.delete(row)
    session.commit()
