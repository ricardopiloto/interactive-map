from __future__ import annotations

from pathlib import Path

from app.campaign_db import campaign_db_path, get_control_engine, init_control
from app.cli import _create_campanha, main
from app.models.campanha import Campanha
from sqlmodel import Session, select


def test_create_success(tmp_path, monkeypatch) -> None:
    from app.campaign_db import reset_engines
    from app.config import settings

    reset_engines()
    monkeypatch.setattr(settings, "data_dir", tmp_path / "data")
    row = _create_campanha(slug="mesa-alfa", nome="Alfa", sistema="wfrp4e")
    assert row.slug == "mesa-alfa"
    assert row.sistema == "wfrp4e"
    assert "fadiga" in row.modulos_ativos
    site = (tmp_path / "data" / row.caminho)
    assert (site / "campanha.db").is_file()
    assert (site / "uploads" / "map").is_dir()


def test_create_reserved_slug(tmp_path, monkeypatch) -> None:
    from app.campaign_db import reset_engines
    from app.config import settings
    from app.services.campanha_admin import CampanhaAdminError

    reset_engines()
    monkeypatch.setattr(settings, "data_dir", tmp_path / "data")
    try:
        _create_campanha(slug="api", nome="X", sistema="wfrp4e")
        raise AssertionError("expected error")
    except CampanhaAdminError as exc:
        assert exc.codigo == "SLUG_RESERVADO"
    assert not list((tmp_path / "data" / "campanhas").glob("*")) if (tmp_path / "data" / "campanhas").exists() else True


def test_create_duplicate_and_malformed(tmp_path, monkeypatch) -> None:
    from app.campaign_db import reset_engines
    from app.config import settings
    from app.services.campanha_admin import CampanhaAdminError

    reset_engines()
    monkeypatch.setattr(settings, "data_dir", tmp_path / "data")
    _create_campanha(slug="mesa-um", nome="Um", sistema="wfrp4e")
    try:
        _create_campanha(slug="mesa-um", nome="Dois", sistema="wod")
        raise AssertionError("expected duplicate")
    except CampanhaAdminError as exc:
        assert exc.codigo == "SLUG_DUPLICADO"
    try:
        _create_campanha(slug="Bad_Slug", nome="X", sistema="wfrp4e")
        raise AssertionError("expected invalid")
    except CampanhaAdminError as exc:
        assert exc.codigo == "SLUG_INVALIDO"


def test_cli_list_empty_and_two(tmp_path, monkeypatch, capsys) -> None:
    from app.campaign_db import reset_engines
    from app.config import settings

    reset_engines()
    monkeypatch.setattr(settings, "data_dir", tmp_path / "data")
    assert main(["campanha", "listar"]) == 0
    assert "(vazio)" in capsys.readouterr().out

    _create_campanha(slug="mesa-a", nome="A", sistema="wfrp4e")
    _create_campanha(slug="mesa-b", nome="B", sistema="wod")
    assert main(["campanha", "listar"]) == 0
    out = capsys.readouterr().out
    assert "mesa-a" in out and "mesa-b" in out
