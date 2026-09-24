from __future__ import annotations

import io
import json
import zipfile

from app.campaign_db import resolve_campaign_session
from app.cli import _create_campanha
from app.services.campaign_export import export_campaign_to_bytes
from app.services.package_schema import CONTENT_FILENAME, MANIFEST_FILENAME, campaign_head_revision
from tests.conftest import TEST_CAMPAIGN_SLUG
from tests.helpers import seed_arco, seed_exportable_campaign, seed_personagem


def test_export_package_layout_and_isolation(client, data_root) -> None:
    with resolve_campaign_session(TEST_CAMPAIGN_SLUG) as session:
        catalog = seed_exportable_campaign(session, slug=TEST_CAMPAIGN_SLUG)
        arco_id = catalog.arco.id
        assert arco_id is not None

    _create_campanha(slug="mesa-b", nome="B", sistema="wod")
    with resolve_campaign_session("mesa-b") as session:
        seed_arco(session, titulo="So em B")
        seed_personagem(session, nome="So B")

    data = export_campaign_to_bytes(TEST_CAMPAIGN_SLUG)
    with zipfile.ZipFile(io.BytesIO(data)) as zf:
        names = set(zf.namelist())
        assert MANIFEST_FILENAME in names
        assert CONTENT_FILENAME in names
        assert "uploads/portraits/p1.png" in names
        assert "uploads/map/mapa1.webp" in names
        for n in names:
            assert not n.endswith(".db")
            assert n in (MANIFEST_FILENAME, CONTENT_FILENAME) or n.startswith("uploads/")

        manifest = json.loads(zf.read(MANIFEST_FILENAME))
        assert manifest["schema_version"] == campaign_head_revision()
        assert manifest["sistema"] == "wfrp4e"
        assert manifest["slug_origem"] == TEST_CAMPAIGN_SLUG
        assert "app_version" in manifest

        content = json.loads(zf.read(CONTENT_FILENAME))
        assert len(content["arcos"]) == 1
        assert content["arcos"][0]["id"] == arco_id
        assert all(a["titulo"] != "So em B" for a in content["arcos"])
        assert all(n["nome"] != "So B" for n in content["npcs"])
