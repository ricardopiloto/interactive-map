"""Add Item and its links to Sessao and Evento.

Revision ID: 009_item
Revises: 008_arco_cor_sessao_vinculo
Create Date: 2026-10-04

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "009_item"
down_revision: Union[str, Sequence[str], None] = "008_arco_cor_sessao_vinculo"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    tables = set(inspector.get_table_names())

    if "item" not in tables:
        op.create_table(
            "item",
            sa.Column("id", sa.Integer(), nullable=False),
            sa.Column("nome", sa.String(length=200), nullable=False),
            sa.Column("descricao", sa.String(length=50000), nullable=False),
            sa.Column("visivel_para_todos", sa.Boolean(), nullable=False),
            sa.PrimaryKeyConstraint("id"),
        )

    if "item_sessao" not in tables:
        op.create_table(
            "item_sessao",
            sa.Column("item_id", sa.Integer(), nullable=False),
            sa.Column("sessao_id", sa.Integer(), nullable=False),
            sa.ForeignKeyConstraint(["item_id"], ["item.id"]),
            sa.ForeignKeyConstraint(["sessao_id"], ["sessao.id"]),
            sa.PrimaryKeyConstraint("item_id", "sessao_id"),
        )

    if "item_evento" not in tables:
        op.create_table(
            "item_evento",
            sa.Column("item_id", sa.Integer(), nullable=False),
            sa.Column("evento_id", sa.Integer(), nullable=False),
            sa.ForeignKeyConstraint(["evento_id"], ["evento.id"]),
            sa.ForeignKeyConstraint(["item_id"], ["item.id"]),
            sa.PrimaryKeyConstraint("item_id", "evento_id"),
        )


def downgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    tables = set(inspector.get_table_names())
    if "item_evento" in tables:
        op.drop_table("item_evento")
    if "item_sessao" in tables:
        op.drop_table("item_sessao")
    if "item" in tables:
        op.drop_table("item")
