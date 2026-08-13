from fastapi import APIRouter, Depends
from sqlmodel import Session, select

from app.database import get_session
from app.models.vinculo import Vinculo
from app.schemas.vinculo import VinculoRead, is_duas_vias

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
        qualificador=v.qualificador or "",
        direcao=v.direcao,
    )


def player_visible(v: Vinculo) -> bool:
    if not v.publico:
        return False
    if not is_duas_vias(v.tipo_ab, v.tipo_ba):
        return True
    return bool(v.conhecido_ab or v.conhecido_ba)


def vinculo_to_public_read(v: Vinculo) -> VinculoRead:
    """Redact unknown tips so secret tipos never reach players."""
    qual = v.qualificador or ""
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
            qualificador=qual,
            direcao=direcao,
        )

    tipo_ab = v.tipo_ab if v.conhecido_ab else None
    tipo_ba = v.tipo_ba if v.conhecido_ba else None
    nota_ab = v.nota_ab if v.conhecido_ab else ""
    nota_ba = v.nota_ba if v.conhecido_ba else ""
    # Only-AB known → look reciprocal (tipo_ba null)
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
            qualificador=qual,
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
        qualificador=qual,
        direcao=direcao,
    )


# Back-compat alias used by admin until updated
def vinculo_to_read(v: Vinculo) -> VinculoRead:
    return vinculo_to_admin_read(v)


@router.get("/vinculos", response_model=list[VinculoRead], response_model_exclude_none=True)
def list_vinculos_publicos(session: Session = Depends(get_session)) -> list[VinculoRead]:
    rows = session.exec(select(Vinculo).where(Vinculo.publico == True).order_by(Vinculo.id)).all()  # noqa: E712
    return [vinculo_to_public_read(v) for v in rows if player_visible(v)]
