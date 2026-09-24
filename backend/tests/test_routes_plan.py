from __future__ import annotations

from tests.conftest import api
from tests.helpers import seed_segment, seed_waypoints_pair


def test_plan_success_on_connected_network(client, db_session) -> None:
    origem, destino = seed_waypoints_pair(db_session)
    seed_segment(db_session, origem.id, destino.id)  # type: ignore[arg-type]

    response = client.get(
        api("/api/routes/plan"),
        params={
            "origem_waypoint_id": origem.id,
            "destino_waypoint_id": destino.id,
            "ritmo": "normal",
        },
    )
    assert response.status_code == 200
    body = response.json()
    assert "rotas" in body
    assert len(body["rotas"]) >= 1
    first = body["rotas"][0]
    assert origem.id in first["waypoint_ids"]
    assert destino.id in first["waypoint_ids"]
    assert "distancia_milhas" in first
    assert "geometria" in first


def test_plan_insufficient_network_returns_empty_rotas(client, db_session) -> None:
    origem, destino = seed_waypoints_pair(db_session)

    response = client.get(
        api("/api/routes/plan"),
        params={
            "origem_waypoint_id": origem.id,
            "destino_waypoint_id": destino.id,
            "ritmo": "normal",
        },
    )
    assert response.status_code == 200
    assert response.json() == {"rotas": []}
