from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlmodel import Session, select

from app.database import get_session
from app.models.waypoint import RouteSegment, Waypoint
from app.schemas.routes import RouteSegmentCreate, RouteSegmentRead, RouteSegmentUpdate
from app.services.rate_limit import limiter
from app.services.route_planner import (
    compute_distancia_milhas,
    dump_pontos,
    get_or_create_scale,
    parse_pontos,
)

router = APIRouter()


def _to_read(seg: RouteSegment) -> RouteSegmentRead:
    return RouteSegmentRead(
        id=seg.id,  # type: ignore[arg-type]
        waypoint_a_id=seg.waypoint_a_id,
        waypoint_b_id=seg.waypoint_b_id,
        tipo=seg.tipo,
        pontos_intermediarios=parse_pontos(seg.pontos_intermediarios),
        distancia_milhas=seg.distancia_milhas,
        modificador_velocidade=seg.modificador_velocidade,
    )


@router.get("/route-segments", response_model=list[RouteSegmentRead])
def list_segments(session: Session = Depends(get_session)) -> list[RouteSegmentRead]:
    return [_to_read(s) for s in session.exec(select(RouteSegment).order_by(RouteSegment.id)).all()]


@router.post("/route-segments", response_model=RouteSegmentRead, status_code=status.HTTP_201_CREATED)
@limiter.limit("30/minute")
def create_segment(
    request: Request,
    payload: RouteSegmentCreate,
    session: Session = Depends(get_session),
) -> RouteSegmentRead:
    a = session.get(Waypoint, payload.waypoint_a_id)
    b = session.get(Waypoint, payload.waypoint_b_id)
    if not a or not b:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Waypoint inválido")
    scale = get_or_create_scale(session)
    dist = compute_distancia_milhas(a, b, payload.pontos_intermediarios, scale.miles_per_map_unit)
    seg = RouteSegment(
        waypoint_a_id=payload.waypoint_a_id,
        waypoint_b_id=payload.waypoint_b_id,
        tipo=payload.tipo,
        pontos_intermediarios=dump_pontos(payload.pontos_intermediarios),
        distancia_milhas=dist,
        modificador_velocidade=payload.modificador_velocidade,
    )
    session.add(seg)
    session.commit()
    session.refresh(seg)
    return _to_read(seg)


@router.put("/route-segments/{segment_id}", response_model=RouteSegmentRead)
@limiter.limit("30/minute")
def update_segment(
    request: Request,
    segment_id: int,
    payload: RouteSegmentUpdate,
    session: Session = Depends(get_session),
) -> RouteSegmentRead:
    seg = session.get(RouteSegment, segment_id)
    if not seg:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Segmento não encontrado")
    data = payload.model_dump(exclude_unset=True)
    mid = parse_pontos(seg.pontos_intermediarios)
    if "pontos_intermediarios" in data and data["pontos_intermediarios"] is not None:
        mid = data.pop("pontos_intermediarios")
        seg.pontos_intermediarios = dump_pontos(mid)
    for key, value in data.items():
        setattr(seg, key, value)
    if seg.waypoint_a_id == seg.waypoint_b_id:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Self-loop inválido")
    a = session.get(Waypoint, seg.waypoint_a_id)
    b = session.get(Waypoint, seg.waypoint_b_id)
    if not a or not b:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Waypoint inválido")
    scale = get_or_create_scale(session)
    seg.distancia_milhas = compute_distancia_milhas(a, b, mid, scale.miles_per_map_unit)
    session.add(seg)
    session.commit()
    session.refresh(seg)
    return _to_read(seg)


@router.delete("/route-segments/{segment_id}", status_code=status.HTTP_204_NO_CONTENT)
@limiter.limit("30/minute")
def delete_segment(
    request: Request,
    segment_id: int,
    session: Session = Depends(get_session),
) -> None:
    seg = session.get(RouteSegment, segment_id)
    if not seg:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Segmento não encontrado")
    session.delete(seg)
    session.commit()
