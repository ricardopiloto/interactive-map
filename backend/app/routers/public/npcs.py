from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlmodel import Session, select

from app.database import get_session
from app.models.npc import NPC
from app.schemas.npc import NPCRead

router = APIRouter()


def _to_read(npc: NPC) -> NPCRead:
    return NPCRead(
        id=npc.id,  # type: ignore[arg-type]
        nome=npc.nome,
        descricao=npc.descricao,
        faccao=npc.faccao,
        status=npc.status,
        retrato_url=npc.retrato_url,
        local_ids=[loc.id for loc in npc.locais if loc.id is not None],
    )


@router.get("/npcs", response_model=list[NPCRead])
def list_npcs(
    q: str | None = Query(default=None, description="Filtro por nome"),
    session: Session = Depends(get_session),
) -> list[NPCRead]:
    statement = select(NPC).order_by(NPC.nome)
    npcs = list(session.exec(statement).all())
    if q:
        needle = q.casefold()
        npcs = [n for n in npcs if needle in n.nome.casefold()]
    return [_to_read(n) for n in npcs]


@router.get("/npcs/{npc_id}", response_model=NPCRead)
def get_npc(npc_id: int, session: Session = Depends(get_session)) -> NPCRead:
    npc = session.get(NPC, npc_id)
    if not npc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="NPC não encontrado")
    return _to_read(npc)
