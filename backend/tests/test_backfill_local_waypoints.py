from sqlmodel import select

from app.backfill_local_waypoints import active_campaigns, backup_campaigns, run
from app.campaign_db import resolve_campaign_session
from app.models.local import Local
from app.models.waypoint import Waypoint
from tests.conftest import TEST_CAMPAIGN_SLUG


def test_backfill_is_idempotent(data_root) -> None:
    with resolve_campaign_session(TEST_CAMPAIGN_SLUG) as session:
        local = Local(nome="Sem nó", x=0.25, y=0.75)
        session.add(local)
        session.commit()
        local_id = local.id
    assert run()[TEST_CAMPAIGN_SLUG] == 1
    assert run()[TEST_CAMPAIGN_SLUG] == 0
    with resolve_campaign_session(TEST_CAMPAIGN_SLUG) as session:
        nodes = session.exec(select(Waypoint).where(Waypoint.local_id == local_id)).all()
        assert len(nodes) == 1
        assert (nodes[0].x, nodes[0].y) == (0.25, 0.75)


def test_hot_backup_preserves_pre_backfill_state(data_root) -> None:
    with resolve_campaign_session(TEST_CAMPAIGN_SLUG) as session:
        session.add(Local(nome="Antes", x=0.1, y=0.2))
        session.commit()
    backup_dir = data_root / "backups" / "before"
    backups = backup_campaigns(active_campaigns(), backup_dir)
    assert TEST_CAMPAIGN_SLUG in backups
    import sqlite3

    with sqlite3.connect(backups[TEST_CAMPAIGN_SLUG]) as backup:
        assert backup.execute("PRAGMA integrity_check").fetchone() == ("ok",)
        assert backup.execute("SELECT count(*) FROM local WHERE nome='Antes'").fetchone() == (1,)
        assert backup.execute("SELECT count(*) FROM waypoint").fetchone() == (0,)
