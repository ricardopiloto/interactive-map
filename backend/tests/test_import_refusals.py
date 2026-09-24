from __future__ import annotations

import io
import json
import zipfile
from pathlib import Path

from sqlmodel import Session, select

from app.campaign_db import get_control_engine, resolve_campaign_session
from app.models.campanha import Campanha
from app.services.campaign_export import export_campaign_to_bytes
from app.services.campaign_import import import_campaign_from_bytes
from app.services.package_schema import (
    CONTEUDO_INVALIDO,
    CONTENT_FILENAME,
    ENTRADA_PROIBIDA,
    MANIFEST_FILENAME,
    PACOTE_INVALIDO,
    PackageError,
    SCHEMA_FUTURO,
    campaign_head_revision,
)
from tests.conftest import TEST_CAMPAIGN_SLUG, TEST_GM_EMAIL
from tests.helpers import seed_exportable_campaign


def _base_good_members() -> dict[str, bytes]:
    with resolve_campaign_session(TEST_CAMPAIGN_SLUG) as session:
        seed_exportable_campaign(session, slug=TEST_CAMPAIGN_SLUG)
    data = export_campaign_to_bytes(TEST_CAMPAIGN_SLUG)
    with zipfile.ZipFile(io.BytesIO(data)) as zf:
        return {n: zf.read(n) for n in zf.namelist()}


def _zip_from_members(members: dict[str, bytes]) -> bytes:
    buf = io.BytesIO()
    with zipfile.ZipFile(buf, "w") as zf:
        for name, payload in members.items():
            zf.writestr(name, payload)
    return buf.getvalue()


def test_refuse_missing_manifest(data_root) -> None:
    members = _base_good_members()
    del members[MANIFEST_FILENAME]
    before = len(list(Session(get_control_engine()).exec(select(Campanha)).all()))
    try:
        import_campaign_from_bytes(
            _zip_from_members(members),
            owner_email=TEST_GM_EMAIL,
            slug_override="bad-1",
        )
        raise AssertionError("expected PackageError")
    except PackageError as exc:
        assert exc.codigo in ("MANIFESTO_INVALIDO", PACOTE_INVALIDO)
    after = len(list(Session(get_control_engine()).exec(select(Campanha)).all()))
    assert after == before


def test_refuse_extra_db_entry(data_root) -> None:
    members = _base_good_members()
    members["campanha.db"] = b"SQLite format 3\x00"
    before = len(list(Session(get_control_engine()).exec(select(Campanha)).all()))
    try:
        import_campaign_from_bytes(
            _zip_from_members(members),
            owner_email=TEST_GM_EMAIL,
            slug_override="bad-db",
        )
        raise AssertionError("expected PackageError")
    except PackageError as exc:
        assert exc.codigo == ENTRADA_PROIBIDA
    assert len(list(Session(get_control_engine()).exec(select(Campanha)).all())) == before


def test_refuse_broken_fk(data_root) -> None:
    members = _base_good_members()
    content = json.loads(members[CONTENT_FILENAME])
    content["vinculos"].append(
        {
            "id": 999,
            "personagem_a_id": 99999,
            "personagem_b_id": 99998,
            "tipo_ab": "aliado",
            "publico": True,
            "conhecido_ab": True,
            "conhecido_ba": True,
            "nota_ab": "",
            "nota_ba": "",
            "qualificador_ab": "",
            "qualificador_ba": "",
        }
    )
    members[CONTENT_FILENAME] = json.dumps(content).encode()
    try:
        import_campaign_from_bytes(
            _zip_from_members(members),
            owner_email=TEST_GM_EMAIL,
            slug_override="bad-fk",
        )
        raise AssertionError("expected PackageError")
    except PackageError as exc:
        assert exc.codigo == CONTEUDO_INVALIDO


def test_refuse_missing_image(data_root) -> None:
    members = _base_good_members()
    # drop portrait but keep JSON reference
    members = {k: v for k, v in members.items() if k != "uploads/portraits/p1.png"}
    try:
        import_campaign_from_bytes(
            _zip_from_members(members),
            owner_email=TEST_GM_EMAIL,
            slug_override="bad-img",
        )
        raise AssertionError("expected PackageError")
    except PackageError as exc:
        assert exc.codigo == CONTEUDO_INVALIDO


def test_refuse_zip_slip(data_root) -> None:
    buf = io.BytesIO()
    with zipfile.ZipFile(buf, "w") as zf:
        zf.writestr("../etc/passwd", b"x")
        zf.writestr(MANIFEST_FILENAME, b"{}")
        zf.writestr(CONTENT_FILENAME, b"{}")
    try:
        import_campaign_from_bytes(
            buf.getvalue(),
            owner_email=TEST_GM_EMAIL,
            slug_override="bad-slip",
        )
        raise AssertionError("expected PackageError")
    except PackageError as exc:
        assert exc.codigo == ENTRADA_PROIBIDA


def test_refuse_raw_db_bytes(data_root) -> None:
    try:
        import_campaign_from_bytes(
            b"SQLite format 3\x00not-a-zip",
            owner_email=TEST_GM_EMAIL,
            slug_override="raw-db",
        )
        raise AssertionError("expected PackageError")
    except PackageError as exc:
        assert exc.codigo == PACOTE_INVALIDO


def test_mid_fail_cleanup(data_root, monkeypatch) -> None:
    members = _base_good_members()
    data = _zip_from_members(members)
    before = len(list(Session(get_control_engine()).exec(select(Campanha)).all()))
    sites_before = list((data_root / "campanhas").iterdir()) if (data_root / "campanhas").exists() else []

    def boom(*_a, **_k):
        raise RuntimeError("simulated")

    monkeypatch.setattr("app.services.campaign_import._insert_content", boom)
    try:
        import_campaign_from_bytes(
            data,
            owner_email=TEST_GM_EMAIL,
            slug_override="mid-fail",
        )
        raise AssertionError("expected failure")
    except RuntimeError:
        pass
    after = len(list(Session(get_control_engine()).exec(select(Campanha)).all()))
    assert after == before
    sites_after = list((data_root / "campanhas").iterdir()) if (data_root / "campanhas").exists() else []
    assert len(sites_after) == len(sites_before)
