"""Add sessao chronicle tables

Revision ID: 002_sessao
Revises: 001_campaign
Create Date: 2026-09-22

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "002_sessao"
down_revision: Union[str, Sequence[str], None] = "001_campaign"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    tables = set(inspector.get_table_names())

    # Fresh installs: 001 create_all may already have created these after models landed.
    if "sessao" not in tables:
        op.create_table(
            "sessao",
            sa.Column("id", sa.Integer(), nullable=False),
            sa.Column("numero", sa.Integer(), nullable=False),
            sa.Column("titulo", sa.String(length=200), nullable=False),
            sa.Column("data_rotulo", sa.String(length=100), nullable=True),
            sa.Column("resumo", sa.String(length=50000), nullable=False),
            sa.Column("visivel_para_todos", sa.Boolean(), nullable=False),
            sa.PrimaryKeyConstraint("id"),
            sa.UniqueConstraint("numero"),
        )
        op.create_index(op.f("ix_sessao_numero"), "sessao", ["numero"], unique=True)

    if "sessao_local" not in tables:
        op.create_table(
            "sessao_local",
            sa.Column("sessao_id", sa.Integer(), nullable=False),
            sa.Column("local_id", sa.Integer(), nullable=False),
            sa.ForeignKeyConstraint(["local_id"], ["local.id"]),
            sa.ForeignKeyConstraint(["sessao_id"], ["sessao.id"]),
            sa.PrimaryKeyConstraint("sessao_id", "local_id"),
        )

    if "sessao_npc" not in tables:
        op.create_table(
            "sessao_npc",
            sa.Column("sessao_id", sa.Integer(), nullable=False),
            sa.Column("npc_id", sa.Integer(), nullable=False),
            sa.ForeignKeyConstraint(["npc_id"], ["npc.id"]),
            sa.ForeignKeyConstraint(["sessao_id"], ["sessao.id"]),
            sa.PrimaryKeyConstraint("sessao_id", "npc_id"),
        )


def downgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    tables = set(inspector.get_table_names())
    if "sessao_npc" in tables:
        op.drop_table("sessao_npc")
    if "sessao_local" in tables:
        op.drop_table("sessao_local")
    if "sessao" in tables:
        op.drop_index(op.f("ix_sessao_numero"), table_name="sessao")
        op.drop_table("sessao")
