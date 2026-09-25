from __future__ import annotations

from sqlmodel import select

from app.models.campanha import Campanha
from app.models.usuario import Convite, Membro, Sessao, Usuario
from app.campaign_db import get_control_engine
from sqlmodel import Session
from tests.conftest import TEST_GM_EMAIL, TEST_GM_PASSWORD, login_as


ADMIN_CALLS = [
    ("get", "/api/admin/usuarios"),
    ("post", "/api/admin/convites", {"email": "matrix@example.org"}),
    ("post", "/api/admin/usuarios/999999/reset", {}),
    ("patch", "/api/admin/usuarios/999999/estado", {"activo": False}),
    ("delete", "/api/admin/usuarios/999999"),
    ("get", "/api/admin/campanhas"),
    ("patch", "/api/admin/campanhas/999999/estado", {"activa": False}),
    ("patch", "/api/admin/campanhas/999999/proprietario", {"email": "matrix@example.org"}),
    ("delete", "/api/admin/campanhas/999999"),
]


def _call(client, method: str, path: str, body: dict | None = None):
    return getattr(client, method)(path, json=body) if body is not None else getattr(client, method)(path)


def test_every_admin_endpoint_rejects_anonymous_and_non_admin_without_mutation(client_anon, data_root):
    with Session(get_control_engine()) as session:
        before = {
            "users": session.exec(select(Usuario.id)).all(),
            "campaigns": session.exec(select(Campanha.id)).all(),
            "invites": session.exec(select(Convite.id)).all(),
            "sessions": session.exec(select(Sessao.id)).all(),
            "members": session.exec(select(Membro.id)).all(),
        }
    for method, path, *rest in ADMIN_CALLS:
        body = rest[0] if rest else None
        assert _call(client_anon, method, path, body).status_code == 401
    login_as(client_anon, email=TEST_GM_EMAIL, password=TEST_GM_PASSWORD)
    # Login intentionally creates a session; compare the rejection matrix against that state.
    with Session(get_control_engine()) as session:
        after_login = {
            "users": session.exec(select(Usuario.id)).all(),
            "campaigns": session.exec(select(Campanha.id)).all(),
            "invites": session.exec(select(Convite.id)).all(),
            "sessions": session.exec(select(Sessao.id)).all(),
            "members": session.exec(select(Membro.id)).all(),
        }
    for method, path, *rest in ADMIN_CALLS:
        body = rest[0] if rest else None
        assert _call(client_anon, method, path, body).status_code == 403
    with Session(get_control_engine()) as session:
        after = {
            "users": session.exec(select(Usuario.id)).all(),
            "campaigns": session.exec(select(Campanha.id)).all(),
            "invites": session.exec(select(Convite.id)).all(),
            "sessions": session.exec(select(Sessao.id)).all(),
            "members": session.exec(select(Membro.id)).all(),
        }
    assert before["users"] == after["users"]
    assert before["campaigns"] == after["campaigns"]
    assert before["invites"] == after["invites"]
    assert after == after_login


def test_admin_can_access_both_allowlisted_lists(admin_client):
    assert admin_client.get("/api/admin/usuarios").status_code == 200
    assert admin_client.get("/api/admin/campanhas").status_code == 200
