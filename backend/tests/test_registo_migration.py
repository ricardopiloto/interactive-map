from alembic import command
from sqlalchemy import inspect, text

from app.campaign_db import _alembic_config, get_control_engine


def test_migration_009_quota_canonical_and_downgrade(data_root):
    engine = get_control_engine()
    config = _alembic_config("control", str(engine.url))
    command.downgrade(config, "008_remove_genero")
    with engine.begin() as conn:
        conn.execute(text("UPDATE campanha SET cota_bytes = 10737418240, bytes_usados = 400000000"))
        conn.execute(text("UPDATE usuario SET email = 'F.o.o+test@GoogleMail.COM' WHERE id = (SELECT MIN(id) FROM usuario)"))
    command.upgrade(config, "009_registo_cota")
    with engine.connect() as conn:
        assert all(r[0] == 314572800 for r in conn.execute(text("SELECT cota_bytes FROM campanha")))
        assert conn.execute(text("SELECT email_canonico FROM usuario ORDER BY id LIMIT 1")).scalar() == "foo@gmail.com"
    assert {"email_canonico", "termos_aceitos_em"} <= {c["name"] for c in inspect(engine).get_columns("usuario")}
    assert "ix_usuario_email_canonico" in {i["name"] for i in inspect(engine).get_indexes("usuario")}
    command.downgrade(config, "008_remove_genero")
    assert "email_canonico" not in {c["name"] for c in inspect(engine).get_columns("usuario")}
    command.upgrade(config, "head")
