from __future__ import annotations

from datetime import datetime

from sqlmodel import Session, select

from app.campaign_db import get_control_engine
from app.cli import main
from app.models.campanha import Campanha
from app.models.usuario import Membro, Usuario
from app.services.auth_password import hash_password
from tests.conftest import TEST_CAMPAIGN_SLUG, TEST_GM_EMAIL


def test_usuario_criar_prints_convite_path(data_root, capsys) -> None:
    code = main(["usuario", "criar", "--email", "novo@teste.local"])
    assert code == 0
    out = capsys.readouterr().out.strip()
    assert out.startswith("http://localhost:5173/convite/")


def test_usuario_criar_duplicate_email(data_root, capsys) -> None:
    assert main(["usuario", "criar", "--email", "dup@teste.local"]) == 0
    code = main(["usuario", "criar", "--email", "Dup@teste.local"])
    assert code == 1
    assert "EMAIL_DUPLICADO" in capsys.readouterr().err


def test_usuario_reset_and_desactivar(data_root, capsys) -> None:
    assert main(["usuario", "reset", "--email", TEST_GM_EMAIL]) == 0
    assert "/reset/" in capsys.readouterr().out
    assert main(["usuario", "desactivar", "--email", TEST_GM_EMAIL]) == 0
    assert "OK desactivado" in capsys.readouterr().out


def test_campanha_atribuir_dono_replaces(data_root) -> None:
    with Session(get_control_engine()) as session:
        u2 = Usuario(
            email="dono2@teste.local",
            senha_hash=hash_password("password99"),
            activo=True,
            criado_em=datetime.utcnow(),
            actualizado_em=datetime.utcnow(),
        )
        session.add(u2)
        session.commit()
        session.refresh(u2)
        u2_id = u2.id

    assert (
        main(
            [
                "campanha",
                "atribuir-dono",
                "--slug",
                TEST_CAMPAIGN_SLUG,
                "--email",
                "dono2@teste.local",
            ]
        )
        == 0
    )
    with Session(get_control_engine()) as session:
        camp = session.exec(select(Campanha).where(Campanha.slug == TEST_CAMPAIGN_SLUG)).one()
        members = list(session.exec(select(Membro).where(Membro.campanha_id == camp.id)).all())
        assert len(members) == 1
        assert members[0].usuario_id == u2_id
        assert members[0].papel == "dono"
