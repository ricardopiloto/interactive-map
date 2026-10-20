"""Add GM-only mechanical notes to NPC.

Revision ID: 011_personagem_notas_mecanicas
Revises: 010_sessao_notas_preparo
Create Date: 2026-10-20
"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "011_personagem_notas_mecanicas"
down_revision: Union[str, Sequence[str], None] = "010_sessao_notas_preparo"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def _column_names(table: str) -> set[str]:
    return {column["name"] for column in sa.inspect(op.get_bind()).get_columns(table)}


def upgrade() -> None:
    if "notas_mecanicas" not in _column_names("npc"):
        op.add_column(
            "npc",
            sa.Column("notas_mecanicas", sa.String(length=10000), nullable=False, server_default=""),
        )


def downgrade() -> None:
    if "notas_mecanicas" in _column_names("npc"):
        with op.batch_alter_table("npc", schema=None) as batch_op:
            batch_op.drop_column("notas_mecanicas")
