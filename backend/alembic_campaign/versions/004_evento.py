"""Add evento timeline tables

Revision ID: 004_evento
Revises: 003_visibilidade_local_arco
Create Date: 2026-09-24

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "004_evento"
down_revision: Union[str, Sequence[str], None] = "003_visibilidade_local_arco"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    tables = set(inspector.get_table_names())

    if "evento" not in tables:
        op.create_table(
            "evento",
            sa.Column("id", sa.Integer(), nullable=False),
            sa.Column("titulo", sa.String(length=200), nullable=False),
            sa.Column("ano", sa.Integer(), nullable=False),
            sa.Column("mes", sa.Integer(), nullable=True),
            sa.Column("rotulo_era", sa.String(length=100), nullable=True),
            sa.Column("descricao", sa.String(length=50000), nullable=False),
            sa.Column("sessao_id", sa.Integer(), nullable=True),
            sa.Column("visivel_para_todos", sa.Boolean(), nullable=False),
            sa.ForeignKeyConstraint(["sessao_id"], ["sessao.id"]),
            sa.PrimaryKeyConstraint("id"),
        )
        op.create_index(op.f("ix_evento_ano"), "evento", ["ano"], unique=False)
    else:
        cols = {c["name"] for c in inspector.get_columns("evento")}
        if "mes" not in cols:
            op.add_column("evento", sa.Column("mes", sa.Integer(), nullable=True))

    if "evento_local" not in tables:
        op.create_table(
            "evento_local",
            sa.Column("evento_id", sa.Integer(), nullable=False),
            sa.Column("local_id", sa.Integer(), nullable=False),
            sa.ForeignKeyConstraint(["local_id"], ["local.id"]),
            sa.ForeignKeyConstraint(["evento_id"], ["evento.id"]),
            sa.PrimaryKeyConstraint("evento_id", "local_id"),
        )

    if "evento_npc" not in tables:
        op.create_table(
            "evento_npc",
            sa.Column("evento_id", sa.Integer(), nullable=False),
            sa.Column("npc_id", sa.Integer(), nullable=False),
            sa.ForeignKeyConstraint(["npc_id"], ["npc.id"]),
            sa.ForeignKeyConstraint(["evento_id"], ["evento.id"]),
            sa.PrimaryKeyConstraint("evento_id", "npc_id"),
        )


def downgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    tables = set(inspector.get_table_names())
    if "evento_npc" in tables:
        op.drop_table("evento_npc")
    if "evento_local" in tables:
        op.drop_table("evento_local")
    if "evento" in tables:
        op.drop_index(op.f("ix_evento_ano"), table_name="evento")
        op.drop_table("evento")
