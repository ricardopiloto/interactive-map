from starlette.requests import Request

from app.models.local import Local
from app.models.waypoint import RouteSegment, Waypoint
from app.campaign_db import resolve_campaign_session
from app.routers.admin.locais import create_local, delete_local, update_local
from app.routers.admin.route_segments import create_segment, delete_segment
from app.routers.admin.waypoints import create_waypoint, delete_waypoint, update_waypoint
from app.schemas.local import LocalCreate, LocalUpdate
from app.schemas.routes import RouteSegmentCreate, WaypointCreate, WaypointUpdate
from app.services.route_planner import build_graph
from app.services.waypoint_local_link import snap_waypoint_to_local
from tests.conftest import TEST_CAMPAIGN_SLUG


REQUEST = Request({"type": "http", "method": "PUT", "path": "/", "headers": []})


def test_snap_waypoint_to_local() -> None:
    local = Local(nome="Local", x=0.2, y=0.3)
    waypoint = Waypoint(x=0.8, y=0.9)
    snap_waypoint_to_local(waypoint, local)
    assert (waypoint.x, waypoint.y) == (0.2, 0.3)


def test_local_and_waypoint_move_with_segment_distance(db_session) -> None:
    local = create_local(REQUEST, LocalCreate(nome="Vila", x=0.2, y=0.3, cor_pin="#123456"), db_session)
    wp_id = local.waypoint_id
    assert wp_id is not None
    wp = db_session.get(Waypoint, wp_id)
    assert (wp.x, wp.y) == (0.2, 0.3)

    other = Waypoint(x=0.8, y=0.3)
    db_session.add(other)
    db_session.flush()
    segment = RouteSegment(waypoint_a_id=wp_id, waypoint_b_id=other.id, distancia_milhas=60)
    db_session.add(segment)
    db_session.commit()

    moved = update_local(REQUEST, local.id, LocalUpdate(waypoint_id=wp_id, x=0.4, y=0.3), db_session)
    assert moved.x == 0.4
    db_session.refresh(wp)
    db_session.refresh(segment)
    assert wp.x == 0.4
    assert segment.distancia_milhas == 40
    graph, _, _, _ = build_graph(db_session, None)
    assert graph[wp_id][other.id]["distancia"] == 40

    # A metadata edit resends coordinates; neither side should snap.
    wp.x = 0.41
    db_session.add(wp)
    db_session.commit()
    renamed = update_local(REQUEST, local.id, LocalUpdate(
        waypoint_id=wp_id, x=0.4, y=0.3, nome="Vila nova"), db_session)
    db_session.refresh(wp)
    assert renamed.x == 0.4 and wp.x == 0.41

    update_waypoint(REQUEST, wp_id, WaypointUpdate(x=0.6, y=0.3), db_session)
    db_session.refresh(segment)
    assert db_session.get(Local, local.id).x == 0.6
    assert segment.distancia_milhas == 20

    delete_local(REQUEST, local.id, db_session)
    db_session.refresh(wp)
    assert wp.local_id is None


def test_delete_segment_after_two_moves_with_separate_sessions(data_root) -> None:
    """Reproduce the e2e write order using one campaign session per request."""
    slug = TEST_CAMPAIGN_SLUG
    with resolve_campaign_session(slug) as session:
        local = create_local(REQUEST, LocalCreate(
            nome="Limpeza", x=0.2, y=0.3, cor_pin="#123456"), session)
    with resolve_campaign_session(slug) as session:
        other = create_waypoint(REQUEST, WaypointCreate(x=0.8, y=0.3), session)
    with resolve_campaign_session(slug) as session:
        segment = create_segment(REQUEST, RouteSegmentCreate(
            waypoint_a_id=local.waypoint_id, waypoint_b_id=other.id), session)
    with resolve_campaign_session(slug) as session:
        update_local(REQUEST, local.id, LocalUpdate(
            waypoint_id=local.waypoint_id, x=0.4, y=0.3), session)
    with resolve_campaign_session(slug) as session:
        update_waypoint(REQUEST, local.waypoint_id, WaypointUpdate(x=0.7, y=0.6), session)
    with resolve_campaign_session(slug) as session:
        delete_segment(REQUEST, segment.id, session)
    with resolve_campaign_session(slug) as session:
        assert session.get(RouteSegment, segment.id) is None
        delete_waypoint(REQUEST, other.id, session)
    with resolve_campaign_session(slug) as session:
        delete_local(REQUEST, local.id, session)
