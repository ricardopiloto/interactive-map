"""Add Capitulo, the adventure-prep unit under an Arco.

Revision ID: 010_capitulo
Revises: 009_item
Create Date: 2026-10-06

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "010_capitulo"
down_revision: Union[str, Sequence[str], None] = "009_item"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    if "capitulo" in set(inspector.get_table_names()):
        return
    op.create_table(
        "capitulo",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("arco_id", sa.Integer(), nullable=False),
        sa.Column("titulo", sa.String(length=200), nullable=False),
        sa.Column("ordem", sa.Integer(), nullable=False),
        sa.Column("corpo_markdown", sa.String(length=50000), nullable=False),
        sa.Column("sessao_id", sa.Integer(), nullable=True),
        sa.Column("visivel_para_todos", sa.Boolean(), nullable=False),
        sa.ForeignKeyConstraint(["arco_id"], ["arco.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["sessao_id"], ["sessao.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("sessao_id"),
    )
    op.create_index("ix_capitulo_arco_id", "capitulo", ["arco_id"])
    op.create_index("ix_capitulo_ordem", "capitulo", ["ordem"])


def downgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    if "capitulo" not in set(inspector.get_table_names()):
        return
    op.drop_index("ix_capitulo_ordem", table_name="capitulo")
    op.drop_index("ix_capitulo_arco_id", table_name="capitulo")
    op.drop_table("capitulo")
