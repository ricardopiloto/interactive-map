from __future__ import annotations

from contextlib import contextmanager
from pathlib import Path
from typing import Generator, Iterator

from alembic import command
from alembic.config import Config
from alembic.runtime.migration import MigrationContext
from alembic.script import ScriptDirectory
from sqlalchemy import create_engine, text
from sqlalchemy.engine import Engine
from sqlmodel import Session, select

from app.config import settings
from app.errors import raise_api_error
from app.legacy_migrate import migrate_sqlite_legacy
from app.models.campanha import Campanha

_BACKEND_ROOT = Path(__file__).resolve().parent.parent
_control_engine: Engine | None = None
_campaign_engines: dict[str, Engine] = {}
_last_campanha: Campanha | None = None


def data_dir() -> Path:
    return Path(settings.data_dir).resolve()


def control_db_path() -> Path:
    return data_dir() / "control.db"


def control_database_url() -> str:
    return f"sqlite:///{control_db_path()}"


def get_control_engine() -> Engine:
    global _control_engine
    if _control_engine is None:
        data_dir().mkdir(parents=True, exist_ok=True)
        _control_engine = create_engine(
            control_database_url(),
            connect_args={"check_same_thread": False},
        )
    return _control_engine


def reset_engines() -> None:
    """Dispose engines — used by tests when DATA_DIR changes."""
    global _control_engine, _last_campanha
    if _control_engine is not None:
        _control_engine.dispose()
        _control_engine = None
    for eng in _campaign_engines.values():
        eng.dispose()
    _campaign_engines.clear()
    _last_campanha = None


def forget_campaign_engine(uuid_key: str) -> None:
    """Dispose a cached campaign engine (e.g. after replacing campanha.db on disk)."""
    eng = _campaign_engines.pop(uuid_key, None)
    if eng is not None:
        eng.dispose()


def _alembic_config(tree: str, db_url: str) -> Config:
    script_location = _BACKEND_ROOT / f"alembic_{tree}"
    cfg = Config()
    cfg.set_main_option("script_location", str(script_location))
    cfg.set_main_option("sqlalchemy.url", db_url)
    return cfg


def upgrade_control_head() -> None:
    engine = get_control_engine()
    cfg = _alembic_config("control", str(engine.url))
    command.upgrade(cfg, "head")


def campaign_site_path(caminho: str) -> Path:
    return data_dir() / caminho


def campaign_db_path(caminho: str) -> Path:
    return campaign_site_path(caminho) / "campanha.db"


def campaign_uploads_path(caminho: str) -> Path:
    return campaign_site_path(caminho) / "uploads"


def _campaign_url(caminho: str) -> str:
    return f"sqlite:///{campaign_db_path(caminho)}"


def get_campaign_engine(uuid_key: str, caminho: str) -> Engine:
    if uuid_key not in _campaign_engines:
        eng = create_engine(
            _campaign_url(caminho),
            connect_args={"check_same_thread": False},
        )
        _campaign_engines[uuid_key] = eng
    return _campaign_engines[uuid_key]


def _alembic_current_revision(engine: Engine) -> str | None:
    with engine.connect() as conn:
        context = MigrationContext.configure(conn)
        return context.get_current_revision()


def _campaign_head_revision() -> str:
    cfg = _alembic_config("campaign", "sqlite:///")
    script = ScriptDirectory.from_config(cfg)
    return script.get_current_head()  # type: ignore[return-value]


def _has_content_tables(engine: Engine) -> bool:
    with engine.connect() as conn:
        rows = conn.execute(
            text("SELECT name FROM sqlite_master WHERE type='table' AND name='local'")
        ).fetchall()
    return bool(rows)


def ensure_campaign_schema(engine: Engine, *, fresh: bool = False) -> None:
    """Upgrade or bridge+stamp a campaign database to Alembic head."""
    cfg = _alembic_config("campaign", str(engine.url))
    head = _campaign_head_revision()
    current = _alembic_current_revision(engine)

    if current == head:
        return

    if current is None:
        if fresh or not _has_content_tables(engine):
            command.upgrade(cfg, "head")
            return
        migrate_sqlite_legacy(engine)
        command.stamp(cfg, "head")
        return

    command.upgrade(cfg, "head")


def lookup_campanha(slug: str) -> Campanha:
    """HTTP-facing lookup: missing and inactive share opaque CAMPANHA_NAO_ENCONTRADA."""
    with Session(get_control_engine()) as session:
        row = session.exec(select(Campanha).where(Campanha.slug == slug)).first()
        if row is None or not row.activa:
            raise_api_error("CAMPANHA_NAO_ENCONTRADA", status_code=404)
        session.expunge(row)
        return row


def current_campanha() -> Campanha | None:
    """Last campaign resolved in this process (set by resolve_campaign_session)."""
    return _last_campanha


def uploads_dir_for_slug(slug: str) -> Path:
    camp = lookup_campanha(slug)
    return campaign_uploads_path(camp.caminho)


def get_resolved_uploads_dir() -> Path:
    camp = current_campanha()
    if camp is not None:
        return campaign_uploads_path(camp.caminho)
    return Path(settings.uploads_dir)


@contextmanager
def resolve_campaign_session(slug: str) -> Iterator[Session]:
    global _last_campanha
    if not (slug or "").strip():
        raise_api_error("CAMPANHA_NAO_ENCONTRADA", status_code=404)
    camp = lookup_campanha(slug.strip())
    uuid_key = Path(camp.caminho).name
    engine = get_campaign_engine(uuid_key, camp.caminho)
    ensure_campaign_schema(engine, fresh=False)
    _last_campanha = camp
    with Session(engine) as session:
        yield session


def get_session(slug: str) -> Generator[Session, None, None]:
    with resolve_campaign_session(slug) as session:
        yield session


def init_control() -> None:
    data_dir().mkdir(parents=True, exist_ok=True)
    (data_dir() / "campanhas").mkdir(parents=True, exist_ok=True)
    upgrade_control_head()
