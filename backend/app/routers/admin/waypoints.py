from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlmodel import Session, select

from app.database import get_session
from app.models.waypoint import Waypoint
from app.schemas.routes import WaypointCreate, WaypointRead, WaypointUpdate
from app.services.rate_limit import limiter
from app.services.waypoint_local_link import set_waypoint_local_id

router = APIRouter()


@router.get("/waypoints", response_model=list[WaypointRead])
def list_waypoints(session: Session = Depends(get_session)) -> list[Waypoint]:
    return list(session.exec(select(Waypoint).order_by(Waypoint.id)).all())


@router.post("/waypoints", response_model=WaypointRead, status_code=status.HTTP_201_CREATED)
@limiter.limit("30/minute")
def create_waypoint(
    request: Request,
    payload: WaypointCreate,
    session: Session = Depends(get_session),
) -> Waypoint:
    local_id = payload.local_id
    wp = Waypoint(
        nome=payload.nome,
        x=payload.x,
        y=payload.y,
        local_id=None,
    )
    session.add(wp)
    session.flush()
    if local_id is not None:
        set_waypoint_local_id(session, wp, local_id)
    session.commit()
    session.refresh(wp)
    return wp


@router.put("/waypoints/{waypoint_id}", response_model=WaypointRead)
@limiter.limit("30/minute")
def update_waypoint(
    request: Request,
    waypoint_id: int,
    payload: WaypointUpdate,
    session: Session = Depends(get_session),
) -> Waypoint:
    wp = session.get(Waypoint, waypoint_id)
    if not wp:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Waypoint não encontrado")
    data = payload.model_dump(exclude_unset=True)
    local_id_provided = "local_id" in data
    local_id_val = data.pop("local_id", None) if local_id_provided else None
    for key, value in data.items():
        setattr(wp, key, value)
    if local_id_provided:
        set_waypoint_local_id(session, wp, local_id_val)
    else:
        session.add(wp)
    session.commit()
    session.refresh(wp)
    return wp


@router.delete("/waypoints/{waypoint_id}", status_code=status.HTTP_204_NO_CONTENT)
@limiter.limit("30/minute")
def delete_waypoint(
    request: Request,
    waypoint_id: int,
    session: Session = Depends(get_session),
) -> None:
    from app.models.waypoint import RouteSegment

    wp = session.get(Waypoint, waypoint_id)
    if not wp:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Waypoint não encontrado")
    for seg in session.exec(
        select(RouteSegment).where(
            (RouteSegment.waypoint_a_id == waypoint_id)
            | (RouteSegment.waypoint_b_id == waypoint_id)
        )
    ).all():
        session.delete(seg)
    session.delete(wp)
    session.commit()
