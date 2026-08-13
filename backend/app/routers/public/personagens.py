from fastapi import APIRouter, Depends, Query, status
from sqlmodel import Session, select

from app.database import get_session
from app.errors import raise_api_error
from app.models.npc import NPC, PersonagemTipo
from app.schemas.personagem import PersonagemRead
from app.services.mecanica import filter_extensoes
from app.services.personagem_visibility import is_visivel_para_jogador

router = APIRouter()


def personagem_to_read(npc: NPC) -> PersonagemRead:
    tipo = npc.tipo if npc.tipo is not None else PersonagemTipo.npc
    raw_ext = npc.extensoes_mecanica if isinstance(npc.extensoes_mecanica, dict) else {}
    return PersonagemRead(
        id=npc.id,  # type: ignore[arg-type]
        nome=npc.nome,
        tipo=tipo,
        papel=npc.papel,
        descricao=npc.descricao,
        faccao=npc.faccao,
        status=npc.status,
        retrato_url=npc.retrato_url,
        visivel_para_todos=bool(getattr(npc, "visivel_para_todos", True)),
        extensoes_mecanica=filter_extensoes(raw_ext),
        local_ids=[loc.id for loc in npc.locais if loc.id is not None],
    )


@router.get("/personagens", response_model=list[PersonagemRead])
def list_personagens(
    q: str | None = Query(default=None, description="Filtro por nome"),
    session: Session = Depends(get_session),
) -> list[PersonagemRead]:
    rows = list(session.exec(select(NPC).order_by(NPC.nome)).all())
    rows = [n for n in rows if is_visivel_para_jogador(n)]
    if q:
        needle = q.casefold()
        rows = [n for n in rows if needle in n.nome.casefold()]
    return [personagem_to_read(n) for n in rows]


@router.get("/personagens/{personagem_id}", response_model=PersonagemRead)
def get_personagem(personagem_id: int, session: Session = Depends(get_session)) -> PersonagemRead:
    row = session.get(NPC, personagem_id)
    if not row or not is_visivel_para_jogador(row):
        raise_api_error("PERSONAGEM_NAO_ENCONTRADO", status_code=status.HTTP_404_NOT_FOUND)
    return personagem_to_read(row)
