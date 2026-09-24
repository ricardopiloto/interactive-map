from __future__ import annotations

from collections.abc import Generator
from pathlib import Path

import pytest
from fastapi.testclient import TestClient
from datetime import datetime

from sqlmodel import Session, select

from app.campaign_db import (
    get_control_engine,
    init_control,
    reset_engines,
    resolve_campaign_session,
)
from app.cli import _create_campanha
from app.config import settings
from app.models.usuario import Usuario
from app.services.auth_admin import assign_owner, create_usuario_with_invite
from app.services.auth_invite import accept_activate_invite
from app.services.auth_password import hash_password

TEST_ADMIN_USER = "test-gm"
TEST_ADMIN_PASSWORD = "test-secret"
TEST_GM_EMAIL = "gm@teste.local"
TEST_GM_PASSWORD = "test-secret-ok"
TEST_CAMPAIGN_SLUG = "teste-suite"
TEST_ORIGIN = "http://localhost:5173"


def api(path: str) -> str:
    """Map legacy /api/... paths to /api/c/{TEST_CAMPAIGN_SLUG}/..."""
    if path.startswith("/api/admin"):
        return f"/api/c/{TEST_CAMPAIGN_SLUG}/admin{path[len('/api/admin') :]}"
    if path.startswith("/api/") and path != "/api/health" and not path.startswith("/api/auth"):
        return f"/api/c/{TEST_CAMPAIGN_SLUG}{path[len('/api') :]}"
    return path


def uploads_url(slug: str, relative: str) -> str:
    """Legacy name — now points at media endpoint (spec 096)."""
    return media_url(slug, relative)


def media_url(slug: str, relative: str) -> str:
    return f"/api/c/{slug}/media/{relative.lstrip('/')}"


def _ensure_member_user(
    *,
    email: str = TEST_GM_EMAIL,
    password: str = TEST_GM_PASSWORD,
    slug: str = TEST_CAMPAIGN_SLUG,
) -> None:
    with Session(get_control_engine()) as session:
        existing = session.exec(select(Usuario).where(Usuario.email == email)).first()
        if existing is None:
            user, token = create_usuario_with_invite(session, email)
            accept_activate_invite(session, token, password)
        else:
            if not existing.senha_hash:
                existing.senha_hash = hash_password(password)
            existing.activo = True
            existing.actualizado_em = datetime.utcnow()
            session.add(existing)
            session.commit()
        assign_owner(session, slug, email)


def login_as(
    client: TestClient,
    *,
    email: str = TEST_GM_EMAIL,
    password: str = TEST_GM_PASSWORD,
) -> None:
    response = client.post(
        "/api/auth/login",
        json={"email": email, "password": password},
        headers={"Origin": TEST_ORIGIN},
    )
    assert response.status_code == 200, response.text


@pytest.fixture
def data_root(tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> Path:
    root = tmp_path / "data"
    root.mkdir()
    reset_engines()
    monkeypatch.setattr(settings, "data_dir", root)
    monkeypatch.setattr(settings, "admin_user", TEST_ADMIN_USER)
    monkeypatch.setattr(settings, "admin_password", TEST_ADMIN_PASSWORD)
    monkeypatch.setattr(settings, "sistema", "wfrp4e")
    monkeypatch.setattr(settings, "modulos_ativos_env", None)
    monkeypatch.setattr(settings, "campaign_slug", None)
    monkeypatch.setattr(settings, "cookie_secure", False)
    monkeypatch.setattr(settings, "public_base_url", "http://localhost:5173")
    monkeypatch.setattr(settings, "trusted_proxy", False)
    init_control()
    _create_campanha(slug=TEST_CAMPAIGN_SLUG, nome="Suite", sistema="wfrp4e")
    _ensure_member_user()
    yield root
    reset_engines()


@pytest.fixture
def client(data_root: Path) -> Generator[TestClient, None, None]:
    from app.main import app

    with TestClient(app, headers={"Origin": TEST_ORIGIN}) as test_client:
        login_as(test_client)
        yield test_client


@pytest.fixture
def client_anon(data_root: Path) -> Generator[TestClient, None, None]:
    """TestClient without session cookie."""
    from app.main import app

    with TestClient(app, headers={"Origin": TEST_ORIGIN}) as test_client:
        yield test_client


@pytest.fixture
def db_session(data_root: Path) -> Generator[Session, None, None]:
    with resolve_campaign_session(TEST_CAMPAIGN_SLUG) as session:
        yield session


@pytest.fixture
def control_session(data_root: Path) -> Generator[Session, None, None]:
    with Session(get_control_engine()) as session:
        yield session
