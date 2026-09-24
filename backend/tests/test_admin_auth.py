from __future__ import annotations

import pytest

from tests.conftest import api

ADMIN_GETS = [
    "/api/admin/locais",
    "/api/admin/npcs",
    "/api/admin/personagens",
    "/api/admin/vinculos",
    "/api/admin/waypoints",
    "/api/admin/route-segments",
    "/api/admin/map-scale",
    "/api/admin/session",
]


@pytest.mark.parametrize("path", ADMIN_GETS)
def test_admin_get_without_credentials_is_401(client_anon, path: str) -> None:
    response = client_anon.get(api(path))
    assert response.status_code == 401
    assert response.json()["detail"]["erro"] == "AUTENTICACAO_NECESSARIA"


@pytest.mark.parametrize("path", ADMIN_GETS)
def test_admin_get_with_session_is_not_401(client, path: str) -> None:
    response = client.get(api(path))
    assert response.status_code != 401
    assert response.status_code == 200


def test_admin_session_returns_email(client) -> None:
    response = client.get(api("/api/admin/session"))
    assert response.status_code == 200
    assert response.json() == {"email": "gm@teste.local"}


def test_basic_auth_no_longer_authorizes(client_anon) -> None:
    response = client_anon.get(api("/api/admin/session"), auth=("test-gm", "test-secret"))
    assert response.status_code == 401
    assert response.json()["detail"]["erro"] == "AUTENTICACAO_NECESSARIA"


def test_admin_arcos_post_gate(client, client_anon) -> None:
    denied = client_anon.post(api("/api/admin/arcos"))
    assert denied.status_code == 401
    authed = client.post(api("/api/admin/arcos"), json={})
    assert authed.status_code != 401


def test_admin_grupo_put_gate(client, client_anon) -> None:
    denied = client_anon.put(api("/api/admin/grupo"))
    assert denied.status_code == 401
    authed = client.put(api("/api/admin/grupo"), json={})
    assert authed.status_code != 401
