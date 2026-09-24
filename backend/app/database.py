"""Database session dependency — resolves campaign SQLite via path slug."""

from __future__ import annotations

from collections.abc import Generator

from fastapi import Path
from sqlmodel import Session

from app.campaign_db import get_session as _get_session
from app.legacy_migrate import migrate_sqlite_legacy

# Back-compat alias for callers/tests that still import the name
_migrate_sqlite = migrate_sqlite_legacy  # type: ignore[assignment]


def get_session(slug: str = Path(...)) -> Generator[Session, None, None]:
    yield from _get_session(slug)
