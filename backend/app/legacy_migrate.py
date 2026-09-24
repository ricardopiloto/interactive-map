"""Legacy ad-hoc SQLite ALTER bridge — only for unstamped campaign DBs."""

from __future__ import annotations

from sqlalchemy import text
from sqlalchemy.engine import Engine

from app.config import settings


def migrate_sqlite_legacy(engine: Engine) -> None:
    """Apply historical column/table fixes to a pre-Alembic campaign database."""
    url = str(engine.url)
    if not url.startswith("sqlite"):
        return
    with engine.begin() as conn:
        grupo_cols = {
            row[1]
            for row in conn.execute(text("PRAGMA table_info(grupo_posicao)")).fetchall()
        }
        if grupo_cols and "formato" not in grupo_cols:
            conn.execute(
                text(
                    "ALTER TABLE grupo_posicao ADD COLUMN formato VARCHAR(20) "
                    "NOT NULL DEFAULT 'bandeira'"
                )
            )

        local_cols = {
            row[1] for row in conn.execute(text("PRAGMA table_info(local)")).fetchall()
        }
        if local_cols and "cor_pin" not in local_cols:
            conn.execute(
                text(
                    "ALTER TABLE local ADD COLUMN cor_pin VARCHAR(7) "
                    "NOT NULL DEFAULT '#c4b5fd'"
                )
            )

        npc_cols = {row[1] for row in conn.execute(text("PRAGMA table_info(npc)")).fetchall()}
        if npc_cols and "tipo" not in npc_cols:
            conn.execute(
                text("ALTER TABLE npc ADD COLUMN tipo VARCHAR(10) NOT NULL DEFAULT 'npc'")
            )
        if npc_cols and "papel" not in npc_cols:
            conn.execute(text("ALTER TABLE npc ADD COLUMN papel VARCHAR(200)"))
        if npc_cols and "visivel_para_todos" not in npc_cols:
            conn.execute(
                text(
                    "ALTER TABLE npc ADD COLUMN visivel_para_todos BOOLEAN "
                    "NOT NULL DEFAULT 1"
                )
            )

        vinculo_cols = {
            row[1] for row in conn.execute(text("PRAGMA table_info(vinculo)")).fetchall()
        }
        if vinculo_cols and "tipo_ab" not in vinculo_cols and "tipo" in vinculo_cols:
            conn.execute(
                text(
                    """
                    CREATE TABLE vinculo_new (
                        id INTEGER PRIMARY KEY,
                        personagem_a_id INTEGER NOT NULL,
                        personagem_b_id INTEGER NOT NULL,
                        tipo_ab VARCHAR(20) NOT NULL,
                        tipo_ba VARCHAR(20),
                        nota_ab VARCHAR(500) NOT NULL DEFAULT '',
                        nota_ba VARCHAR(500) NOT NULL DEFAULT '',
                        publico BOOLEAN NOT NULL DEFAULT 0,
                        CONSTRAINT uq_vinculo_pair UNIQUE (personagem_a_id, personagem_b_id)
                    )
                    """
                )
            )
            conn.execute(
                text(
                    """
                    INSERT INTO vinculo_new (
                        id, personagem_a_id, personagem_b_id,
                        tipo_ab, tipo_ba, nota_ab, nota_ba, publico
                    )
                    SELECT
                        id, personagem_a_id, personagem_b_id,
                        tipo, NULL, COALESCE(nota, ''), '', COALESCE(publico, 0)
                    FROM vinculo
                    """
                )
            )
            conn.execute(text("DROP TABLE vinculo"))
            conn.execute(text("ALTER TABLE vinculo_new RENAME TO vinculo"))
            conn.execute(
                text(
                    "CREATE INDEX IF NOT EXISTS ix_vinculo_personagem_a_id "
                    "ON vinculo (personagem_a_id)"
                )
            )
            conn.execute(
                text(
                    "CREATE INDEX IF NOT EXISTS ix_vinculo_personagem_b_id "
                    "ON vinculo (personagem_b_id)"
                )
            )

        vinculo_cols = {
            row[1] for row in conn.execute(text("PRAGMA table_info(vinculo)")).fetchall()
        }
        if vinculo_cols and "conhecido_ab" not in vinculo_cols:
            conn.execute(
                text(
                    "ALTER TABLE vinculo ADD COLUMN conhecido_ab BOOLEAN NOT NULL DEFAULT 1"
                )
            )
        if vinculo_cols and "conhecido_ba" not in vinculo_cols:
            conn.execute(
                text(
                    "ALTER TABLE vinculo ADD COLUMN conhecido_ba BOOLEAN NOT NULL DEFAULT 1"
                )
            )
        if vinculo_cols and "qualificador" not in vinculo_cols:
            conn.execute(
                text(
                    "ALTER TABLE vinculo ADD COLUMN qualificador VARCHAR(80) "
                    "NOT NULL DEFAULT ''"
                )
            )
        if vinculo_cols and "direcao" not in vinculo_cols:
            conn.execute(text("ALTER TABLE vinculo ADD COLUMN direcao VARCHAR(20)"))

        vinculo_cols = {
            row[1] for row in conn.execute(text("PRAGMA table_info(vinculo)")).fetchall()
        }
        if vinculo_cols and "qualificador_ab" not in vinculo_cols:
            conn.execute(
                text(
                    "ALTER TABLE vinculo ADD COLUMN qualificador_ab VARCHAR(80) "
                    "NOT NULL DEFAULT ''"
                )
            )
        if vinculo_cols and "qualificador_ba" not in vinculo_cols:
            conn.execute(
                text(
                    "ALTER TABLE vinculo ADD COLUMN qualificador_ba VARCHAR(80) "
                    "NOT NULL DEFAULT ''"
                )
            )
        vinculo_cols = {
            row[1] for row in conn.execute(text("PRAGMA table_info(vinculo)")).fetchall()
        }
        if vinculo_cols and "qualificador" in vinculo_cols and "qualificador_ab" in vinculo_cols:
            conn.execute(
                text(
                    """
                    UPDATE vinculo SET
                        qualificador_ab = qualificador,
                        qualificador_ba = CASE
                            WHEN tipo_ba IS NOT NULL AND tipo_ba != tipo_ab THEN qualificador
                            ELSE ''
                        END
                    WHERE qualificador != ''
                    """
                )
            )

        npc_cols = {row[1] for row in conn.execute(text("PRAGMA table_info(npc)")).fetchall()}
        if npc_cols and "extensoes_mecanica" not in npc_cols:
            conn.execute(
                text(
                    "ALTER TABLE npc ADD COLUMN extensoes_mecanica TEXT NOT NULL DEFAULT '{}'"
                )
            )
            npc_cols = {
                row[1] for row in conn.execute(text("PRAGMA table_info(npc)")).fetchall()
            }

        if npc_cols and "fadiga" in npc_cols and "extensoes_mecanica" in npc_cols:
            conn.execute(
                text(
                    """
                    UPDATE npc
                    SET extensoes_mecanica = json_object('fadiga', fadiga)
                    WHERE fadiga IS NOT NULL
                      AND (extensoes_mecanica IS NULL OR extensoes_mecanica = '{}'
                           OR extensoes_mecanica = '')
                    """
                )
            )

        if (
            settings.migrate_drop_legacy_fadiga
            and npc_cols
            and "fadiga" in npc_cols
            and "extensoes_mecanica" in npc_cols
        ):
            conn.execute(text("ALTER TABLE npc DROP COLUMN fadiga"))
