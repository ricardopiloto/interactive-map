from __future__ import annotations

import zipfile
from pathlib import Path

from app.campaign_db import resolve_campaign_session
from app.cli import main
from app.services.package_schema import CONTENT_FILENAME, MANIFEST_FILENAME
from tests.conftest import TEST_CAMPAIGN_SLUG
from tests.helpers import seed_exportable_campaign


def test_cli_exportar(data_root, tmp_path: Path) -> None:
    with resolve_campaign_session(TEST_CAMPAIGN_SLUG) as session:
        seed_exportable_campaign(session, slug=TEST_CAMPAIGN_SLUG)
    out = tmp_path / "a.zip"
    code = main(["campanha", "exportar", "--slug", TEST_CAMPAIGN_SLUG, "--out", str(out)])
    assert code == 0
    assert out.is_file()
    with zipfile.ZipFile(out) as zf:
        assert MANIFEST_FILENAME in zf.namelist()
        assert CONTENT_FILENAME in zf.namelist()
