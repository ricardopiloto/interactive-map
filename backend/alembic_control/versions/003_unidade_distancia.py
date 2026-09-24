"""unidade_distancia on campanha

Revision ID: 003_unidade
Revises: 002_auth
Create Date: 2026-09-21

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "003_unidade"
down_revision: Union[str, Sequence[str], None] = "002_auth"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    with op.batch_alter_table("campanha", schema=None) as batch_op:
        batch_op.add_column(
            sa.Column(
                "unidade_distancia",
                sa.String(length=8),
                nullable=False,
                server_default="mi",
            )
        )


def downgrade() -> None:
    with op.batch_alter_table("campanha", schema=None) as batch_op:
        batch_op.drop_column("unidade_distancia")
