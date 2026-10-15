"""Remove obsolete campaign genre from control registry."""

from alembic import op
import sqlalchemy as sa

revision = "008_remove_genero"
down_revision = "007_admin_console_timestamps"
branch_labels = None
depends_on = None


def upgrade() -> None:
    with op.batch_alter_table("campanha") as batch_op:
        batch_op.drop_column("genero")


def downgrade() -> None:
    with op.batch_alter_table("campanha") as batch_op:
        batch_op.add_column(sa.Column("genero", sa.String(length=16), nullable=False, server_default="fantasia"))
