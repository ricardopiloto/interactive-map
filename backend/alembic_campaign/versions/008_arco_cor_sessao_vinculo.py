"""Add Arco.cor and Sessao.arco_id/arco_transicao_id for the "Por arcos" timeline mode."""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "008_arco_cor_sessao_vinculo"
down_revision: Union[str, Sequence[str], None] = "007_estado_exploracao_local"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def _column_names(table: str) -> set[str]:
    bind = op.get_bind()
    return {c["name"] for c in sa.inspect(bind).get_columns(table)}


def upgrade() -> None:
    if "cor" not in _column_names("arco"):
        op.add_column("arco", sa.Column("cor", sa.String(length=7), nullable=True))

    sessao_columns = _column_names("sessao")
    if "arco_id" not in sessao_columns:
        op.add_column("sessao", sa.Column("arco_id", sa.Integer(), nullable=True))
        op.create_index("ix_sessao_arco_id", "sessao", ["arco_id"])
    if "arco_transicao_id" not in sessao_columns:
        op.add_column("sessao", sa.Column("arco_transicao_id", sa.Integer(), nullable=True))
        op.create_index("ix_sessao_arco_transicao_id", "sessao", ["arco_transicao_id"])


def downgrade() -> None:
    sessao_columns = _column_names("sessao")
    if "arco_transicao_id" in sessao_columns:
        op.drop_index("ix_sessao_arco_transicao_id", table_name="sessao")
        with op.batch_alter_table("sessao", schema=None) as batch_op:
            batch_op.drop_column("arco_transicao_id")
    if "arco_id" in sessao_columns:
        op.drop_index("ix_sessao_arco_id", table_name="sessao")
        with op.batch_alter_table("sessao", schema=None) as batch_op:
            batch_op.drop_column("arco_id")

    if "cor" in _column_names("arco"):
        with op.batch_alter_table("arco", schema=None) as batch_op:
            batch_op.drop_column("cor")
