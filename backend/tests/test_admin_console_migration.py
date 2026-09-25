from __future__ import annotations

from alembic import command
from sqlalchemy import inspect
from sqlmodel import Session, select

from app.campaign_db import _alembic_config, campaign_db_path, get_control_engine, get_campaign_engine
from app.models.campanha import Campanha
from tests.conftest import TEST_CAMPAIGN_SLUG


def test_control_migration_007_upgrade_downgrade(data_root):
    engine = get_control_engine()
    command.downgrade(_alembic_config("control", str(engine.url)), "006_usuario_is_admin")
    assert "criado_em" not in {c["name"] for c in inspect(engine).get_columns("campanha")}
    command.upgrade(_alembic_config("control", str(engine.url)), "head")
    assert {"criado_em", "modificado_em"} <= {c["name"] for c in inspect(engine).get_columns("campanha")}
    command.downgrade(_alembic_config("control", str(engine.url)), "006_usuario_is_admin")
    command.upgrade(_alembic_config("control", str(engine.url)), "head")


def test_campaign_migration_006_upgrade_downgrade(data_root):
    with Session(get_control_engine()) as session:
        campaign = session.exec(select(Campanha).where(Campanha.slug == TEST_CAMPAIGN_SLUG)).one()
        engine = get_campaign_engine(campaign.caminho.split("/")[-1], campaign.caminho)
    config = _alembic_config("campaign", str(engine.url))
    command.downgrade(config, "005_evento_mes")
    assert "campaign_state" not in inspect(engine).get_table_names()
    command.upgrade(config, "head")
    assert "campaign_state" in inspect(engine).get_table_names()
    command.downgrade(config, "005_evento_mes")
    command.upgrade(config, "head")
