"""Add the rebuildable campaign search index."""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "013_indice_ia"
down_revision: Union[str, Sequence[str], None] = "012_fio_narrativo"
branch_labels = None
depends_on = None


def upgrade() -> None:
    conn = op.get_bind()
    conn.execute(sa.text("CREATE TABLE IF NOT EXISTS indice_ia_estado (id INTEGER PRIMARY KEY CHECK(id = 1), estado TEXT NOT NULL CHECK(estado IN ('ok', 'desatualizado', 'indisponivel')), atualizado_em TEXT, versao_indice INTEGER NOT NULL)"))
    try:
        conn.execute(sa.text("CREATE VIRTUAL TABLE IF NOT EXISTS indice_ia USING fts5(texto, tipo UNINDEXED, registro_id UNINDEXED, parte UNINDEXED, visivel UNINDEXED, tokenize='unicode61 remove_diacritics 2')"))
    except sa.exc.OperationalError as exc:
        if "fts5" not in str(exc).lower():
            raise
        conn.execute(sa.text("INSERT OR REPLACE INTO indice_ia_estado VALUES (1, 'indisponivel', NULL, 1)"))


def downgrade() -> None:
    conn = op.get_bind()
    conn.execute(sa.text("DROP TABLE IF EXISTS indice_ia"))
    conn.execute(sa.text("DROP TABLE IF EXISTS indice_ia_estado"))
