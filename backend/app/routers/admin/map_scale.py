from fastapi import APIRouter, Depends, Request
from sqlmodel import Session

from app.database import get_session
from app.models.waypoint import MapScale
from app.schemas.routes import MapScaleRead, MapScaleUpdate
from app.services.rate_limit import limiter
from app.services.route_planner import get_or_create_scale, recompute_all_distances

router = APIRouter()


@router.get("/map-scale", response_model=MapScaleRead)
def read_scale(session: Session = Depends(get_session)) -> MapScale:
    return get_or_create_scale(session)


@router.put("/map-scale", response_model=MapScaleRead)
@limiter.limit("30/minute")
def update_scale(
    request: Request,
    payload: MapScaleUpdate,
    session: Session = Depends(get_session),
) -> MapScale:
    scale = get_or_create_scale(session)
    scale.miles_per_map_unit = payload.miles_per_map_unit
    if payload.notas is not None:
        scale.notas = payload.notas
    session.add(scale)
    session.commit()
    recompute_all_distances(session)
    session.refresh(scale)
    return scale
