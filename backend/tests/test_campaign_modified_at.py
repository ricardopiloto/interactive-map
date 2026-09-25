from __future__ import annotations

from sqlalchemy import text
from sqlmodel import Session, select

from app.campaign_db import get_campaign_engine, get_control_engine, resolve_campaign_session
from app.models.campaign_state import CampaignState
from app.models.campanha import Campanha
from app.models.local import Local
from app.services.campanha_admin import set_visibilidade
from tests.conftest import TEST_CAMPAIGN_SLUG


def test_campaign_write_timestamp_is_atomic_with_commit(data_root):
    with Session(get_control_engine()) as control:
        campaign = control.exec(select(Campanha).where(Campanha.slug == TEST_CAMPAIGN_SLUG)).one()
        engine = get_campaign_engine(campaign.caminho.split("/")[-1], campaign.caminho)
    with resolve_campaign_session(TEST_CAMPAIGN_SLUG) as session:
        session.add(Local(nome="timestamp", x=0.5, y=0.5))
        session.commit()
    with engine.connect() as connection:
        value = connection.execute(text("SELECT modificado_em FROM campaign_state WHERE id = 1")).scalar_one()
    assert value is not None


def test_campaign_timestamp_rolls_back_and_reads_do_not_change_it(data_root):
    with Session(get_control_engine()) as control:
        campaign = control.exec(select(Campanha).where(Campanha.slug == TEST_CAMPAIGN_SLUG)).one()
        engine = get_campaign_engine(campaign.caminho.split("/")[-1], campaign.caminho)
    with resolve_campaign_session(TEST_CAMPAIGN_SLUG) as session:
        session.add(Local(nome="rollback", x=0.1, y=0.1))
        session.flush()
        session.rollback()
    with resolve_campaign_session(TEST_CAMPAIGN_SLUG) as session:
        session.exec(select(Local)).all()
    # Reading without a prior committed write leaves the singleton timestamp empty.
    with Session(engine) as session:
        state = session.get(CampaignState, 1)
    assert state is None or state.modificado_em is None


def test_legacy_campaign_without_timestamp_is_unknown(data_root):
    with Session(get_control_engine()) as session:
        campaign = session.exec(select(Campanha).where(Campanha.slug == TEST_CAMPAIGN_SLUG)).one()
        campaign.criado_em = None
        campaign.modificado_em = None
        session.add(campaign)
        session.commit()
        assert campaign.criado_em is None
        assert campaign.modificado_em is None


def test_campaign_settings_update_registry_timestamp(data_root):
    before = set_visibilidade(TEST_CAMPAIGN_SLUG, "so_link")
    assert before.modificado_em is not None
