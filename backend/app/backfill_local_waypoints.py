"""One-time, idempotent Local → Waypoint backfill.

Run with ``python -m app.backfill_local_waypoints``. The command backs up every
active campaign database with SQLite's online backup API before opening any
campaign session for writes. Only active catalog campaigns are considered.
"""

import argparse
import json
import sqlite3
from datetime import datetime, timezone
from pathlib import Path

from sqlmodel import Session, select

from app.campaign_db import campaign_db_path, data_dir, get_control_engine, resolve_campaign_session
from app.models.campanha import Campanha
from app.models.local import Local
from app.models.waypoint import Waypoint
from app.services.waypoint_local_link import set_local_waypoint_id, waypoint_id_for_local


def active_campaigns() -> list[Campanha]:
    with Session(get_control_engine()) as control:
        rows = list(control.exec(
            select(Campanha).where(Campanha.activa == True).order_by(Campanha.slug)  # noqa: E712
        ).all())
        for row in rows:
            control.expunge(row)
        return rows


def backup_campaigns(rows: list[Campanha], backup_dir: Path) -> dict[str, str]:
    """Hot backup all active DBs; raise before backfill if any copy fails."""
    backup_dir.mkdir(parents=True, exist_ok=False)
    backups: dict[str, str] = {}
    campaign_root = (data_dir() / "campanhas").resolve()
    for row in rows:
        source = campaign_db_path(row.caminho).resolve()
        if source.parent.parent != campaign_root or not source.is_file():
            raise RuntimeError(f"Caminho inválido ou ausente para campanha {row.slug}: {source}")
        target = backup_dir / f"{row.id}-{row.slug}.campanha.db"
        with sqlite3.connect(f"file:{source}?mode=ro", uri=True) as original:
            with sqlite3.connect(target) as backup:
                original.backup(backup)
                integrity = backup.execute("PRAGMA integrity_check").fetchone()
                if integrity != ("ok",):
                    raise RuntimeError(f"Backup inválido para campanha {row.slug}: {integrity}")
        backups[row.slug] = str(target)
    (backup_dir / "manifest.json").write_text(
        json.dumps(backups, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )
    return backups


def run(rows: list[Campanha] | None = None) -> dict[str, int]:
    rows = active_campaigns() if rows is None else rows
    counts: dict[str, int] = {}
    for row in rows:
        slug = row.slug
        with resolve_campaign_session(slug) as session:
            count = 0
            for local in session.exec(select(Local)).all():
                if waypoint_id_for_local(session, int(local.id)) is not None:
                    continue
                waypoint = Waypoint(x=local.x, y=local.y)
                session.add(waypoint)
                session.flush()
                set_local_waypoint_id(session, local, waypoint.id)
                count += 1
            session.commit()
            counts[slug] = count
    return counts


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--backup-dir", type=Path, default=None)
    args = parser.parse_args()
    rows = active_campaigns()
    backup_dir = args.backup_dir or data_dir() / "backups" / (
        "local-waypoint-" + datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    )
    for campaign_slug, path in backup_campaigns(rows, backup_dir).items():
        print(f"{campaign_slug}: backup {path}", flush=True)
    for campaign_slug, created in run(rows).items():
        print(f"{campaign_slug}: {created} waypoints criados")
