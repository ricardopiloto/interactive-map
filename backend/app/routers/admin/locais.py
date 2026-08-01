from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlmodel import Session

from app.database import get_session
from app.models.local import Local
from app.models.npc import NPC
from app.routers.public.locais import _to_read
from app.schemas.local import LocalCreate, LocalRead, LocalUpdate
from app.services.rate_limit import limiter

router = APIRouter()


def _sync_npcs(session: Session, local: Local, npc_ids: list[int]) -> None:
    npcs: list[NPC] = []
    missing: list[int] = []
    for npc_id in npc_ids:
        npc = session.get(NPC, npc_id)
        if npc is None:
            missing.append(npc_id)
        else:
            npcs.append(npc)
    if missing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"NPCs não encontrados: {sorted(missing)}",
        )
    local.npcs = npcs


@router.post("/locais", response_model=LocalRead, status_code=status.HTTP_201_CREATED)
@limiter.limit("30/minute")
def create_local(
    request: Request,
    payload: LocalCreate,
    session: Session = Depends(get_session),
) -> LocalRead:
    local = Local(
        nome=payload.nome,
        descricao=payload.descricao,
        x=payload.x,
        y=payload.y,
        imagem_url=payload.imagem_url,
        data_sessao=payload.data_sessao,
        arco_id=payload.arco_id,
    )
    session.add(local)
    session.flush()
    if payload.npc_ids:
        _sync_npcs(session, local, payload.npc_ids)
    session.commit()
    session.refresh(local)
    return _to_read(local)


@router.put("/locais/{local_id}", response_model=LocalRead)
@limiter.limit("30/minute")
def update_local(
    request: Request,
    local_id: int,
    payload: LocalUpdate,
    session: Session = Depends(get_session),
) -> LocalRead:
    local = session.get(Local, local_id)
    if not local:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Local não encontrado")

    data = payload.model_dump(exclude_unset=True)
    npc_ids = data.pop("npc_ids", None)
    for key, value in data.items():
        setattr(local, key, value)
    if npc_ids is not None:
        _sync_npcs(session, local, npc_ids)

    session.add(local)
    session.commit()
    session.refresh(local)
    return _to_read(local)


@router.delete("/locais/{local_id}", status_code=status.HTTP_204_NO_CONTENT)
@limiter.limit("30/minute")
def delete_local(
    request: Request,
    local_id: int,
    session: Session = Depends(get_session),
) -> None:
    local = session.get(Local, local_id)
    if not local:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Local não encontrado")
    session.delete(local)
    session.commit()
