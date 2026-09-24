from __future__ import annotations

from tests.conftest import TEST_GM_EMAIL, TEST_ORIGIN


def test_lockout_per_email(client_anon, data_root) -> None:
    for _ in range(5):
        r = client_anon.post(
            "/api/auth/login",
            json={"email": TEST_GM_EMAIL, "password": "wrong-password"},
            headers={"Origin": TEST_ORIGIN},
        )
        assert r.status_code == 401

    blocked = client_anon.post(
        "/api/auth/login",
        json={"email": TEST_GM_EMAIL, "password": "wrong-password"},
        headers={"Origin": TEST_ORIGIN},
    )
    assert blocked.status_code == 429
    assert blocked.json()["detail"]["erro"] == "LOGIN_BLOQUEADO"

    # Correct password also blocked
    still = client_anon.post(
        "/api/auth/login",
        json={"email": TEST_GM_EMAIL, "password": "test-secret-ok"},
        headers={"Origin": TEST_ORIGIN},
    )
    assert still.status_code == 429


def test_lockout_per_ip_independent(client_anon, data_root, monkeypatch) -> None:
    from app.config import settings

    monkeypatch.setattr(settings, "trusted_proxy", True)

    # Fail against nonexistent email — still counts IP
    for _ in range(5):
        r = client_anon.post(
            "/api/auth/login",
            json={"email": "ghost@teste.local", "password": "x"},
            headers={"Origin": TEST_ORIGIN, "X-Forwarded-For": "203.0.113.50"},
        )
        assert r.status_code == 401

    blocked = client_anon.post(
        "/api/auth/login",
        json={"email": "other@teste.local", "password": "x"},
        headers={"Origin": TEST_ORIGIN, "X-Forwarded-For": "203.0.113.50"},
    )
    assert blocked.status_code == 429
    assert blocked.json()["detail"]["erro"] == "LOGIN_BLOQUEADO"
