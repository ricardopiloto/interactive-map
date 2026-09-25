"""Add campaign registry timestamps for the global admin console."""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "007_admin_console_timestamps"
down_revision: Union[str, Sequence[str], None] = "006_usuario_is_admin"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    columns = {column["name"] for column in sa.inspect(op.get_bind()).get_columns("campanha")}
    if "criado_em" not in columns or "modificado_em" not in columns:
        with op.batch_alter_table("campanha") as batch_op:
            if "criado_em" not in columns:
                batch_op.add_column(sa.Column("criado_em", sa.DateTime(), nullable=True))
            if "modificado_em" not in columns:
                batch_op.add_column(sa.Column("modificado_em", sa.DateTime(), nullable=True))


def downgrade() -> None:
    with op.batch_alter_table("campanha") as batch_op:
        batch_op.drop_column("modificado_em")
        batch_op.drop_column("criado_em")
