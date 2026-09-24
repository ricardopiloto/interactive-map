from __future__ import annotations

from sqlmodel import Session, select

from app.campaign_db import get_control_engine
from app.cli import main
from app.models.usuario import Usuario
from tests.conftest import TEST_GM_EMAIL


def test_promover_e_rebaixar_admin(data_root, capsys) -> None:
    assert main(["usuario", "promover-admin", "--email", TEST_GM_EMAIL]) == 0
    assert f"OK admin={TEST_GM_EMAIL}" in capsys.readouterr().out
    with Session(get_control_engine()) as session:
        user = session.exec(select(Usuario).where(Usuario.email == TEST_GM_EMAIL)).one()
        assert user.is_admin is True

    assert main(["usuario", "rebaixar-admin", "--email", TEST_GM_EMAIL]) == 0
    assert f"OK removido admin={TEST_GM_EMAIL}" in capsys.readouterr().out
    with Session(get_control_engine()) as session:
        user = session.exec(select(Usuario).where(Usuario.email == TEST_GM_EMAIL)).one()
        assert user.is_admin is False


def test_promover_admin_usuario_nao_encontrado(data_root, capsys) -> None:
    code = main(["usuario", "promover-admin", "--email", "inexistente@teste.local"])
    assert code == 1
    assert "USUARIO_NAO_ENCONTRADO" in capsys.readouterr().err


def test_promover_admin_usuario_inactivo(data_root, capsys) -> None:
    assert main(["usuario", "criar", "--email", "pendente@teste.local"]) == 0
    code = main(["usuario", "promover-admin", "--email", "pendente@teste.local"])
    assert code == 1
    assert "USUARIO_INACTIVO" in capsys.readouterr().err
