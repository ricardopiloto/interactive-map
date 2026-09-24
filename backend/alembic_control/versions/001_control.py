"""initial control schema — campanha

Revision ID: 001_control
Revises:
Create Date: 2026-09-19

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "001_control"
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "campanha",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("slug", sa.String(length=48), nullable=False),
        sa.Column("nome", sa.String(length=200), nullable=False),
        sa.Column("sistema", sa.String(length=40), nullable=False),
        sa.Column("modulos_ativos", sa.JSON(), nullable=False),
        sa.Column("visibilidade", sa.String(length=20), nullable=False),
        sa.Column("caminho", sa.String(length=200), nullable=False),
        sa.Column("mapa_arquivo", sa.String(length=500), nullable=False),
        sa.Column("cota_bytes", sa.Integer(), nullable=False),
        sa.Column("bytes_usados", sa.Integer(), nullable=False),
        sa.Column("activa", sa.Boolean(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("slug"),
    )
    with op.batch_alter_table("campanha", schema=None) as batch_op:
        batch_op.create_index(batch_op.f("ix_campanha_slug"), ["slug"], unique=True)


def downgrade() -> None:
    with op.batch_alter_table("campanha", schema=None) as batch_op:
        batch_op.drop_index(batch_op.f("ix_campanha_slug"))
    op.drop_table("campanha")
