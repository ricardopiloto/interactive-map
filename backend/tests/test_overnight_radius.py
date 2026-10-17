from __future__ import annotations

from app.models.local import Local
from app.models.waypoint import RouteSegment, RouteTipo, Waypoint
from sqlmodel import select
from app.services.overnight import simulate_overnights_and_fatigue
from app.services.route_planner import best_pure_candidate, build_graph, plan_routes


def scenario(*, linked: bool = False):
    nodes = {
        1: Waypoint(id=1, nome="Origem", x=0, y=0),
        2: Waypoint(id=2, nome="Meio", x=0.5, y=0, local_id=10 if linked else None),
        3: Waypoint(id=3, nome="Destino", x=1, y=0),
    }
    edges = [{"distancia": 60, "seg_id": 1}, {"distancia": 60, "seg_id": 2}]
    return nodes, edges


def simulate(places, *, linked=False, ritmo="normal"):
    nodes, edges = scenario(linked=linked)
    return simulate_overnights_and_fatigue(
        [1, 2, 3], edges, nodes, {}, {10: "Nó", 11: "Cidade", 12: "Outra"},
        places, 60, 0.2, ritmo, max_intermediate=1,
    )


def test_radius_shelters_off_route_local_and_keeps_interpolated_position():
    stops, *_ = simulate([(11, 0.51, 0.01)])
    assert stops[0].tipo == "local"
    assert stops[0].local_id == 11
    assert stops[0].nome == "Cidade"
    assert (stops[0].x, stops[0].y) == (0.5, 0)


def test_distant_local_stays_outdoors():
    stops, *_ = simulate([(11, 0.8, 0.2)])
    assert stops[0].tipo == "relento"
    assert stops[0].local_id is None


def test_nearest_local_wins():
    stops, *_ = simulate([(11, 0.51, 0), (12, 0.505, 0)])
    assert stops[0].local_id == 12


def test_linked_node_has_priority_over_radius():
    stops, *_ = simulate([(12, 0.5, 0)], linked=True)
    assert stops[0].local_id == 10
    assert stops[0].nome == "Nó"


def test_shelter_recovers_intense_fatigue():
    outdoors = simulate([], ritmo="intenso")
    sheltered = simulate([(11, 0.505, 0)], ritmo="intenso")
    assert outdoors[1:3] == (2, 2)
    assert sheltered[1:3] == (1, 1)
    assert [day.residual for day in outdoors[5]] == [True, True]
    assert [day.residual for day in sheltered[5]] == [False, True]


def test_pure_candidate_uses_radius_like_main_planner(db_session):
    nodes = [Waypoint(nome=name, x=x, y=0) for name, x in [("A", 0), ("B", 0.5), ("C", 1)]]
    db_session.add_all(nodes)
    db_session.add(Local(nome="Cidade", x=0.5, y=0.01))
    db_session.commit()
    for node in nodes:
        db_session.refresh(node)
    db_session.add_all([
        RouteSegment(waypoint_a_id=nodes[0].id, waypoint_b_id=nodes[1].id, tipo=RouteTipo.estrada, distancia_milhas=60),
        RouteSegment(waypoint_a_id=nodes[1].id, waypoint_b_id=nodes[2].id, tipo=RouteTipo.estrada, distancia_milhas=60),
    ])
    db_session.commit()
    routes = plan_routes(db_session, nodes[0].id, nodes[2].id, "normal", velocidade_media_mph=10)
    assert routes[0].pernoites[0].tipo == "local"
    assert routes[0].pernoites[0].nome == "Cidade"
    _, waypoints, by_id, parallels = build_graph(db_session, 10, "mais_rapida")
    place = db_session.exec(select(Local)).one()
    pure = best_pure_candidate(
        parallels, nodes[0].id, nodes[2].id, "estrada", "mais_rapida", "nenhuma",
        "tempo", waypoints, by_id, 6, local_names={place.id: place.nome},
        locais_posicoes=[(place.id, place.x, place.y)],
    )
    assert pure is not None
    assert pure[0].pernoites[0].local_id == place.id
