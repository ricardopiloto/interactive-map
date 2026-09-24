from __future__ import annotations

import io
import json
import zipfile

from sqlmodel import Session, select

from app.campaign_db import get_control_engine, resolve_campaign_session
from app.models.arco import Arco
from app.models.campanha import Campanha
from app.services.campaign_export import export_campaign_to_bytes
from app.services.campaign_import import import_campaign_from_bytes
from app.services.package_schema import (
    CONTENT_FILENAME,
    MANIFEST_FILENAME,
    PackageError,
    SCHEMA_FUTURO,
    campaign_head_revision,
)
from tests.conftest import TEST_CAMPAIGN_SLUG, TEST_GM_EMAIL
from tests.helpers import seed_exportable_campaign


def _members() -> dict[str, bytes]:
    with resolve_campaign_session(TEST_CAMPAIGN_SLUG) as session:
        seed_exportable_campaign(session, slug=TEST_CAMPAIGN_SLUG)
    data = export_campaign_to_bytes(TEST_CAMPAIGN_SLUG)
    with zipfile.ZipFile(io.BytesIO(data)) as zf:
        return {n: zf.read(n) for n in zf.namelist()}


def _zip(members: dict[str, bytes]) -> bytes:
    buf = io.BytesIO()
    with zipfile.ZipFile(buf, "w") as zf:
        for k, v in members.items():
            zf.writestr(k, v)
    return buf.getvalue()


def test_schema_future_refused(data_root) -> None:
    members = _members()
    manifest = json.loads(members[MANIFEST_FILENAME])
    manifest["schema_version"] = "999_future"
    members[MANIFEST_FILENAME] = json.dumps(manifest).encode()
    before = len(list(Session(get_control_engine()).exec(select(Campanha)).all()))
    try:
        import_campaign_from_bytes(
            _zip(members),
            owner_email=TEST_GM_EMAIL,
            slug_override="future-x",
        )
        raise AssertionError("expected PackageError")
    except PackageError as exc:
        assert exc.codigo == SCHEMA_FUTURO
    assert len(list(Session(get_control_engine()).exec(select(Campanha)).all())) == before


def test_schema_old_migrated(data_root) -> None:
    members = _members()
    manifest = json.loads(members[MANIFEST_FILENAME])
    manifest["schema_version"] = "000_pre"
    members[MANIFEST_FILENAME] = json.dumps(manifest).encode()
    camp = import_campaign_from_bytes(
        _zip(members),
        owner_email=TEST_GM_EMAIL,
        slug_override="old-schema",
    )
    assert camp.sistema == "wfrp4e"
    assert camp.slug == "old-schema"
    with resolve_campaign_session("old-schema") as session:
        assert len(list(session.exec(select(Arco)).all())) == 1
