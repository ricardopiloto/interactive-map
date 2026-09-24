from __future__ import annotations

from datetime import datetime, timedelta

from sqlmodel import Session, select

from app.campaign_db import get_control_engine
from app.cli import main
from app.models.usuario import Convite
from app.services.auth_tokens import hash_token
from tests.conftest import TEST_ORIGIN


def _token_from_criar(capsys, email: str) -> str:
    assert main(["usuario", "criar", "--email", email]) == 0
    url = capsys.readouterr().out.strip()
    return url.rsplit("/", 1)[-1]


def test_aceitar_convite_success(client_anon, data_root, capsys) -> None:
    token = _token_from_criar(capsys, "aceitar@teste.local")
    response = client_anon.post(
        "/api/auth/convite/aceitar",
        json={"token": token, "password": "senha-forte"},
        headers={"Origin": TEST_ORIGIN},
    )
    assert response.status_code == 200
    assert response.json()["email"] == "aceitar@teste.local"
    assert "codex_session" in response.cookies


def test_aceitar_convite_reuse_fails(client_anon, data_root, capsys) -> None:
    token = _token_from_criar(capsys, "reuse@teste.local")
    first = client_anon.post(
        "/api/auth/convite/aceitar",
        json={"token": token, "password": "senha-forte"},
        headers={"Origin": TEST_ORIGIN},
    )
    assert first.status_code == 200
    second = client_anon.post(
        "/api/auth/convite/aceitar",
        json={"token": token, "password": "senha-forte"},
        headers={"Origin": TEST_ORIGIN},
    )
    assert second.status_code == 400
    assert second.json()["detail"]["erro"] == "CONVITE_JA_USADO"


def test_aceitar_convite_expired_fails(client_anon, data_root, capsys) -> None:
    token = _token_from_criar(capsys, "expira@teste.local")
    with Session(get_control_engine()) as session:
        row = session.exec(select(Convite).where(Convite.token_hash == hash_token(token))).one()
        row.expira_em = datetime.utcnow() - timedelta(hours=1)
        session.add(row)
        session.commit()
    response = client_anon.post(
        "/api/auth/convite/aceitar",
        json={"token": token, "password": "senha-forte"},
        headers={"Origin": TEST_ORIGIN},
    )
    assert response.status_code == 400
    assert response.json()["detail"]["erro"] == "CONVITE_EXPIRADO"
