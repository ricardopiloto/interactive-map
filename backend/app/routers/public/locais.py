from fastapi import APIRouter, Depends, Query, status
from sqlmodel import Session, select

from app.database import get_session
from app.errors import raise_api_error
from app.models.arco import Arco
from app.models.links import LocalConexaoLink
from app.models.local import Local
from app.schemas.local import LocalRead
from app.services.url_rewrite import rewrite_media_url
from app.services.visibility import is_visivel_para_jogador
from app.services.waypoint_local_link import waypoint_id_for_local

router = APIRouter()


def _saida_ids_for(session: Session, local_id: int, *, for_player: bool) -> list[int]:
    rows = session.exec(
        select(LocalConexaoLink.destino_id).where(LocalConexaoLink.origem_id == local_id)
    ).all()
    dest_ids = sorted({int(d) for d in rows if d is not None})
    if not for_player:
        return dest_ids
    visible: list[int] = []
    for dest_id in dest_ids:
        dest = session.get(Local, dest_id)
        if is_visivel_para_jogador(dest):
            visible.append(dest_id)
    return visible


def _public_arco_id(session: Session, local: Local, *, for_player: bool) -> int | None:
    if local.arco_id is None:
        return None
    if not for_player:
        return local.arco_id
    arco = session.get(Arco, local.arco_id)
    if not is_visivel_para_jogador(arco):
        return None
    return local.arco_id


def _to_read(session: Session, local: Local, *, for_player: bool = True) -> LocalRead:
    lid = int(local.id) if local.id is not None else None
    if for_player:
        npc_ids = [
            n.id
            for n in local.npcs
            if n.id is not None and is_visivel_para_jogador(n)
        ]
    else:
        npc_ids = [n.id for n in local.npcs if n.id is not None]
    return LocalRead(
        id=local.id,  # type: ignore[arg-type]
        nome=local.nome,
        descricao=local.descricao,
        x=local.x,
        y=local.y,
        imagem_url=rewrite_media_url(local.imagem_url),
        data_sessao=local.data_sessao,
        estado_exploracao=getattr(local, "estado_exploracao", "conhecido"),
        arco_id=_public_arco_id(session, local, for_player=for_player),
        npc_ids=npc_ids,
        saida_ids=_saida_ids_for(session, lid, for_player=for_player) if lid is not None else [],
        cor_pin=getattr(local, "cor_pin", None) or "#c4b5fd",
        waypoint_id=waypoint_id_for_local(session, lid) if lid is not None else None,
        visivel_para_todos=bool(getattr(local, "visivel_para_todos", True)),
    )


@router.get("/locais", response_model=list[LocalRead])
def list_locais(
    q: str | None = Query(default=None, description="Filtro por nome"),
    session: Session = Depends(get_session),
) -> list[LocalRead]:
    statement = select(Local).order_by(Local.nome)
    locais = list(session.exec(statement).all())
    locais = [loc for loc in locais if is_visivel_para_jogador(loc)]
    if q:
        needle = q.casefold()
        locais = [loc for loc in locais if needle in loc.nome.casefold()]
    return [_to_read(session, loc, for_player=True) for loc in locais]


@router.get("/locais/{local_id}", response_model=LocalRead)
def get_local(local_id: int, session: Session = Depends(get_session)) -> LocalRead:
    local = session.get(Local, local_id)
    if not local or not is_visivel_para_jogador(local):
        raise_api_error("LOCAL_NAO_ENCONTRADO", status_code=status.HTTP_404_NOT_FOUND)
    return _to_read(session, local, for_player=True)
