from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlmodel import Session

from app.database import get_session
from app.models.npc import NPC
from app.routers.public.npcs import _to_read
from app.schemas.npc import NPCCreate, NPCRead, NPCUpdate
from app.services.rate_limit import limiter

router = APIRouter()


@router.post("/npcs", response_model=NPCRead, status_code=status.HTTP_201_CREATED)
@limiter.limit("30/minute")
def create_npc(
    request: Request,
    payload: NPCCreate,
    session: Session = Depends(get_session),
) -> NPCRead:
    npc = NPC.model_validate(payload)
    session.add(npc)
    session.commit()
    session.refresh(npc)
    return _to_read(npc)


@router.put("/npcs/{npc_id}", response_model=NPCRead)
@limiter.limit("30/minute")
def update_npc(
    request: Request,
    npc_id: int,
    payload: NPCUpdate,
    session: Session = Depends(get_session),
) -> NPCRead:
    npc = session.get(NPC, npc_id)
    if not npc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="NPC não encontrado")

    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(npc, key, value)

    session.add(npc)
    session.commit()
    session.refresh(npc)
    return _to_read(npc)


@router.delete("/npcs/{npc_id}", status_code=status.HTTP_204_NO_CONTENT)
@limiter.limit("30/minute")
def delete_npc(
    request: Request,
    npc_id: int,
    session: Session = Depends(get_session),
) -> None:
    npc = session.get(NPC, npc_id)
    if not npc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="NPC não encontrado")
    session.delete(npc)
    session.commit()
