"""Add Sessao.notas_preparo for GM-only session prep notes.

Revision ID: 010_sessao_notas_preparo
Revises: 009_item
Create Date: 2026-10-20

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "010_sessao_notas_preparo"
down_revision: Union[str, Sequence[str], None] = "009_item"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def _column_names(table: str) -> set[str]:
    bind = op.get_bind()
    return {c["name"] for c in sa.inspect(bind).get_columns(table)}


def upgrade() -> None:
    if "notas_preparo" not in _column_names("sessao"):
        op.add_column(
            "sessao",
            sa.Column(
                "notas_preparo",
                sa.String(length=50000),
                nullable=False,
                server_default="",
            ),
        )


def downgrade() -> None:
    if "notas_preparo" in _column_names("sessao"):
        with op.batch_alter_table("sessao", schema=None) as batch_op:
            batch_op.drop_column("notas_preparo")
