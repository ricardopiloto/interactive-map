from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlmodel import Session, select

from app.database import get_session
from app.models.npc import NPC
from app.models.vinculo import Vinculo, VinculoTipo
from app.routers.public.vinculos import vinculo_to_read
from app.schemas.vinculo import VinculoCreate, VinculoRead, VinculoUpdate, normalize_tipos
from app.services.rate_limit import limiter

router = APIRouter()


def _canonical_pair(a: int, b: int) -> tuple[int, int]:
    return (a, b) if a < b else (b, a)


def _ensure_pair_exists(session: Session, a: int, b: int) -> None:
    if not session.get(NPC, a) or not session.get(NPC, b):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Personagem inválido")


def _to_canonical_fields(
    raw_a: int,
    raw_b: int,
    tipo_ab: VinculoTipo,
    tipo_ba: VinculoTipo | None,
    nota_ab: str,
    nota_ba: str,
) -> tuple[int, int, VinculoTipo, VinculoTipo | None, str, str]:
    """Map form order (raw_a vê raw_b) onto persisted a_id < b_id."""
    a, b = _canonical_pair(raw_a, raw_b)
    if raw_a < raw_b:
        t_ab, t_ba, n_ab, n_ba = tipo_ab, tipo_ba, nota_ab, nota_ba
    else:
        # raw_a is stored as personagem_b
        t_ab = tipo_ba if tipo_ba is not None else tipo_ab
        t_ba = tipo_ab if tipo_ba is not None else None
        n_ab, n_ba = nota_ba, nota_ab
        if tipo_ba is None:
            # reciprocal: both directions same
            t_ab, t_ba, n_ab, n_ba = tipo_ab, None, nota_ab, ""
    t_ab, t_ba = normalize_tipos(t_ab, t_ba)
    if t_ba is None:
        n_ba = ""
    return a, b, t_ab, t_ba, n_ab, n_ba


@router.get("/vinculos", response_model=list[VinculoRead])
def list_vinculos(session: Session = Depends(get_session)) -> list[VinculoRead]:
    rows = session.exec(select(Vinculo).order_by(Vinculo.id)).all()
    return [vinculo_to_read(v) for v in rows]


@router.post("/vinculos", response_model=VinculoRead, status_code=status.HTTP_201_CREATED)
@limiter.limit("30/minute")
def create_vinculo(
    request: Request,
    payload: VinculoCreate,
    session: Session = Depends(get_session),
) -> VinculoRead:
    a, b, tipo_ab, tipo_ba, nota_ab, nota_ba = _to_canonical_fields(
        payload.personagem_a_id,
        payload.personagem_b_id,
        payload.tipo_ab,
        payload.tipo_ba,
        payload.nota_ab,
        payload.nota_ba,
    )
    _ensure_pair_exists(session, a, b)
    existing = session.exec(
        select(Vinculo).where(Vinculo.personagem_a_id == a, Vinculo.personagem_b_id == b)
    ).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Vínculo já existe")

    row = Vinculo(
        personagem_a_id=a,
        personagem_b_id=b,
        tipo_ab=tipo_ab,
        tipo_ba=tipo_ba,
        nota_ab=nota_ab,
        nota_ba=nota_ba,
        publico=payload.publico,
    )
    session.add(row)
    session.commit()
    session.refresh(row)
    return vinculo_to_read(row)


@router.put("/vinculos/{vinculo_id}", response_model=VinculoRead)
@limiter.limit("30/minute")
def update_vinculo(
    request: Request,
    vinculo_id: int,
    payload: VinculoUpdate,
    session: Session = Depends(get_session),
) -> VinculoRead:
    row = session.get(Vinculo, vinculo_id)
    if not row:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vínculo não encontrado")

    raw_a = payload.personagem_a_id if payload.personagem_a_id is not None else row.personagem_a_id
    raw_b = payload.personagem_b_id if payload.personagem_b_id is not None else row.personagem_b_id
    if raw_a == raw_b:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Vínculo não pode ligar um personagem a si mesmo",
        )

    # When client edits without reordering, ids stay canonical and tipo_ab is a→b on the row.
    # Treat payload tipo_ab/tipo_ba as perspectives of the *payload* personagem_a/b.
    tipo_ab = payload.tipo_ab if payload.tipo_ab is not None else row.tipo_ab
    if "tipo_ba" in payload.model_fields_set:
        tipo_ba = payload.tipo_ba
    else:
        tipo_ba = row.tipo_ba
    nota_ab = payload.nota_ab if payload.nota_ab is not None else row.nota_ab
    nota_ba = payload.nota_ba if payload.nota_ba is not None else row.nota_ba

    a, b, tipo_ab, tipo_ba, nota_ab, nota_ba = _to_canonical_fields(
        raw_a, raw_b, tipo_ab, tipo_ba, nota_ab, nota_ba
    )
    _ensure_pair_exists(session, a, b)

    clash = session.exec(
        select(Vinculo).where(
            Vinculo.personagem_a_id == a,
            Vinculo.personagem_b_id == b,
            Vinculo.id != vinculo_id,
        )
    ).first()
    if clash:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Vínculo já existe")

    row.personagem_a_id = a
    row.personagem_b_id = b
    row.tipo_ab = tipo_ab
    row.tipo_ba = tipo_ba
    row.nota_ab = nota_ab
    row.nota_ba = nota_ba
    if payload.publico is not None:
        row.publico = payload.publico

    session.add(row)
    session.commit()
    session.refresh(row)
    return vinculo_to_read(row)


@router.delete("/vinculos/{vinculo_id}", status_code=status.HTTP_204_NO_CONTENT)
@limiter.limit("30/minute")
def delete_vinculo(
    request: Request,
    vinculo_id: int,
    session: Session = Depends(get_session),
) -> None:
    row = session.get(Vinculo, vinculo_id)
    if not row:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vínculo não encontrado")
    session.delete(row)
    session.commit()
