from __future__ import annotations

from sqlmodel import Session

from app.campaign_db import get_control_engine
from app.services.auth_admin import promote_admin
from tests.conftest import TEST_GM_EMAIL, TEST_GM_PASSWORD, login_as


def test_anonimo_recusado(client_anon, data_root) -> None:
    r = client_anon.post("/api/admin/convites", json={"email": "novo@teste.local"})
    assert r.status_code == 401


def test_mestre_sem_is_admin_recusado(client_anon, data_root) -> None:
    login_as(client_anon, email=TEST_GM_EMAIL, password=TEST_GM_PASSWORD)
    r = client_anon.post("/api/admin/convites", json={"email": "novo@teste.local"})
    assert r.status_code == 403
    assert r.json()["detail"]["erro"] == "NAO_ADMINISTRADOR"


def test_administrador_cria_convite(client_anon, data_root) -> None:
    with Session(get_control_engine()) as session:
        promote_admin(session, TEST_GM_EMAIL)
    login_as(client_anon, email=TEST_GM_EMAIL, password=TEST_GM_PASSWORD)
    r = client_anon.post("/api/admin/convites", json={"email": "novo-mestre@teste.local"})
    assert r.status_code == 201
    body = r.json()
    assert body["email"] == "novo-mestre@teste.local"
    assert "/convite/" in body["link"]


def test_administrador_email_duplicado(client_anon, data_root) -> None:
    with Session(get_control_engine()) as session:
        promote_admin(session, TEST_GM_EMAIL)
    login_as(client_anon, email=TEST_GM_EMAIL, password=TEST_GM_PASSWORD)
    assert client_anon.post("/api/admin/convites", json={"email": "dup@teste.local"}).status_code == 201
    r = client_anon.post("/api/admin/convites", json={"email": "dup@teste.local"})
    assert r.status_code == 409
    assert r.json()["detail"]["erro"] == "EMAIL_DUPLICADO"
