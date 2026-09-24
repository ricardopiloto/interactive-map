"""auth tables — usuario, membro, convite, sessao, login_bloqueio

Revision ID: 002_auth
Revises: 001_control
Create Date: 2026-09-20

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "002_auth"
down_revision: Union[str, Sequence[str], None] = "001_control"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "usuario",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("email", sa.String(length=320), nullable=False),
        sa.Column("senha_hash", sa.String(length=500), nullable=True),
        sa.Column("activo", sa.Boolean(), nullable=False),
        sa.Column("criado_em", sa.DateTime(), nullable=False),
        sa.Column("actualizado_em", sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("email"),
    )
    with op.batch_alter_table("usuario", schema=None) as batch_op:
        batch_op.create_index(batch_op.f("ix_usuario_email"), ["email"], unique=True)

    op.create_table(
        "membro",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("usuario_id", sa.Integer(), nullable=False),
        sa.Column("campanha_id", sa.Integer(), nullable=False),
        sa.Column("papel", sa.String(length=40), nullable=False),
        sa.Column("criado_em", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["campanha_id"], ["campanha.id"]),
        sa.ForeignKeyConstraint(["usuario_id"], ["usuario.id"]),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("usuario_id", "campanha_id", name="uq_membro_usuario_campanha"),
    )
    with op.batch_alter_table("membro", schema=None) as batch_op:
        batch_op.create_index(batch_op.f("ix_membro_usuario_id"), ["usuario_id"], unique=False)
        batch_op.create_index(batch_op.f("ix_membro_campanha_id"), ["campanha_id"], unique=False)

    op.create_table(
        "convite",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("usuario_id", sa.Integer(), nullable=False),
        sa.Column("tipo", sa.String(length=20), nullable=False),
        sa.Column("token_hash", sa.String(length=128), nullable=False),
        sa.Column("expira_em", sa.DateTime(), nullable=False),
        sa.Column("consumido_em", sa.DateTime(), nullable=True),
        sa.Column("criado_em", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["usuario_id"], ["usuario.id"]),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("token_hash"),
    )
    with op.batch_alter_table("convite", schema=None) as batch_op:
        batch_op.create_index(batch_op.f("ix_convite_usuario_id"), ["usuario_id"], unique=False)
        batch_op.create_index(batch_op.f("ix_convite_token_hash"), ["token_hash"], unique=True)

    op.create_table(
        "sessao",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("usuario_id", sa.Integer(), nullable=False),
        sa.Column("token_hash", sa.String(length=128), nullable=False),
        sa.Column("criado_em", sa.DateTime(), nullable=False),
        sa.Column("ultimo_acesso", sa.DateTime(), nullable=False),
        sa.Column("revogada", sa.Boolean(), nullable=False),
        sa.ForeignKeyConstraint(["usuario_id"], ["usuario.id"]),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("token_hash"),
    )
    with op.batch_alter_table("sessao", schema=None) as batch_op:
        batch_op.create_index(batch_op.f("ix_sessao_usuario_id"), ["usuario_id"], unique=False)
        batch_op.create_index(batch_op.f("ix_sessao_token_hash"), ["token_hash"], unique=True)

    op.create_table(
        "login_bloqueio",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("chave", sa.String(length=400), nullable=False),
        sa.Column("falhas", sa.Integer(), nullable=False),
        sa.Column("bloqueado_ate", sa.DateTime(), nullable=True),
        sa.Column("actualizado_em", sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("chave"),
    )
    with op.batch_alter_table("login_bloqueio", schema=None) as batch_op:
        batch_op.create_index(batch_op.f("ix_login_bloqueio_chave"), ["chave"], unique=True)


def downgrade() -> None:
    with op.batch_alter_table("login_bloqueio", schema=None) as batch_op:
        batch_op.drop_index(batch_op.f("ix_login_bloqueio_chave"))
    op.drop_table("login_bloqueio")
    with op.batch_alter_table("sessao", schema=None) as batch_op:
        batch_op.drop_index(batch_op.f("ix_sessao_token_hash"))
        batch_op.drop_index(batch_op.f("ix_sessao_usuario_id"))
    op.drop_table("sessao")
    with op.batch_alter_table("convite", schema=None) as batch_op:
        batch_op.drop_index(batch_op.f("ix_convite_token_hash"))
        batch_op.drop_index(batch_op.f("ix_convite_usuario_id"))
    op.drop_table("convite")
    with op.batch_alter_table("membro", schema=None) as batch_op:
        batch_op.drop_index(batch_op.f("ix_membro_campanha_id"))
        batch_op.drop_index(batch_op.f("ix_membro_usuario_id"))
    op.drop_table("membro")
    with op.batch_alter_table("usuario", schema=None) as batch_op:
        batch_op.drop_index(batch_op.f("ix_usuario_email"))
    op.drop_table("usuario")
