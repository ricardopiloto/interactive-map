from collections.abc import Generator

from sqlalchemy import text
from sqlmodel import Session, SQLModel, create_engine

from app.config import settings

connect_args = {"check_same_thread": False} if settings.database_url.startswith("sqlite") else {}
engine = create_engine(settings.database_url, connect_args=connect_args)


def _migrate_sqlite() -> None:
    if not settings.database_url.startswith("sqlite"):
        return
    with engine.begin() as conn:
        grupo_cols = {
            row[1]
            for row in conn.execute(text("PRAGMA table_info(grupo_posicao)")).fetchall()
        }
        if grupo_cols and "formato" not in grupo_cols:
            conn.execute(
                text(
                    "ALTER TABLE grupo_posicao ADD COLUMN formato VARCHAR(20) "
                    "NOT NULL DEFAULT 'bandeira'"
                )
            )

        local_cols = {
            row[1] for row in conn.execute(text("PRAGMA table_info(local)")).fetchall()
        }
        if local_cols and "cor_pin" not in local_cols:
            conn.execute(
                text(
                    "ALTER TABLE local ADD COLUMN cor_pin VARCHAR(7) "
                    "NOT NULL DEFAULT '#c4b5fd'"
                )
            )


def init_db() -> None:
    # Register all table models on SQLModel.metadata before create_all.
    import app.models  # noqa: F401

    SQLModel.metadata.create_all(engine)
    _migrate_sqlite()


def get_session() -> Generator[Session, None, None]:
    with Session(engine) as session:
        yield session
