from __future__ import annotations

from sqlmodel import Session, select

from app.campaign_db import get_control_engine
from app.cli import main
from app.models.campanha import Campanha
from tests.conftest import TEST_CAMPAIGN_SLUG, api


def _png(n: int = 100) -> bytes:
    return b"\x89PNG\r\n\x1a\n" + b"x" * n


def _set_cota(bytes_cap: int, used: int = 0) -> None:
    with Session(get_control_engine()) as ctrl:
        camp = ctrl.exec(select(Campanha).where(Campanha.slug == TEST_CAMPAIGN_SLUG)).one()
        camp.cota_bytes = bytes_cap
        camp.bytes_usados = used
        ctrl.add(camp)
        ctrl.commit()


def test_upload_under_cap_increments(client) -> None:
    _set_cota(10_000, 0)
    data = _png(200)
    r = client.post(
        api("/api/admin/uploads"),
        data={"category": "portraits"},
        files={"file": ("p.png", data, "image/png")},
    )
    assert r.status_code == 200, r.text
    body = r.json()
    assert body["bytes_usados"] == len(data)
    assert body["url"].startswith(f"/api/c/{TEST_CAMPAIGN_SLUG}/media/portraits/")


def test_upload_over_cap_rejected(client) -> None:
    _set_cota(50, 40)
    data = _png(20)
    r = client.post(
        api("/api/admin/uploads"),
        data={"category": "locals"},
        files={"file": ("l.png", data, "image/png")},
    )
    assert r.status_code == 413
    assert r.json()["detail"]["erro"] == "COTA_EXCEDIDA"
    with Session(get_control_engine()) as ctrl:
        camp = ctrl.exec(select(Campanha).where(Campanha.slug == TEST_CAMPAIGN_SLUG)).one()
        assert camp.bytes_usados == 40


def test_warning_at_90_percent(client) -> None:
    _set_cota(1000, 850)
    data = _png(60)  # 910/1000 = 91%
    r = client.post(
        api("/api/admin/uploads"),
        data={"category": "portraits"},
        files={"file": ("p.png", data, "image/png")},
    )
    assert r.status_code == 200
    assert r.json()["aviso_cota"] is True


def test_map_replace_net_delta_at_full(client) -> None:
    # Fill almost: upload map of 100 bytes with cota 100
    _set_cota(100, 0)
    first = client.post(
        api("/api/admin/uploads"),
        data={"category": "map"},
        files={"file": ("a.png", _png(90), "image/png")},
    )
    assert first.status_code == 200
    with Session(get_control_engine()) as ctrl:
        camp = ctrl.exec(select(Campanha).where(Campanha.slug == TEST_CAMPAIGN_SLUG)).one()
        camp.cota_bytes = camp.bytes_usados  # exactly full
        ctrl.add(camp)
        ctrl.commit()
        used = camp.bytes_usados
        prev = camp.mapa_arquivo

    # Smaller or equal replacement should succeed
    second = client.post(
        api("/api/admin/uploads"),
        data={"category": "map"},
        files={"file": ("b.png", _png(50), "image/png")},
    )
    assert second.status_code == 200, second.text
    with Session(get_control_engine()) as ctrl:
        camp = ctrl.exec(select(Campanha).where(Campanha.slug == TEST_CAMPAIGN_SLUG)).one()
        assert camp.mapa_arquivo != prev
        assert camp.bytes_usados == len(_png(50))


def test_map_replace_larger_rejected_at_full(client) -> None:
    _set_cota(200, 0)
    first = client.post(
        api("/api/admin/uploads"),
        data={"category": "map"},
        files={"file": ("a.png", _png(100), "image/png")},
    )
    assert first.status_code == 200
    size1 = first.json()["bytes_usados"]
    with Session(get_control_engine()) as ctrl:
        camp = ctrl.exec(select(Campanha).where(Campanha.slug == TEST_CAMPAIGN_SLUG)).one()
        camp.cota_bytes = size1
        ctrl.add(camp)
        ctrl.commit()
        prev = camp.mapa_arquivo

    bigger = client.post(
        api("/api/admin/uploads"),
        data={"category": "map"},
        files={"file": ("b.png", _png(180), "image/png")},
    )
    assert bigger.status_code == 413
    assert bigger.json()["detail"]["erro"] == "COTA_EXCEDIDA"
    with Session(get_control_engine()) as ctrl:
        camp = ctrl.exec(select(Campanha).where(Campanha.slug == TEST_CAMPAIGN_SLUG)).one()
        assert camp.mapa_arquivo == prev
        assert camp.bytes_usados == size1
