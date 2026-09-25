from __future__ import annotations

import sqlite3

from alembic import command
from sqlalchemy import inspect, text
from sqlmodel import Session, select

from app.campaign_db import _alembic_config, get_campaign_engine, get_control_engine
from app.models.campanha import Campanha
from app.models.local import Local
from tests.conftest import TEST_CAMPAIGN_SLUG


def test_campaign_migration_backfills_exploration_state(data_root):
    with Session(get_control_engine()) as session:
        campaign = session.exec(select(Campanha).where(Campanha.slug == TEST_CAMPAIGN_SLUG)).one()
        engine = get_campaign_engine(campaign.caminho.split("/")[-1], campaign.caminho)

    config = _alembic_config("campaign", str(engine.url))
    command.downgrade(config, "006_campaign_state")
    with engine.begin() as connection:
        connection.execute(text("DELETE FROM local"))
        connection.execute(
            text(
                "INSERT INTO local (id, nome, descricao, x, y, data_sessao, cor_pin, visivel_para_todos) "
                "VALUES (:id, :nome, '', 0.2, 0.3, :data_sessao, '#c4b5fd', 1)"
            ),
            [
                {"id": 901, "nome": "Nulo", "data_sessao": None},
                {"id": 902, "nome": "Vazio", "data_sessao": ""},
                {"id": 903, "nome": "Espacos", "data_sessao": "   "},
                {"id": 904, "nome": "Preenchido", "data_sessao": "Sessão 9"},
            ],
        )

    command.upgrade(config, "head")
    with Session(engine) as session:
        states = {row.id: row.estado_exploracao for row in session.exec(select(Local)).all()}
        labels = {row.id: row.data_sessao for row in session.exec(select(Local)).all()}
    assert states == {901: "conhecido", 902: "conhecido", 903: "conhecido", 904: "visitado"}
    assert labels == {901: None, 902: "", 903: "   ", 904: "Sessão 9"}
    assert "estado_exploracao" in {column["name"] for column in inspect(engine).get_columns("local")}
