from __future__ import annotations

from tests.conftest import TEST_GM_EMAIL, TEST_GM_PASSWORD, TEST_ORIGIN


def test_login_logout_me(client_anon, data_root) -> None:
    me0 = client_anon.get("/api/auth/me")
    assert me0.status_code == 401

    login = client_anon.post(
        "/api/auth/login",
        json={"email": TEST_GM_EMAIL, "password": TEST_GM_PASSWORD},
        headers={"Origin": TEST_ORIGIN},
    )
    assert login.status_code == 200
    assert login.json()["email"] == TEST_GM_EMAIL
    cookie = login.cookies.get("codex_session")
    assert cookie

    # Cookie flags via Set-Cookie header
    set_cookie = login.headers.get("set-cookie", "")
    assert "HttpOnly" in set_cookie or "httponly" in set_cookie.lower()
    assert "SameSite=lax" in set_cookie or "samesite=lax" in set_cookie.lower()

    me = client_anon.get("/api/auth/me")
    assert me.status_code == 200
    assert me.json()["email"] == TEST_GM_EMAIL

    logout = client_anon.post("/api/auth/logout", headers={"Origin": TEST_ORIGIN})
    assert logout.status_code == 204
    me2 = client_anon.get("/api/auth/me")
    assert me2.status_code == 401


def test_login_inactive_user(client_anon, data_root) -> None:
    from app.cli import main

    main(["usuario", "desactivar", "--email", TEST_GM_EMAIL])
    response = client_anon.post(
        "/api/auth/login",
        json={"email": TEST_GM_EMAIL, "password": TEST_GM_PASSWORD},
        headers={"Origin": TEST_ORIGIN},
    )
    assert response.status_code == 401
    assert response.json()["detail"]["erro"] == "CONTA_INACTIVA"


def test_public_routes_without_login(client_anon, data_root) -> None:
    assert client_anon.get("/api/health").status_code == 200
    assert client_anon.get("/api/c/teste-suite/config").status_code == 200
    assert client_anon.get("/api/c/teste-suite/locais").status_code == 200
