"""Add NPC.stat_block. Existing rows stay empty; descricao is not copied.

Revision ID: 011_npc_stat_block
Revises: 010_capitulo
Create Date: 2026-10-06

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "011_npc_stat_block"
down_revision: Union[str, Sequence[str], None] = "010_capitulo"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    bind = op.get_bind()
    columns = {c["name"] for c in sa.inspect(bind).get_columns("npc")}
    if "stat_block" in columns:
        return
    op.add_column("npc", sa.Column("stat_block", sa.JSON(), nullable=True))


def downgrade() -> None:
    bind = op.get_bind()
    columns = {c["name"] for c in sa.inspect(bind).get_columns("npc")}
    if "stat_block" not in columns:
        return
    with op.batch_alter_table("npc", schema=None) as batch_op:
        batch_op.drop_column("stat_block")
