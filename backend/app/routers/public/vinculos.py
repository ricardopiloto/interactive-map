from fastapi import APIRouter, Depends
from sqlmodel import Session, select

from app.database import get_session
from app.models.npc import NPC
from app.models.vinculo import Vinculo
from app.schemas.vinculo import VinculoRead, is_duas_vias
from app.services.personagem_visibility import is_visivel_para_jogador

router = APIRouter()


def vinculo_to_admin_read(v: Vinculo) -> VinculoRead:
    return VinculoRead(
        id=v.id,  # type: ignore[arg-type]
        personagem_a_id=v.personagem_a_id,
        personagem_b_id=v.personagem_b_id,
        tipo_ab=v.tipo_ab,
        tipo_ba=v.tipo_ba,
        nota_ab=v.nota_ab,
        nota_ba=v.nota_ba,
        publico=v.publico,
        conhecido_ab=v.conhecido_ab,
        conhecido_ba=v.conhecido_ba,
        qualificador_ab=v.qualificador_ab or "",
        qualificador_ba=v.qualificador_ba or "",
        direcao=v.direcao,
    )


def player_visible(v: Vinculo) -> bool:
    if not v.publico:
        return False
    if not is_duas_vias(v.tipo_ab, v.tipo_ba):
        return True
    return bool(v.conhecido_ab or v.conhecido_ba)


def player_visible_with_personagens(v: Vinculo, by_id: dict[int, NPC]) -> bool:
    if not player_visible(v):
        return False
    a = by_id.get(v.personagem_a_id)
    b = by_id.get(v.personagem_b_id)
    return is_visivel_para_jogador(a) and is_visivel_para_jogador(b)


def vinculo_to_public_read(v: Vinculo) -> VinculoRead:
    """Redact unknown tips so secret tipos never reach players."""
    qual_ab = v.qualificador_ab or ""
    qual_ba = v.qualificador_ba or ""
    direcao = v.direcao
    if not is_duas_vias(v.tipo_ab, v.tipo_ba):
        return VinculoRead(
            id=v.id,  # type: ignore[arg-type]
            personagem_a_id=v.personagem_a_id,
            personagem_b_id=v.personagem_b_id,
            tipo_ab=v.tipo_ab,
            tipo_ba=None,
            nota_ab=v.nota_ab,
            nota_ba="",
            publico=v.publico,
            qualificador_ab=qual_ab,
            qualificador_ba="",
            direcao=direcao,
        )

    tipo_ab = v.tipo_ab if v.conhecido_ab else None
    tipo_ba = v.tipo_ba if v.conhecido_ba else None
    nota_ab = v.nota_ab if v.conhecido_ab else ""
    nota_ba = v.nota_ba if v.conhecido_ba else ""
    redact_ab = qual_ab if v.conhecido_ab else ""
    redact_ba = qual_ba if v.conhecido_ba else ""
    if tipo_ab is not None and tipo_ba is None:
        return VinculoRead(
            id=v.id,  # type: ignore[arg-type]
            personagem_a_id=v.personagem_a_id,
            personagem_b_id=v.personagem_b_id,
            tipo_ab=tipo_ab,
            tipo_ba=None,
            nota_ab=nota_ab,
            nota_ba="",
            publico=v.publico,
            qualificador_ab=redact_ab,
            qualificador_ba="",
            direcao=direcao,
        )
    return VinculoRead(
        id=v.id,  # type: ignore[arg-type]
        personagem_a_id=v.personagem_a_id,
        personagem_b_id=v.personagem_b_id,
        tipo_ab=tipo_ab,
        tipo_ba=tipo_ba,
        nota_ab=nota_ab,
        nota_ba=nota_ba,
        publico=v.publico,
        qualificador_ab=redact_ab,
        qualificador_ba=redact_ba,
        direcao=direcao,
    )


# Back-compat alias used by admin until updated
def vinculo_to_read(v: Vinculo) -> VinculoRead:
    return vinculo_to_admin_read(v)


@router.get("/vinculos", response_model=list[VinculoRead], response_model_exclude_none=True)
def list_vinculos_publicos(session: Session = Depends(get_session)) -> list[VinculoRead]:
    rows = session.exec(select(Vinculo).where(Vinculo.publico == True).order_by(Vinculo.id)).all()  # noqa: E712
    npcs = {n.id: n for n in session.exec(select(NPC)).all() if n.id is not None}
    return [
        vinculo_to_public_read(v)
        for v in rows
        if player_visible_with_personagens(v, npcs)
    ]
