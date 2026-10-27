from fastapi import APIRouter, Depends, Request, status
from pydantic import BaseModel, Field
from sqlmodel import Session, select

from app.database import get_session
from app.deps.auth import MembroContext, require_dono
from app.errors import raise_api_error
from app.models.fio_narrativo import FioNarrativo
from app.models.sessao import Sessao
from app.schemas.fio_narrativo import EstadoFio, FioCreate, FioLote, FioOrdem, FioRead, FioUpdate
from app.services.rate_limit import limiter
from app.services.motor_ia_fios import propor_fios

router = APIRouter(dependencies=[Depends(require_dono)])


def _get(session: Session, fio_id: int) -> FioNarrativo:
    fio = session.get(FioNarrativo, fio_id)
    if fio is None:
        raise_api_error("FIO_NAO_ENCONTRADO", status_code=404)
    return fio


def _validate_sessao(session: Session, sessao_id: int | None) -> None:
    if sessao_id is not None and session.get(Sessao, sessao_id) is None:
        raise_api_error("SESSAO_NAO_ENCONTRADA", status_code=400)


def _next_order(session: Session) -> int:
    rows = session.exec(select(FioNarrativo.ordem)).all()
    return max(rows, default=-1) + 1


class ProporFiosRequest(BaseModel):
    sessao_id: int | None = Field(default=None, gt=0)


@router.post("/fios/propor")
@limiter.limit("10/minute")
def propor_fios_admin(request: Request, payload: ProporFiosRequest,
                     ctx: MembroContext = Depends(require_dono),
                     session: Session = Depends(get_session)):
    return propor_fios(session, ctx, payload.sessao_id)


@router.get("/fios", response_model=list[FioRead])
@limiter.limit("30/minute")
def list_fios(request: Request, estado: EstadoFio | None = None, session: Session = Depends(get_session)):
    query = select(FioNarrativo)
    if estado is not None:
        query = query.where(FioNarrativo.estado == estado)
    return session.exec(query.order_by(FioNarrativo.ordem, FioNarrativo.id)).all()


@router.post("/fios", response_model=FioRead, status_code=status.HTTP_201_CREATED)
@limiter.limit("30/minute")
def create_fio(request: Request, payload: FioCreate, session: Session = Depends(get_session)):
    _validate_sessao(session, payload.sessao_origem_id)
    if not payload.titulo.strip():
        raise_api_error("FIO_TITULO_INVALIDO", status_code=400)
    fio = FioNarrativo(**payload.model_dump(), ordem=_next_order(session))
    session.add(fio)
    session.commit()
    session.refresh(fio)
    return fio


@router.post("/fios/lote", response_model=list[FioRead], status_code=status.HTTP_201_CREATED)
@limiter.limit("30/minute")
def create_fios_lote(request: Request, payload: FioLote, session: Session = Depends(get_session)):
    # Validate the entire request before the first insert; commit only once.
    for item in payload.fios:
        if not item.titulo.strip():
            raise_api_error("FIO_TITULO_INVALIDO", status_code=400)
        _validate_sessao(session, item.sessao_origem_id)
    ordem = _next_order(session)
    rows = [FioNarrativo(**item.model_dump(), ordem=ordem + i) for i, item in enumerate(payload.fios)]
    try:
        session.add_all(rows)
        session.commit()
    except Exception:
        session.rollback()
        raise
    for row in rows:
        session.refresh(row)
    return rows


@router.patch("/fios/{fio_id}", response_model=FioRead)
@limiter.limit("30/minute")
def update_fio(request: Request, fio_id: int, payload: FioUpdate, session: Session = Depends(get_session)):
    fio = _get(session, fio_id)
    data = payload.model_dump(exclude_unset=True)
    if "sessao_origem_id" in data:
        _validate_sessao(session, data["sessao_origem_id"])
    if any(data.get(key) is None for key in ("titulo", "descricao", "estado") if key in data):
        raise_api_error("FIO_CAMPO_INVALIDO", status_code=400)
    if "titulo" in data and not data["titulo"].strip():
        raise_api_error("FIO_TITULO_INVALIDO", status_code=400)
    for key, value in data.items():
        setattr(fio, key, value)
    session.add(fio)
    session.commit()
    session.refresh(fio)
    return fio


@router.delete("/fios/{fio_id}", status_code=status.HTTP_204_NO_CONTENT)
@limiter.limit("30/minute")
def delete_fio(request: Request, fio_id: int, session: Session = Depends(get_session)):
    session.delete(_get(session, fio_id))
    session.commit()


@router.put("/fios/ordem", response_model=list[FioRead])
@limiter.limit("30/minute")
def reorder_fios(request: Request, payload: FioOrdem, session: Session = Depends(get_session)):
    rows = list(session.exec(select(FioNarrativo)).all())
    if len(payload.ids) != len(rows) or set(payload.ids) != {row.id for row in rows}:
        raise_api_error("FIO_ORDEM_INVALIDA", status_code=400)
    by_id = {row.id: row for row in rows}
    for ordem, fio_id in enumerate(payload.ids):
        row = by_id[fio_id]
        row.ordem = ordem
        session.add(row)
    session.commit()
    return [by_id[fio_id] for fio_id in payload.ids]
