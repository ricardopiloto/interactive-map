from __future__ import annotations

from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

from alembic import command
from sqlalchemy import inspect, text
from sqlmodel import Session

from app.campaign_db import (
    _alembic_config,
    _alembic_current_revision,
    _campaign_head_revision,
    ensure_campaign_schema,
    get_campaign_engine,
    lookup_campanha,
)
from tests.conftest import TEST_CAMPAIGN_SLUG


def test_sessao_tables_exist_after_schema(client) -> None:
    _ = client
    camp = lookup_campanha(TEST_CAMPAIGN_SLUG)
    uuid_key = __import__("pathlib").Path(camp.caminho).name
    engine = get_campaign_engine(uuid_key, camp.caminho)
    ensure_campaign_schema(engine, fresh=False)
    insp = inspect(engine)
    names = set(insp.get_table_names())
    assert "sessao" in names
    assert "sessao_local" in names
    assert "sessao_npc" in names
    uniques = {tuple(u["column_names"]) for u in insp.get_unique_constraints("sessao")}
    indexes = {tuple(i["column_names"]) for i in insp.get_indexes("sessao") if i.get("unique")}
    assert ("numero",) in uniques or ("numero",) in indexes


def test_ensure_schema_concorrente_nao_perde_o_proxy_do_alembic(client) -> None:
    """Several endpoints open a campaign at once. Alembic's context is process-global."""
    _ = client
    camp = lookup_campanha(TEST_CAMPAIGN_SLUG)
    engine = get_campaign_engine(Path(camp.caminho).name, camp.caminho)
    config = _alembic_config("campaign", str(engine.url))
    command.downgrade(config, "009_item")
    assert _alembic_current_revision(engine) == "009_item"

    def upgrade() -> None:
        ensure_campaign_schema(engine, fresh=False)

    with ThreadPoolExecutor(max_workers=6) as pool:
        list(pool.map(lambda _: upgrade(), range(6)))

    assert _alembic_current_revision(engine) == _campaign_head_revision()
    assert "capitulo" in set(inspect(engine).get_table_names())


def test_sessao_numero_unique_enforced(client, db_session: Session) -> None:
    _ = client
    db_session.execute(
        text("INSERT INTO sessao (numero, titulo, resumo, visivel_para_todos) VALUES (1, 'A', '', 1)")
    )
    db_session.commit()
    raised = False
    try:
        db_session.execute(
            text("INSERT INTO sessao (numero, titulo, resumo, visivel_para_todos) VALUES (1, 'B', '', 1)")
        )
        db_session.commit()
    except Exception:
        raised = True
        db_session.rollback()
    assert raised
