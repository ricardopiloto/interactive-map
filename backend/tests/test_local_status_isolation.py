from __future__ import annotations

from app.campaign_db import reset_engines, resolve_campaign_session
from app.cli import _create_campanha
from app.models.local import Local


def test_local_status_with_same_id_is_isolated_between_campaigns(tmp_path, monkeypatch):
    from app.config import settings

    reset_engines()
    monkeypatch.setattr(settings, "data_dir", tmp_path / "data")
    estado_a = _create_campanha(slug="estado-a", nome="Estado A", sistema="wfrp4e").slug
    estado_b = _create_campanha(slug="estado-b", nome="Estado B", sistema="wfrp4e").slug

    for slug in (estado_a, estado_b):
        with resolve_campaign_session(slug) as session:
            session.add(Local(id=1, nome="Local", descricao="", x=0.2, y=0.3))
            session.commit()

    with resolve_campaign_session(estado_a) as session:
        local = session.get(Local, 1)
        assert local is not None and local.estado_exploracao == "conhecido"
        local.estado_exploracao = "visitado"
        session.add(local)
        session.commit()

    with resolve_campaign_session(estado_a) as session:
        assert session.get(Local, 1).estado_exploracao == "visitado"
    with resolve_campaign_session(estado_b) as session:
        assert session.get(Local, 1).estado_exploracao == "conhecido"
    reset_engines()
