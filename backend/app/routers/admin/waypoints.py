from fastapi import APIRouter, Depends, Request, status
from sqlmodel import Session, select

from app.database import get_session
from app.errors import raise_api_error
from app.models.waypoint import Waypoint
from app.models.local import Local
from app.schemas.routes import WaypointCreate, WaypointRead, WaypointUpdate
from app.services.rate_limit import limiter
from app.services.waypoint_local_link import set_waypoint_local_id, snap_local_to_waypoint
from app.services.route_planner import recompute_waypoint_distances

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
        raise_api_error(
            "WAYPOINT_NAO_ENCONTRADO",
            status_code=status.HTTP_404_NOT_FOUND,
            detalhes={"waypoint_id": waypoint_id},
        )
    data = payload.model_dump(exclude_unset=True)
    local_id_provided = "local_id" in data
    local_id_val = data.pop("local_id", None) if local_id_provided else None
    position_changed = any(key in data and data[key] != getattr(wp, key) for key in ("x", "y"))
    for key, value in data.items():
        setattr(wp, key, value)
    if local_id_provided and local_id_val != wp.local_id:
        set_waypoint_local_id(session, wp, local_id_val)
    else:
        session.add(wp)
        if position_changed and wp.local_id is not None:
            local = session.get(Local, wp.local_id)
            if local is not None:
                snap_local_to_waypoint(local, wp)
                session.add(local)
    if position_changed:
        recompute_waypoint_distances(session, waypoint_id)
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
        raise_api_error(
            "WAYPOINT_NAO_ENCONTRADO",
            status_code=status.HTTP_404_NOT_FOUND,
            detalhes={"waypoint_id": waypoint_id},
        )
    for seg in session.exec(
        select(RouteSegment).where(
            (RouteSegment.waypoint_a_id == waypoint_id)
            | (RouteSegment.waypoint_b_id == waypoint_id)
        )
    ).all():
        session.delete(seg)
    session.delete(wp)
    session.commit()
