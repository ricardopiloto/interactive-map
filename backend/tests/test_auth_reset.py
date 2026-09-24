from __future__ import annotations

from app.cli import main
from tests.conftest import TEST_GM_EMAIL, TEST_GM_PASSWORD, TEST_ORIGIN, login_as


def test_reset_confirms_and_revokes_sessions(client_anon, data_root, capsys) -> None:
    login_as(client_anon)
    assert client_anon.get("/api/auth/me").status_code == 200

    assert main(["usuario", "reset", "--email", TEST_GM_EMAIL]) == 0
    token = capsys.readouterr().out.strip().rsplit("/", 1)[-1]

    confirm = client_anon.post(
        "/api/auth/reset/confirmar",
        json={"token": token, "password": "nova-senha-99"},
        headers={"Origin": TEST_ORIGIN},
    )
    assert confirm.status_code == 200

    # Old session cookie should be invalid
    assert client_anon.get("/api/auth/me").status_code == 401

    # New password works
    login = client_anon.post(
        "/api/auth/login",
        json={"email": TEST_GM_EMAIL, "password": "nova-senha-99"},
        headers={"Origin": TEST_ORIGIN},
    )
    assert login.status_code == 200
    assert client_anon.get("/api/auth/me").status_code == 200
