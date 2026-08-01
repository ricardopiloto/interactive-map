from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlmodel import Session, select

from app.database import get_session
from app.models.arco import Arco
from app.models.local import Local
from app.schemas.arco import ArcoCreate, ArcoRead, ArcoUpdate
from app.services.rate_limit import limiter

router = APIRouter()


@router.post("/arcos", response_model=ArcoRead, status_code=status.HTTP_201_CREATED)
@limiter.limit("30/minute")
def create_arco(
    request: Request,
    payload: ArcoCreate,
    session: Session = Depends(get_session),
) -> Arco:
    arco = Arco.model_validate(payload)
    session.add(arco)
    session.commit()
    session.refresh(arco)
    return arco


@router.put("/arcos/{arco_id}", response_model=ArcoRead)
@limiter.limit("30/minute")
def update_arco(
    request: Request,
    arco_id: int,
    payload: ArcoUpdate,
    session: Session = Depends(get_session),
) -> Arco:
    arco = session.get(Arco, arco_id)
    if not arco:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Arco não encontrado")

    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(arco, key, value)

    session.add(arco)
    session.commit()
    session.refresh(arco)
    return arco


@router.delete("/arcos/{arco_id}", status_code=status.HTTP_204_NO_CONTENT)
@limiter.limit("30/minute")
def delete_arco(
    request: Request,
    arco_id: int,
    session: Session = Depends(get_session),
) -> None:
    arco = session.get(Arco, arco_id)
    if not arco:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Arco não encontrado")
    for local in session.exec(select(Local).where(Local.arco_id == arco_id)).all():
        local.arco_id = None
        session.add(local)
    session.delete(arco)
    session.commit()
