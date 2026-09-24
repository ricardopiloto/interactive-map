from __future__ import annotations

from sqlmodel import Session, select

from app.campaign_db import campaign_uploads_path, get_control_engine
from app.cli import main
from app.models.campanha import Campanha
from tests.conftest import TEST_CAMPAIGN_SLUG


def test_reconciliar_cota(data_root, capsys) -> None:
    with Session(get_control_engine()) as ctrl:
        camp = ctrl.exec(select(Campanha).where(Campanha.slug == TEST_CAMPAIGN_SLUG)).one()
        camp.bytes_usados = 99999
        ctrl.add(camp)
        ctrl.commit()
        uploads = campaign_uploads_path(camp.caminho)
        (uploads / "locals").mkdir(parents=True, exist_ok=True)
        f = uploads / "locals" / "a.bin"
        f.write_bytes(b"hello-world")

    assert main(["campanha", "reconciliar-cota", "--slug", TEST_CAMPAIGN_SLUG]) == 0
    out = capsys.readouterr().out
    assert "bytes_usados=11" in out

    with Session(get_control_engine()) as ctrl:
        camp = ctrl.exec(select(Campanha).where(Campanha.slug == TEST_CAMPAIGN_SLUG)).one()
        assert camp.bytes_usados == 11
