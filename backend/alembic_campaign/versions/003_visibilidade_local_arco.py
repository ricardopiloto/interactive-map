"""Add visivel_para_todos to local and arco

Revision ID: 003_visibilidade_local_arco
Revises: 002_sessao
Create Date: 2026-09-22

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "003_visibilidade_local_arco"
down_revision: Union[str, Sequence[str], None] = "002_sessao"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def _column_names(table: str) -> set[str]:
    bind = op.get_bind()
    return {c["name"] for c in sa.inspect(bind).get_columns(table)}


def _drop_if_exists(table: str) -> None:
    bind = op.get_bind()
    if table in sa.inspect(bind).get_table_names():
        op.drop_table(table)


def upgrade() -> None:
    # Leftover from interrupted batch_alter_table runs.
    _drop_if_exists("_alembic_tmp_local")
    _drop_if_exists("_alembic_tmp_arco")

    # SQLite ADD COLUMN is enough; avoid batch recreate.
    if "visivel_para_todos" not in _column_names("local"):
        op.add_column(
            "local",
            sa.Column(
                "visivel_para_todos",
                sa.Boolean(),
                nullable=False,
                server_default=sa.true(),
            ),
        )
    if "visivel_para_todos" not in _column_names("arco"):
        op.add_column(
            "arco",
            sa.Column(
                "visivel_para_todos",
                sa.Boolean(),
                nullable=False,
                server_default=sa.true(),
            ),
        )


def downgrade() -> None:
    with op.batch_alter_table("arco", schema=None) as batch_op:
        batch_op.drop_column("visivel_para_todos")
    with op.batch_alter_table("local", schema=None) as batch_op:
        batch_op.drop_column("visivel_para_todos")
