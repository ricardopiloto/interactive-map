"""Add optional mes column to evento

Revision ID: 005_evento_mes
Revises: 004_evento
Create Date: 2026-09-24

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "005_evento_mes"
down_revision: Union[str, Sequence[str], None] = "004_evento"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    tables = set(inspector.get_table_names())
    if "evento" not in tables:
        return
    cols = {c["name"] for c in inspector.get_columns("evento")}
    if "mes" not in cols:
        op.add_column("evento", sa.Column("mes", sa.Integer(), nullable=True))


def downgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    tables = set(inspector.get_table_names())
    if "evento" not in tables:
        return
    cols = {c["name"] for c in inspector.get_columns("evento")}
    if "mes" in cols:
        op.drop_column("evento", "mes")
