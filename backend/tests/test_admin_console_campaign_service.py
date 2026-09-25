from __future__ import annotations

from pathlib import Path

import pytest
from sqlmodel import select

from app.models.campanha import Campanha
from app.services.admin_console import (
    AdminConsoleError,
    delete_campaign,
    list_campaigns,
    reconcile_campaign_deletions,
    set_campaign_active,
    transfer_campaign_owner,
)
from app.services.auth_admin import create_usuario_with_invite
from app.services.auth_invite import accept_activate_invite
from tests.conftest import TEST_CAMPAIGN_SLUG, TEST_GM_EMAIL


def test_filter_and_lifecycle_metadata(control_session, data_root):
    rows = list_campaigns(control_session, q="suite", estado="ativa")
    assert len(rows) == 1
    assert rows[0]["slug"] == TEST_CAMPAIGN_SLUG
    assert rows[0]["criado_em"] is not None
    result = set_campaign_active(control_session, rows[0]["id"], False)
    assert result["activa"] is False
    assert result["visibilidade"] == "listada"


def test_transfer_owner_requires_active_user_and_is_atomic(control_session, data_root):
    user, invite = create_usuario_with_invite(control_session, "new-owner@example.org")
    accept_activate_invite(control_session, invite, "strong-password")
    campaign = control_session.exec(select(Campanha).where(Campanha.slug == TEST_CAMPAIGN_SLUG)).one()
    result = transfer_campaign_owner(control_session, campaign.id, user.email)
    assert result["proprietario"]["email"] == user.email


def test_delete_campaign_only_removes_target_and_sibling_survives(control_session, data_root):
    import uuid
    from app.services.campanha_admin import create_campanha
    from app.services.auth_admin import assign_owner

    sibling = create_campanha(slug=f"sibling-{uuid.uuid4().hex[:8]}", nome="Sibling", sistema="wfrp4e")
    assign_owner(control_session, sibling.slug, TEST_GM_EMAIL)
    selected = control_session.exec(select(Campanha).where(Campanha.slug == TEST_CAMPAIGN_SLUG)).one()
    selected_path = Path(data_root) / selected.caminho
    sibling_path = Path(data_root) / sibling.caminho
    delete_campaign(control_session, selected.id)
    assert not selected_path.exists()
    assert sibling_path.exists()
    assert control_session.get(Campanha, selected.id) is None
    assert control_session.get(Campanha, sibling.id) is not None


def test_delete_rejects_path_outside_campaign_root(control_session, data_root):
    campaign = control_session.exec(select(Campanha).where(Campanha.slug == TEST_CAMPAIGN_SLUG)).one()
    actual_path = campaign.caminho
    campaign.caminho = "../outside"
    control_session.add(campaign)
    control_session.commit()
    with pytest.raises(AdminConsoleError, match="CAMINHO_CAMPANHA_INVALIDO"):
        delete_campaign(control_session, campaign.id)
    campaign.caminho = actual_path
    control_session.add(campaign)
    control_session.commit()


def test_reconcile_restores_directory_for_existing_inactive_row(control_session, data_root):
    campaign = control_session.exec(select(Campanha).where(Campanha.slug == TEST_CAMPAIGN_SLUG)).one()
    source = Path(data_root) / campaign.caminho
    trash = Path(data_root) / ".admin-trash"
    trash.mkdir(exist_ok=True)
    staged = trash / f"{campaign.id}-{source.name}"
    source.rename(staged)
    reconcile_campaign_deletions()
    assert source.exists()
    assert not staged.exists()
