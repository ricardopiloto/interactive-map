from __future__ import annotations

from app.campaign_db import reset_engines, resolve_campaign_session
from app.cli import _create_campanha
from app.config import settings
from app.models.grupo import GrupoPosicao
from app.models.local import Local
from app.models.campanha import Campanha
from sqlmodel import Session, select


def test_isolation_and_inactive(tmp_path, monkeypatch) -> None:
    reset_engines()
    monkeypatch.setattr(settings, "data_dir", tmp_path / "data")

    a = _create_campanha(slug="isola-a", nome="A", sistema="wfrp4e")
    b = _create_campanha(slug="isola-b", nome="B", sistema="wod")

    with resolve_campaign_session("isola-a") as sa:
        sa.add(Local(nome="SoEmA", descricao="", x=0.1, y=0.1))
        sa.add(GrupoPosicao(id=1, x=0.2, y=0.3, formato="bandeira"))
        sa.commit()

    with resolve_campaign_session("isola-b") as sb:
        sb.add(GrupoPosicao(id=1, x=0.8, y=0.9, formato="brasao"))
        sb.commit()
        nomes = [loc.nome for loc in sb.exec(select(Local)).all()]
        assert "SoEmA" not in nomes
        grupo_b = sb.get(GrupoPosicao, 1)
        assert grupo_b is not None
        assert grupo_b.x == 0.8

    with resolve_campaign_session("isola-a") as sa2:
        nomes_a = [loc.nome for loc in sa2.exec(select(Local)).all()]
        assert "SoEmA" in nomes_a
        grupo_a = sa2.get(GrupoPosicao, 1)
        assert grupo_a is not None
        assert grupo_a.x == 0.2

    # A → B → A again
    with resolve_campaign_session("isola-b") as sb2:
        assert sb2.exec(select(Local)).all() == []
    with resolve_campaign_session("isola-a") as sa3:
        assert any(loc.nome == "SoEmA" for loc in sa3.exec(select(Local)).all())

    from app.campaign_db import get_control_engine
    from app.errors import raise_api_error
    from fastapi import HTTPException

    with Session(get_control_engine()) as ctrl:
        row = ctrl.exec(select(Campanha).where(Campanha.slug == "isola-b")).one()
        row.activa = False
        ctrl.add(row)
        ctrl.commit()

    try:
        with resolve_campaign_session("isola-b"):
            pass
        raise AssertionError("expected inactive")
    except HTTPException as exc:
        assert exc.detail["erro"] == "CAMPANHA_NAO_ENCONTRADA"

    assert a.slug and b.slug
