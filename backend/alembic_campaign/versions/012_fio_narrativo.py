"""Add private narrative threads to a campaign.

Revision ID: 012_fio_narrativo
Revises: 011_personagem_notas_mecanicas
"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "012_fio_narrativo"
down_revision: Union[str, Sequence[str], None] = "011_personagem_notas_mecanicas"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    if "fio_narrativo" not in sa.inspect(op.get_bind()).get_table_names():
        op.create_table(
            "fio_narrativo",
            sa.Column("id", sa.Integer(), primary_key=True),
            sa.Column("titulo", sa.String(length=200), nullable=False),
            sa.Column("descricao", sa.String(length=5000), nullable=False),
            sa.Column("estado", sa.String(length=20), nullable=False),
            sa.Column("origem", sa.String(length=20), nullable=False),
            sa.Column("sessao_origem_id", sa.Integer(), nullable=True),
            sa.Column("ordem", sa.Integer(), nullable=False),
            sa.Column("criado_em", sa.DateTime(), nullable=False),
        )


def downgrade() -> None:
    if "fio_narrativo" in sa.inspect(op.get_bind()).get_table_names():
        op.drop_table("fio_narrativo")
