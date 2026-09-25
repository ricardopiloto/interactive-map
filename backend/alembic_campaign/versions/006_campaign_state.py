"""Add per-campaign operational modification timestamp."""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "006_campaign_state"
down_revision: Union[str, Sequence[str], None] = "005_evento_mes"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    if "campaign_state" not in sa.inspect(op.get_bind()).get_table_names():
        op.create_table(
            "campaign_state",
            sa.Column("id", sa.Integer(), primary_key=True),
            sa.Column("modificado_em", sa.DateTime(), nullable=True),
            sa.CheckConstraint("id = 1", name="ck_campaign_state_singleton"),
        )
    op.execute(sa.text("INSERT OR IGNORE INTO campaign_state (id, modificado_em) VALUES (1, NULL)"))


def downgrade() -> None:
    op.drop_table("campaign_state")
