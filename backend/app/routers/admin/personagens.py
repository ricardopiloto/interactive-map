from fastapi import APIRouter, Depends, Path, Request, status
from sqlmodel import Session, select

from app.campaign_db import lookup_campanha
from app.database import get_session
from app.errors import raise_api_error
from app.models.npc import NPC
from app.models.vinculo import Vinculo
from app.routers.public.personagens import personagem_to_admin
from app.schemas.personagem import PersonagemAdmin, PersonagemCreate, PersonagemUpdate
from app.services.mecanica import sanitize_extensoes
from app.services.rate_limit import limiter
from app.services.stat_blocks.registry import validar_stat_block

router = APIRouter()


@router.get("/personagens", response_model=list[PersonagemAdmin])
def list_personagens_admin(session: Session = Depends(get_session)) -> list[PersonagemAdmin]:
    rows = list(session.exec(select(NPC).order_by(NPC.nome)).all())
    return [personagem_to_admin(n) for n in rows]


def _apply_personagem_payload(
    row: NPC,
    payload: PersonagemCreate | PersonagemUpdate,
    *,
    is_create: bool,
    slug: str,
) -> None:
    data = payload.model_dump(exclude_unset=not is_create)
    extensoes = data.pop("extensoes_mecanica", None)
    stat_block = data.pop("stat_block", None)
    stat_provided = "stat_block" in payload.model_fields_set
    for key, value in data.items():
        setattr(row, key, value)
    if extensoes is not None or is_create:
        merged = dict(row.extensoes_mecanica if isinstance(row.extensoes_mecanica, dict) else {})
        if extensoes is not None:
            merged.update(extensoes)
        row.extensoes_mecanica = sanitize_extensoes(merged)
    if stat_provided:
        row.stat_block = validar_stat_block(lookup_campanha(slug).sistema, stat_block)


def _delete_vinculos_for(session: Session, personagem_id: int) -> None:
    rows = session.exec(
        select(Vinculo).where(
            (Vinculo.personagem_a_id == personagem_id) | (Vinculo.personagem_b_id == personagem_id)
        )
    ).all()
    for v in rows:
        session.delete(v)


@router.post("/personagens", response_model=PersonagemAdmin, status_code=status.HTTP_201_CREATED)
@limiter.limit("30/minute")
def create_personagem(
    request: Request,
    payload: PersonagemCreate,
    slug: str = Path(...),
    session: Session = Depends(get_session),
) -> PersonagemAdmin:
    row = NPC.model_validate(payload.model_dump(exclude={"extensoes_mecanica", "stat_block"}))
    _apply_personagem_payload(row, payload, is_create=True, slug=slug)
    session.add(row)
    session.commit()
    session.refresh(row)
    return personagem_to_admin(row)


@router.put("/personagens/{personagem_id}", response_model=PersonagemAdmin)
@limiter.limit("30/minute")
def update_personagem(
    request: Request,
    personagem_id: int,
    payload: PersonagemUpdate,
    slug: str = Path(...),
    session: Session = Depends(get_session),
) -> PersonagemAdmin:
    row = session.get(NPC, personagem_id)
    if not row:
        raise_api_error("PERSONAGEM_NAO_ENCONTRADO", status_code=status.HTTP_404_NOT_FOUND)

    _apply_personagem_payload(row, payload, is_create=False, slug=slug)

    session.add(row)
    session.commit()
    session.refresh(row)
    return personagem_to_admin(row)


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
