"""Persist exploration state independently from session label and pin color."""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "007_estado_exploracao_local"
down_revision: Union[str, Sequence[str], None] = "006_campaign_state"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    columns = {column["name"] for column in sa.inspect(op.get_bind()).get_columns("local")}
    if "estado_exploracao" in columns:
        return
    with op.batch_alter_table("local") as batch_op:
        batch_op.add_column(
            sa.Column("estado_exploracao", sa.String(length=10), nullable=False, server_default="conhecido")
        )
    op.execute(
        sa.text(
            "UPDATE local SET estado_exploracao = "
            "CASE WHEN data_sessao IS NOT NULL AND trim(data_sessao) <> '' "
            "THEN 'visitado' ELSE 'conhecido' END"
        )
    )


def downgrade() -> None:
    columns = {column["name"] for column in sa.inspect(op.get_bind()).get_columns("local")}
    if "estado_exploracao" not in columns:
        return
    with op.batch_alter_table("local") as batch_op:
        batch_op.drop_column("estado_exploracao")
