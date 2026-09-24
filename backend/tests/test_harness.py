from __future__ import annotations

from pathlib import Path

from tests.conftest import TEST_ADMIN_PASSWORD, TEST_ADMIN_USER, TEST_CAMPAIGN_SLUG


def test_health_ok(client) -> None:
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_engine_uses_campaign_layout_not_mapa_db(client, data_root: Path) -> None:
    from app.config import settings
    from sqlmodel import Session, select

    from app.campaign_db import get_control_engine
    from app.models.campanha import Campanha

    assert settings.campaign_slug is None  # HTTP uses path slug only
    assert "mapa.db" not in str(settings.data_dir)
    with Session(get_control_engine()) as ctrl:
        row = ctrl.exec(select(Campanha).where(Campanha.slug == TEST_CAMPAIGN_SLUG)).one()
        assert (data_root / row.caminho / "campanha.db").is_file()
    assert TEST_ADMIN_USER == "test-gm"
    assert TEST_ADMIN_PASSWORD == "test-secret"
