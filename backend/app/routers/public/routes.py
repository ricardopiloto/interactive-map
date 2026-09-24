from fastapi import APIRouter, Depends, Query, status
from sqlmodel import Session, select

from app.database import get_session
from app.errors import raise_api_error
from app.models.local import Local
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
from app.services.visibility import is_visivel_para_jogador

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
        raise_api_error(
            "ROTA_ORIGEM_DESTINO_IGUAIS",
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        )
    origem_wp = session.get(Waypoint, origem_waypoint_id)
    destino_wp = session.get(Waypoint, destino_waypoint_id)
    if not origem_wp or origem_wp.id is None:
        raise_api_error(
            "ROTA_ORIGEM_INVALIDA",
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        )
    if not destino_wp or destino_wp.id is None:
        raise_api_error(
            "ROTA_DESTINO_INVALIDO",
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
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
        raise_api_error(
            "ROTA_CALCULO_FALHOU",
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detalhes={"motivo": str(e)},
        )
    return RoutePlanResponse(rotas=rotas)


@router.get("/waypoints", response_model=list[WaypointRead])
def list_public_waypoints(
    linked_only: bool = Query(False),
    session: Session = Depends(get_session),
) -> list[WaypointRead]:
    stmt = select(Waypoint).order_by(Waypoint.id)
    rows = list(session.exec(stmt).all())
    out: list[WaypointRead] = []
    for w in rows:
        local_id = w.local_id
        if local_id is not None:
            loc = session.get(Local, local_id)
            if not is_visivel_para_jogador(loc):
                local_id = None
        if linked_only and local_id is None:
            continue
        out.append(
            WaypointRead(
                id=w.id,  # type: ignore[arg-type]
                nome=w.nome,
                x=w.x,
                y=w.y,
                local_id=local_id,
            )
        )
    return out
