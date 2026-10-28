"""Add opt-in search indexing to campaigns."""

from alembic import op
import sqlalchemy as sa

revision = "010_indexacao_buscadores"
down_revision = "009_registo_cota"
branch_labels = None
depends_on = None


def upgrade() -> None:
    with op.batch_alter_table("campanha") as batch:
        batch.add_column(sa.Column("indexavel", sa.Boolean(), nullable=False, server_default=sa.false()))


def downgrade() -> None:
    with op.batch_alter_table("campanha") as batch:
        batch.drop_column("indexavel")
