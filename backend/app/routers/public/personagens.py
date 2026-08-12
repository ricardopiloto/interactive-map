from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlmodel import Session, select

from app.database import get_session
from app.models.npc import NPC, PersonagemTipo
from app.schemas.personagem import PersonagemRead

router = APIRouter()


def personagem_to_read(npc: NPC) -> PersonagemRead:
    tipo = npc.tipo if npc.tipo is not None else PersonagemTipo.npc
    return PersonagemRead(
        id=npc.id,  # type: ignore[arg-type]
        nome=npc.nome,
        tipo=tipo,
        papel=npc.papel,
        descricao=npc.descricao,
        faccao=npc.faccao,
        status=npc.status,
        retrato_url=npc.retrato_url,
        local_ids=[loc.id for loc in npc.locais if loc.id is not None],
    )


@router.get("/personagens", response_model=list[PersonagemRead])
def list_personagens(
    q: str | None = Query(default=None, description="Filtro por nome"),
    session: Session = Depends(get_session),
) -> list[PersonagemRead]:
    rows = list(session.exec(select(NPC).order_by(NPC.nome)).all())
    if q:
        needle = q.casefold()
        rows = [n for n in rows if needle in n.nome.casefold()]
    return [personagem_to_read(n) for n in rows]


@router.get("/personagens/{personagem_id}", response_model=PersonagemRead)
def get_personagem(personagem_id: int, session: Session = Depends(get_session)) -> PersonagemRead:
    row = session.get(NPC, personagem_id)
    if not row:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Personagem não encontrado")
    return personagem_to_read(row)
