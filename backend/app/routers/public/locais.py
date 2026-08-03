from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlmodel import Session, select

from app.database import get_session
from app.models.links import LocalConexaoLink
from app.models.local import Local
from app.schemas.local import LocalRead

router = APIRouter()


def _saida_ids_for(session: Session, local_id: int) -> list[int]:
    rows = session.exec(
        select(LocalConexaoLink.destino_id).where(LocalConexaoLink.origem_id == local_id)
    ).all()
    return sorted({int(d) for d in rows if d is not None})


def _to_read(session: Session, local: Local) -> LocalRead:
    return LocalRead(
        id=local.id,  # type: ignore[arg-type]
        nome=local.nome,
        descricao=local.descricao,
        x=local.x,
        y=local.y,
        imagem_url=local.imagem_url,
        data_sessao=local.data_sessao,
        arco_id=local.arco_id,
        npc_ids=[n.id for n in local.npcs if n.id is not None],
        saida_ids=_saida_ids_for(session, int(local.id)) if local.id is not None else [],
        cor_pin=getattr(local, "cor_pin", None) or "#c4b5fd",
    )


@router.get("/locais", response_model=list[LocalRead])
def list_locais(
    q: str | None = Query(default=None, description="Filtro por nome"),
    session: Session = Depends(get_session),
) -> list[LocalRead]:
    statement = select(Local).order_by(Local.nome)
    locais = list(session.exec(statement).all())
    if q:
        needle = q.casefold()
        locais = [loc for loc in locais if needle in loc.nome.casefold()]
    return [_to_read(session, loc) for loc in locais]


@router.get("/locais/{local_id}", response_model=LocalRead)
def get_local(local_id: int, session: Session = Depends(get_session)) -> LocalRead:
    local = session.get(Local, local_id)
    if not local:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Local não encontrado")
    return _to_read(session, local)
