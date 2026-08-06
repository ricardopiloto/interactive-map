from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlmodel import Session, select

from app.database import get_session
from app.models.waypoint import Waypoint
from app.schemas.routes import (
    ModoTransporte,
    OrdenacaoRota,
    PreferenciaVia,
    RoutePlanResponse,
    Ritmo,
    WaypointRead,
)
from app.services.route_planner import plan_routes

router = APIRouter()


@router.get("/routes/plan", response_model=RoutePlanResponse)
def plan(
    origem_waypoint_id: int = Query(...),
    destino_waypoint_id: int = Query(...),
    ritmo: Ritmo = Query(...),
    velocidade_media_mph: float | None = Query(default=None, gt=0),
    ordenacao: OrdenacaoRota = Query(default="mais_rapida"),
    modo_transporte: ModoTransporte | None = Query(
        default=None,
        description="pago=tabela; proprio=mph+custos 0; omitido=legado (mph opcional com tarifas)",
    ),
    preferencia_via: PreferenciaVia = Query(
        default="nenhuma",
        description="nenhuma=sem enviesamento; rio/estrada=preferência suave",
    ),
    session: Session = Depends(get_session),
) -> RoutePlanResponse:
    if origem_waypoint_id == destino_waypoint_id:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Origem e destino devem ser diferentes",
        )
    origem_wp = session.get(Waypoint, origem_waypoint_id)
    destino_wp = session.get(Waypoint, destino_waypoint_id)
    if not origem_wp or origem_wp.id is None:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Origem inválida (nó não encontrado)",
        )
    if not destino_wp or destino_wp.id is None:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Destino inválido (nó não encontrado)",
        )
    try:
        rotas = plan_routes(
            session,
            origem_wp.id,
            destino_wp.id,
            ritmo,
            velocidade_media_mph=velocidade_media_mph,
            ordenacao=ordenacao,
            modo_transporte=modo_transporte,
            preferencia_via=preferencia_via,
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(e)) from e
    return RoutePlanResponse(rotas=rotas)


@router.get("/waypoints", response_model=list[WaypointRead])
def list_public_waypoints(
    linked_only: bool = Query(False),
    session: Session = Depends(get_session),
) -> list[Waypoint]:
    stmt = select(Waypoint).order_by(Waypoint.id)
    rows = list(session.exec(stmt).all())
    if linked_only:
        rows = [w for w in rows if w.local_id is not None]
    return rows
