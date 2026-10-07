"""Make Capitulo.arco_id optional; invert the Capitulo<->Sessao link.

A Capitulo can be played across several Sessoes (N:1 Sessao -> Capitulo),
so the FK moves from Capitulo.sessao_id (1:1) to Sessao.capitulo_id (N:1).
Existing Capitulo.sessao_id values are backfilled into Sessao.capitulo_id
before the old column is dropped.

Revision ID: 012_capitulo_arco_opcional_sessao_vinculo
Revises: 011_npc_stat_block
Create Date: 2026-10-07

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "012_capitulo_arco_opcional_sessao_vinculo"
down_revision: Union[str, Sequence[str], None] = "011_npc_stat_block"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def _column_names(table: str) -> set[str]:
    bind = op.get_bind()
    return {c["name"] for c in sa.inspect(bind).get_columns(table)}


def upgrade() -> None:
    bind = op.get_bind()

    if "capitulo_id" not in _column_names("sessao"):
        op.add_column("sessao", sa.Column("capitulo_id", sa.Integer(), nullable=True))
        op.create_index("ix_sessao_capitulo_id", "sessao", ["capitulo_id"])
        with op.batch_alter_table("sessao", schema=None) as batch_op:
            batch_op.create_foreign_key(
                "fk_sessao_capitulo_id_capitulo",
                "capitulo",
                ["capitulo_id"],
                ["id"],
                ondelete="SET NULL",
            )

    if "sessao_id" in _column_names("capitulo"):
        bind.execute(
            sa.text(
                "UPDATE sessao SET capitulo_id = ("
                "  SELECT capitulo.id FROM capitulo WHERE capitulo.sessao_id = sessao.id"
                ") WHERE EXISTS ("
                "  SELECT 1 FROM capitulo WHERE capitulo.sessao_id = sessao.id"
                ")"
            )
        )
        with op.batch_alter_table("capitulo", schema=None, recreate="always") as batch_op:
            batch_op.drop_column("sessao_id")

    with op.batch_alter_table("capitulo", schema=None, recreate="always") as batch_op:
        batch_op.alter_column("arco_id", existing_type=sa.Integer(), nullable=True)


def downgrade() -> None:
    bind = op.get_bind()

    with op.batch_alter_table("capitulo", schema=None, recreate="always") as batch_op:
        batch_op.alter_column("arco_id", existing_type=sa.Integer(), nullable=False)

    if "sessao_id" not in _column_names("capitulo"):
        with op.batch_alter_table("capitulo", schema=None, recreate="always") as batch_op:
            batch_op.add_column(sa.Column("sessao_id", sa.Integer(), nullable=True))
            batch_op.create_foreign_key(
                "fk_capitulo_sessao_id_sessao",
                "sessao",
                ["sessao_id"],
                ["id"],
                ondelete="SET NULL",
            )
            batch_op.create_unique_constraint("uq_capitulo_sessao_id", ["sessao_id"])
        bind.execute(
            sa.text(
                "UPDATE capitulo SET sessao_id = ("
                "  SELECT sessao.id FROM sessao WHERE sessao.capitulo_id = capitulo.id LIMIT 1"
                ") WHERE EXISTS ("
                "  SELECT 1 FROM sessao WHERE sessao.capitulo_id = capitulo.id"
                ")"
            )
        )

    if "capitulo_id" in _column_names("sessao"):
        op.drop_index("ix_sessao_capitulo_id", table_name="sessao")
        with op.batch_alter_table("sessao", schema=None, recreate="always") as batch_op:
            batch_op.drop_column("capitulo_id")
