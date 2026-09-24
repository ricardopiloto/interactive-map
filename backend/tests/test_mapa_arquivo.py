from __future__ import annotations

from io import BytesIO
from pathlib import Path

from sqlmodel import Session, select

from app.campaign_db import campaign_uploads_path, get_control_engine
from app.models.campanha import Campanha
from tests.conftest import TEST_CAMPAIGN_SLUG, api


def _png() -> bytes:
    return b"\x89PNG\r\n\x1a\n" + b"x" * 64


def test_map_upload_sets_mapa_arquivo(client) -> None:
    r = client.post(
        api("/api/admin/uploads"),
        data={"category": "map"},
        files={"file": ("m.png", _png(), "image/png")},
    )
    assert r.status_code == 200, r.text
    body = r.json()
    assert body["url"].startswith(f"/api/c/{TEST_CAMPAIGN_SLUG}/media/map/")
    assert "campaign-map" not in body["url"]

    with Session(get_control_engine()) as ctrl:
        camp = ctrl.exec(select(Campanha).where(Campanha.slug == TEST_CAMPAIGN_SLUG)).one()
        assert camp.mapa_arquivo
        assert camp.mapa_arquivo in body["url"]

    cfg = client.get(api("/api/config")).json()
    assert cfg["has_map_image"] is True
    assert cfg["mapa_arquivo"] == Path(body["url"]).name
    assert cfg["map_url"] == body["url"]


def test_has_map_image_ignores_orphans_without_field(client) -> None:
    with Session(get_control_engine()) as ctrl:
        camp = ctrl.exec(select(Campanha).where(Campanha.slug == TEST_CAMPAIGN_SLUG)).one()
        camp.mapa_arquivo = ""
        ctrl.add(camp)
        ctrl.commit()
        uploads = campaign_uploads_path(camp.caminho)
        (uploads / "map").mkdir(parents=True, exist_ok=True)
        (uploads / "map" / "orphan.png").write_bytes(_png())

    cfg = client.get(api("/api/config")).json()
    assert cfg["has_map_image"] is False


def test_ponte_campaign_map(client) -> None:
    with Session(get_control_engine()) as ctrl:
        camp = ctrl.exec(select(Campanha).where(Campanha.slug == TEST_CAMPAIGN_SLUG)).one()
        camp.mapa_arquivo = ""
        ctrl.add(camp)
        ctrl.commit()
        uploads = campaign_uploads_path(camp.caminho)
        map_dir = uploads / "map"
        map_dir.mkdir(parents=True, exist_ok=True)
        (map_dir / "campaign-map.webp").write_bytes(_png())

    cfg = client.get(api("/api/config")).json()
    assert cfg["has_map_image"] is True
    assert cfg["mapa_arquivo"] == "campaign-map.webp"

    with Session(get_control_engine()) as ctrl:
        camp = ctrl.exec(select(Campanha).where(Campanha.slug == TEST_CAMPAIGN_SLUG)).one()
        assert camp.mapa_arquivo == "campaign-map.webp"


def test_uploads_static_is_404(client_anon) -> None:
    assert client_anon.get(f"/uploads/c/{TEST_CAMPAIGN_SLUG}/map/x.png").status_code == 404
    assert client_anon.get("/uploads/map/x.png").status_code == 404


def test_anonymous_gets_map_via_media(client, client_anon) -> None:
    up = client.post(
        api("/api/admin/uploads"),
        data={"category": "map"},
        files={"file": ("m.png", _png(), "image/png")},
    )
    assert up.status_code == 200
    url = up.json()["url"]
    assert client_anon.get(url).status_code == 200
    assert "immutable" in client_anon.get(url).headers.get("cache-control", "").lower()
