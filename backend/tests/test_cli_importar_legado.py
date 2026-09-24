from __future__ import annotations

import json
from pathlib import Path

from sqlmodel import Session, select

from app.campaign_db import get_control_engine, resolve_campaign_session
from app.cli import main
from app.models.campanha import Campanha
from app.models.npc import NPC
from app.models.usuario import Membro
from app.services.legacy_import import count_sqlite_tables, hash_tree
from tests.conftest import TEST_GM_EMAIL
from tests.legado_helpers import build_legacy_tree, build_wfrp_tree


def _import_args(origem: Path, slug: str, **extra: str) -> list[str]:
    args = [
        "campanha",
        "importar-legado",
        "--origem",
        str(origem),
        "--slug",
        slug,
        "--sistema",
        extra.get("sistema", "wfrp4e"),
        "--nome",
        extra.get("nome", "WFRP"),
        "--email",
        extra.get("email", TEST_GM_EMAIL),
    ]
    if "cota" in extra:
        args.extend(["--cota-bytes", extra["cota"]])
    if "relatorio" in extra:
        args.extend(["--relatorio", extra["relatorio"]])
    return args


def test_importar_legado_happy_path(data_root, tmp_path: Path) -> None:
    origin = build_wfrp_tree(tmp_path / "wfrp")
    before = hash_tree(origin)
    rel = tmp_path / "rel.json"
    code = main(_import_args(origin, "wfrp", relatorio=str(rel)))
    assert code == 0
    assert hash_tree(origin) == before
    with Session(get_control_engine()) as session:
        camp = session.exec(select(Campanha).where(Campanha.slug == "wfrp")).one()
        dono = session.exec(
            select(Membro).where(Membro.campanha_id == camp.id, Membro.papel == "dono")
        ).first()
        assert dono is not None
        assert camp.mapa_arquivo == "campaign-map.webp"
    with resolve_campaign_session("wfrp") as session:
        npc = session.exec(select(NPC).where(NPC.id == 1)).one()
        assert npc.retrato_url == "/api/c/wfrp/media/portraits/p-wfrp-1.webp"
    payload = json.loads(rel.read_text(encoding="utf-8"))
    assert payload["resultado"] == "PASS"
    assert payload["origem_intacta"] is True
    assert payload["tabelas"]["npc"]["antes"] == payload["tabelas"]["npc"]["depois"]
    assert payload["ficheiros_uploads"]["antes"] == payload["ficheiros_uploads"]["depois"]
    assert payload["alembic_destino"]


def test_origem_invalida_zip_db_missing(data_root, tmp_path: Path, capsys) -> None:
    z = tmp_path / "x.zip"
    z.write_bytes(b"PK\x03\x04")
    assert main(_import_args(z, "bad-zip")) == 1
    assert "ORIGEM_INVALIDA" in capsys.readouterr().err

    db = tmp_path / "solo.db"
    db.write_bytes(b"sqlite")
    assert main(_import_args(db, "bad-db")) == 1
    assert "ORIGEM_INVALIDA" in capsys.readouterr().err

    empty = tmp_path / "empty"
    empty.mkdir()
    (empty / "uploads").mkdir()
    assert main(_import_args(empty, "no-db")) == 1
    assert "ORIGEM_INVALIDA" in capsys.readouterr().err

    only_db = tmp_path / "onlydb"
    only_db.mkdir()
    (only_db / "mapa.db").write_bytes(b"x")
    assert main(_import_args(only_db, "no-up")) == 1
    assert "ORIGEM_INVALIDA" in capsys.readouterr().err

    with Session(get_control_engine()) as session:
        assert session.exec(select(Campanha).where(Campanha.slug == "bad-zip")).first() is None


def test_slug_user_cota_unknown_url(data_root, tmp_path: Path, capsys) -> None:
    origin = build_wfrp_tree(tmp_path / "wfrp")
    assert main(_import_args(origin, "wfrp")) == 0
    assert main(_import_args(origin, "wfrp")) == 1
    assert "SLUG_DUPLICADO" in capsys.readouterr().err

    origin2 = build_wfrp_tree(tmp_path / "wfrp2")
    assert main(_import_args(origin2, "outra", email="nao@existe.local")) == 1
    assert "USUARIO_NAO_ENCONTRADO" in capsys.readouterr().err

    origin3 = build_wfrp_tree(tmp_path / "wfrp3")
    assert main(_import_args(origin3, "cota", cota="1")) == 1
    assert "COTA_EXCEDIDA" in capsys.readouterr().err
    with Session(get_control_engine()) as session:
        assert session.exec(select(Campanha).where(Campanha.slug == "cota")).first() is None

    weird = build_legacy_tree(tmp_path / "weird", n_locais=1, n_npcs=1, prefix="w")
    import sqlite3

    conn = sqlite3.connect(weird / "mapa.db")
    conn.execute("UPDATE npc SET retrato_url='/uploads/weird/x.webp'")
    conn.commit()
    conn.close()
    assert main(_import_args(weird, "url-bad")) == 1
    assert "URL_MIDIA_DESCONHECIDA" in capsys.readouterr().err


def test_relatorio_contagem_divergente(data_root, tmp_path: Path, monkeypatch, capsys) -> None:
    origin = build_wfrp_tree(tmp_path / "wfrp")
    rel = tmp_path / "fail.json"
    real = count_sqlite_tables
    n = {"i": 0}

    def wrapped(path: Path) -> dict[str, int]:
        n["i"] += 1
        result = real(path)
        if n["i"] >= 2:
            return {**result, "npc": result["npc"] + 7}
        return result

    monkeypatch.setattr("app.services.legacy_import.count_sqlite_tables", wrapped)
    assert main(_import_args(origin, "wfrp", relatorio=str(rel))) == 1
    err = capsys.readouterr().err
    assert "CONTAGEM_DIVERGENTE" in err
    payload = json.loads(rel.read_text(encoding="utf-8"))
    assert payload["resultado"] == "FAIL"
    with Session(get_control_engine()) as session:
        assert session.exec(select(Campanha).where(Campanha.slug == "wfrp")).first() is None


def test_origem_readonly(data_root, tmp_path: Path) -> None:
    origin = build_wfrp_tree(tmp_path / "ro")
    before = hash_tree(origin)
    for p in origin.rglob("*"):
        if p.is_file():
            p.chmod(0o444)
        else:
            p.chmod(0o555)
    origin.chmod(0o555)
    try:
        assert main(_import_args(origin, "ro-slug")) == 0
        assert hash_tree(origin) == before
    finally:
        origin.chmod(0o755)
        for p in origin.rglob("*"):
            p.chmod(0o755 if p.is_dir() else 0o644)
