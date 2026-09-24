"""identidade campanha: acento_id + capa_arquivo

Revision ID: 004_identidade
Revises: 003_unidade
Create Date: 2026-09-21

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "004_identidade"
down_revision: Union[str, Sequence[str], None] = "003_unidade"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    with op.batch_alter_table("campanha", schema=None) as batch_op:
        batch_op.add_column(sa.Column("acento_id", sa.String(length=32), nullable=True))
        batch_op.add_column(
            sa.Column("capa_arquivo", sa.String(length=500), nullable=False, server_default="")
        )


def downgrade() -> None:
    with op.batch_alter_table("campanha", schema=None) as batch_op:
        batch_op.drop_column("capa_arquivo")
        batch_op.drop_column("acento_id")
