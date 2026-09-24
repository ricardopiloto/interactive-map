"""usuario ganha is_admin

Revision ID: 006_usuario_is_admin
Revises: 005_genero
Create Date: 2026-09-24

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "006_usuario_is_admin"
down_revision: Union[str, Sequence[str], None] = "005_genero"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    with op.batch_alter_table("usuario", schema=None) as batch_op:
        batch_op.add_column(
            sa.Column("is_admin", sa.Boolean(), nullable=False, server_default=sa.false())
        )


def downgrade() -> None:
    with op.batch_alter_table("usuario", schema=None) as batch_op:
        batch_op.drop_column("is_admin")
