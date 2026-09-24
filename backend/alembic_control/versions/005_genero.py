"""genero replaces acento_id on campanha

Revision ID: 005_genero
Revises: 004_identidade
Create Date: 2026-09-22

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "005_genero"
down_revision: Union[str, Sequence[str], None] = "004_identidade"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def _genero_from_legacy(sistema: str | None, acento_id: str | None) -> str:
    sistema_n = (sistema or "").strip().lower()
    acento = (acento_id or "").strip().lower() or None
    if sistema_n == "wfrp4e" and acento in (None, "latao"):
        return "fantasia"
    if sistema_n == "wod" and acento == "vinho":
        return "gotico"
    if acento == "vinho":
        return "gotico"
    return "fantasia"


def upgrade() -> None:
    with op.batch_alter_table("campanha", schema=None) as batch_op:
        batch_op.add_column(sa.Column("genero", sa.String(length=16), nullable=True))

    conn = op.get_bind()
    rows = conn.execute(sa.text("SELECT id, sistema, acento_id FROM campanha")).fetchall()
    for row in rows:
        gen = _genero_from_legacy(row[1], row[2])
        conn.execute(
            sa.text("UPDATE campanha SET genero = :g WHERE id = :id"),
            {"g": gen, "id": row[0]},
        )

    with op.batch_alter_table("campanha", schema=None) as batch_op:
        batch_op.alter_column(
            "genero",
            existing_type=sa.String(length=16),
            nullable=False,
            server_default="fantasia",
        )
        batch_op.drop_column("acento_id")


def downgrade() -> None:
    with op.batch_alter_table("campanha", schema=None) as batch_op:
        batch_op.add_column(sa.Column("acento_id", sa.String(length=32), nullable=True))

    conn = op.get_bind()
    rows = conn.execute(sa.text("SELECT id, genero FROM campanha")).fetchall()
    for row in rows:
        acento = "vinho" if row[1] == "gotico" else "latao"
        conn.execute(
            sa.text("UPDATE campanha SET acento_id = :a WHERE id = :id"),
            {"a": acento, "id": row[0]},
        )

    with op.batch_alter_table("campanha", schema=None) as batch_op:
        batch_op.drop_column("genero")
