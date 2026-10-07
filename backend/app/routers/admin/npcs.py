from fastapi import APIRouter, Depends, Path, Request, status
from sqlmodel import Session, select

from app.campaign_db import lookup_campanha
from app.database import get_session
from app.errors import raise_api_error
from app.models.npc import NPC
from app.routers.admin.personagens import _delete_vinculos_for
from app.routers.public.npcs import _to_admin
from app.schemas.npc import NPCAdmin, NPCCreate, NPCUpdate, StatBlockFieldRead, StatBlockSchemaRead
from app.services.rate_limit import limiter
from app.services.stat_blocks.registry import fields_for, validar_stat_block

router = APIRouter()


def _aplicar_stat_block(npc: NPC, slug: str, payload: dict | None) -> None:
    npc.stat_block = validar_stat_block(lookup_campanha(slug).sistema, payload)


@router.get("/npcs/stat-block-schema", response_model=StatBlockSchemaRead)
def stat_block_schema(slug: str = Path(...)) -> StatBlockSchemaRead:
    sistema = lookup_campanha(slug).sistema
    return StatBlockSchemaRead(
        sistema=sistema,
        fields=[StatBlockFieldRead(nome=f.nome, rotulo=f.rotulo, tipo=f.tipo) for f in fields_for(sistema)],
    )


@router.get("/npcs", response_model=list[NPCAdmin])
def list_npcs_admin(session: Session = Depends(get_session)) -> list[NPCAdmin]:
    npcs = list(session.exec(select(NPC).order_by(NPC.nome)).all())
    return [_to_admin(n) for n in npcs]


@router.post("/npcs", response_model=NPCAdmin, status_code=status.HTTP_201_CREATED)
@limiter.limit("30/minute")
def create_npc(
    request: Request,
    payload: NPCCreate,
    slug: str = Path(...),
    session: Session = Depends(get_session),
) -> NPCAdmin:
    data = payload.model_dump(exclude={"stat_block"})
    npc = NPC.model_validate(data)
    if payload.stat_block is not None:
        _aplicar_stat_block(npc, slug, payload.stat_block)
    session.add(npc)
    session.commit()
    session.refresh(npc)
    return _to_admin(npc)


@router.put("/npcs/{npc_id}", response_model=NPCAdmin)
@limiter.limit("30/minute")
def update_npc(
    request: Request,
    npc_id: int,
    payload: NPCUpdate,
    slug: str = Path(...),
    session: Session = Depends(get_session),
) -> NPCAdmin:
    npc = session.get(NPC, npc_id)
    if not npc:
        raise_api_error("NPC_NAO_ENCONTRADO", status_code=status.HTTP_404_NOT_FOUND)

    data = payload.model_dump(exclude_unset=True)
    stat_block = data.pop("stat_block", None)
    stat_provided = "stat_block" in payload.model_fields_set
    for key, value in data.items():
        setattr(npc, key, value)
    if stat_provided:
        _aplicar_stat_block(npc, slug, stat_block)

    session.add(npc)
    session.commit()
    session.refresh(npc)
    return _to_admin(npc)


@router.delete("/npcs/{npc_id}", status_code=status.HTTP_204_NO_CONTENT)
@limiter.limit("30/minute")
def delete_npc(
    request: Request,
    npc_id: int,
    session: Session = Depends(get_session),
) -> None:
    npc = session.get(NPC, npc_id)
    if not npc:
        raise_api_error("NPC_NAO_ENCONTRADO", status_code=status.HTTP_404_NOT_FOUND)
    _delete_vinculos_for(session, npc_id)
    session.delete(npc)
    session.commit()
