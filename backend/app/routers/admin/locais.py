from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlmodel import Session, select

from app.database import get_session
from app.models.links import LocalConexaoLink
from app.models.local import Local
from app.models.npc import NPC
from app.routers.public.locais import _to_read
from app.schemas.local import LocalCreate, LocalRead, LocalUpdate
from app.services.rate_limit import limiter
from app.services.waypoint_local_link import set_local_waypoint_id

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


def _sync_saidas(session: Session, local: Local, saida_ids: list[int]) -> None:
    if local.id is None:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Local sem id para sincronizar saídas",
        )
    origem_id = int(local.id)
    unique: list[int] = []
    seen: set[int] = set()
    for destino_id in saida_ids:
        if destino_id == origem_id:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Local não pode ter saída para si mesmo",
            )
        if destino_id in seen:
            continue
        seen.add(destino_id)
        unique.append(destino_id)

    missing: list[int] = []
    for destino_id in unique:
        if session.get(Local, destino_id) is None:
            missing.append(destino_id)
    if missing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Locais destino não encontrados: {sorted(missing)}",
        )

    existing = list(
        session.exec(select(LocalConexaoLink).where(LocalConexaoLink.origem_id == origem_id)).all()
    )
    for link in existing:
        session.delete(link)
    session.flush()
    for destino_id in unique:
        session.add(LocalConexaoLink(origem_id=origem_id, destino_id=destino_id))


def _clear_conexoes_for_local(session: Session, local_id: int) -> None:
    links = list(
        session.exec(
            select(LocalConexaoLink).where(
                (LocalConexaoLink.origem_id == local_id) | (LocalConexaoLink.destino_id == local_id)
            )
        ).all()
    )
    for link in links:
        session.delete(link)
    session.flush()


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
        cor_pin=payload.cor_pin,
    )
    session.add(local)
    session.flush()
    if payload.npc_ids:
        _sync_npcs(session, local, payload.npc_ids)
    if payload.saida_ids:
        _sync_saidas(session, local, payload.saida_ids)
    if payload.waypoint_id is not None:
        set_local_waypoint_id(session, local, payload.waypoint_id)
    session.commit()
    session.refresh(local)
    return _to_read(session, local)


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
    saida_ids = data.pop("saida_ids", None)
    waypoint_id_provided = "waypoint_id" in data
    waypoint_id_val = data.pop("waypoint_id", None) if waypoint_id_provided else None
    for key, value in data.items():
        setattr(local, key, value)
    if npc_ids is not None:
        _sync_npcs(session, local, npc_ids)
    if saida_ids is not None:
        _sync_saidas(session, local, saida_ids)
    if waypoint_id_provided:
        set_local_waypoint_id(session, local, waypoint_id_val)

    session.add(local)
    session.commit()
    session.refresh(local)
    return _to_read(session, local)


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
    _clear_conexoes_for_local(session, local_id)
    from app.models.waypoint import Waypoint

    wp = session.exec(select(Waypoint).where(Waypoint.local_id == local_id)).first()
    if wp:
        wp.local_id = None
        session.add(wp)
    session.delete(local)
    session.commit()
