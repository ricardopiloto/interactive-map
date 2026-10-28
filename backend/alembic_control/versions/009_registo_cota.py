"""Set campaign quota and add signup metadata."""

import logging

from alembic import op
import sqlalchemy as sa

revision = "009_registo_cota"
down_revision = "008_remove_genero"
branch_labels = None
depends_on = None


def _canonical_email(email: str) -> str:
    local, separator, domain = email.strip().lower().partition("@")
    if not separator:
        return local
    local = local.split("+", 1)[0]
    if domain in {"gmail.com", "googlemail.com"}:
        local = local.replace(".", "")
        domain = "gmail.com"
    return f"{local}@{domain}"


def upgrade() -> None:
    connection = op.get_bind()
    connection.execute(sa.text("UPDATE campanha SET cota_bytes = 314572800"))
    rows = connection.execute(sa.text(
        "SELECT slug, bytes_usados FROM campanha WHERE bytes_usados > cota_bytes"
    ))
    for slug, used in rows:
        logging.getLogger(__name__).warning("Campanha acima da cota: slug=%s bytes_usados=%s", slug, used)
    with op.batch_alter_table("usuario") as batch:
        batch.add_column(sa.Column("email_canonico", sa.String(length=320), nullable=True))
        batch.add_column(sa.Column("termos_aceitos_em", sa.DateTime(), nullable=True))
        batch.create_index("ix_usuario_email_canonico", ["email_canonico"])
    rows = connection.execute(sa.text("SELECT id, email FROM usuario")).all()
    for user_id, email in rows:
        connection.execute(
            sa.text("UPDATE usuario SET email_canonico = :canonical WHERE id = :id"),
            {"canonical": _canonical_email(email), "id": user_id},
        )


def downgrade() -> None:
    with op.batch_alter_table("usuario") as batch:
        batch.drop_index("ix_usuario_email_canonico")
        batch.drop_column("termos_aceitos_em")
        batch.drop_column("email_canonico")
