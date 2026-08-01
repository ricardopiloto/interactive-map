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
        cols = {
            row[1]
            for row in conn.execute(text("PRAGMA table_info(grupo_posicao)")).fetchall()
        }
        if cols and "formato" not in cols:
            conn.execute(
                text(
                    "ALTER TABLE grupo_posicao ADD COLUMN formato VARCHAR(20) "
                    "NOT NULL DEFAULT 'bandeira'"
                )
            )


def init_db() -> None:
    SQLModel.metadata.create_all(engine)
    _migrate_sqlite()


def get_session() -> Generator[Session, None, None]:
    with Session(engine) as session:
        yield session
