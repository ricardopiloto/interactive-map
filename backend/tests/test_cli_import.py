from __future__ import annotations

from pathlib import Path

from app.campaign_db import resolve_campaign_session
from app.cli import main
from app.models.campanha import Campanha
from sqlmodel import Session, select

from app.campaign_db import get_control_engine
from tests.conftest import TEST_CAMPAIGN_SLUG, TEST_GM_EMAIL
from tests.helpers import seed_exportable_campaign


def test_cli_importar(data_root, tmp_path: Path) -> None:
    with resolve_campaign_session(TEST_CAMPAIGN_SLUG) as session:
        seed_exportable_campaign(session, slug=TEST_CAMPAIGN_SLUG)
    out = tmp_path / "pack.zip"
    assert main(["campanha", "exportar", "--slug", TEST_CAMPAIGN_SLUG, "--out", str(out)]) == 0
    code = main(
        [
            "campanha",
            "importar",
            "--zip",
            str(out),
            "--email",
            TEST_GM_EMAIL,
            "--slug",
            "from-cli",
        ]
    )
    assert code == 0
    with Session(get_control_engine()) as session:
        assert session.exec(select(Campanha).where(Campanha.slug == "from-cli")).first()
