from __future__ import annotations

from datetime import datetime

from fastapi.testclient import TestClient
from sqlmodel import Session

from app.campaign_db import get_control_engine
from app.cli import _create_campanha
from app.main import app
from app.models.usuario import Usuario
from app.models.local import Local
from app.services.auth_admin import assign_owner
from app.services.auth_password import hash_password
from tests.conftest import (
    TEST_CAMPAIGN_SLUG,
    TEST_GM_EMAIL,
    TEST_GM_PASSWORD,
    TEST_ORIGIN,
    login_as,
)


def _admin_openapi_routes() -> list[tuple[str, set[str]]]:
    """Campaign-scoped admin routes (require_membro), i.e. `/api/c/{slug}/admin/...`.

    App-scoped admin routes (`/api/admin/...`, require_admin/is_admin — spec 129)
    are a different authorization surface (no campanha/slug, error code
    NAO_ADMINISTRADOR, not NAO_MEMBRO) and have their own matrix in
    test_admin_convites_route_matrix.py.
    """
    paths = app.openapi()["paths"]
    out: list[tuple[str, set[str]]] = []
    for path, methods in paths.items():
        if "/admin" not in path or "{slug}" not in path:
            continue
        verbs = {m.upper() for m in methods if m.upper() in {"GET", "POST", "PUT", "PATCH", "DELETE"}}
        if verbs:
            out.append((path, verbs))
    return out


def _sample_path(path: str, slug: str) -> str:
    sample = path.replace("{slug}", slug)
    # Path params → dummy ids (auth runs before body/validation)
    for name in (
        "arco_id",
        "local_id",
        "npc_id",
        "personagem_id",
        "segment_id",
        "vinculo_id",
        "waypoint_id",
    ):
        sample = sample.replace("{" + name + "}", "1")
    return sample


def test_admin_auth_matrix(client_anon, data_root) -> None:
    _create_campanha(slug="camp-b", nome="B", sistema="wfrp4e")
    with Session(get_control_engine()) as session:
        session.add(
            Usuario(
                email="ub@teste.local",
                senha_hash=hash_password("password-ub"),
                activo=True,
                criado_em=datetime.utcnow(),
                actualizado_em=datetime.utcnow(),
            )
        )
        session.commit()
        assign_owner(session, "camp-b", "ub@teste.local")

    admin_paths = _admin_openapi_routes()
    assert admin_paths, "expected admin routes"

    login_as(client_anon, email=TEST_GM_EMAIL, password=TEST_GM_PASSWORD)

    for path, methods in admin_paths:
        sample = _sample_path(path, TEST_CAMPAIGN_SLUG)
        method = "GET" if "GET" in methods else sorted(methods)[0]

        with TestClient(app, headers={"Origin": TEST_ORIGIN}) as anon:
            r = anon.request(method, sample)
            assert r.status_code == 401, f"{method} {sample} anon={r.status_code} {r.text}"

        with TestClient(app, headers={"Origin": TEST_ORIGIN}) as other:
            login_as(other, email="ub@teste.local", password="password-ub")
            r = other.request(method, sample)
            assert r.status_code == 403, f"{method} {sample} other={r.status_code} {r.text}"
            assert r.json()["detail"]["erro"] == "NAO_MEMBRO"

        r = client_anon.request(method, sample)
        assert r.status_code != 401, f"{method} {sample} member={r.status_code}"


def test_upload_auth_gate(client, client_anon, data_root) -> None:
    denied = client_anon.post(
        f"/api/c/{TEST_CAMPAIGN_SLUG}/admin/uploads",
        data={"category": "map"},
        files={"file": ("x.png", b"\x89PNG\r\n\x1a\n", "image/png")},
    )
    assert denied.status_code == 401


def test_local_update_requires_campaign_membership(client_anon, data_root) -> None:
    from tests.conftest import api
    from tests.helpers import seed_local, seed_personagem

    from app.campaign_db import resolve_campaign_session

    with resolve_campaign_session(TEST_CAMPAIGN_SLUG) as session:
        personagem = seed_personagem(session, nome="Vínculo protegido")
        local = seed_local(session, nome="Local protegido")
        personagem_id = personagem.id
        local_id = local.id

    path = api(f"/api/admin/locais/{local_id}")
    anonymous = client_anon.put(path, json={"npc_ids": [personagem_id]})
    assert anonymous.status_code == 401

    _create_campanha(slug="camp-sem-acesso", nome="Sem acesso", sistema="wfrp4e")
    with Session(get_control_engine()) as session:
        session.add(
            Usuario(
                email="sem-acesso@teste.local",
                senha_hash=hash_password("password-sem-acesso"),
                activo=True,
                criado_em=datetime.utcnow(),
                actualizado_em=datetime.utcnow(),
            )
        )
        session.commit()
        assign_owner(session, "camp-sem-acesso", "sem-acesso@teste.local")

    login_as(client_anon, email="sem-acesso@teste.local", password="password-sem-acesso")
    forbidden = client_anon.put(path, json={"npc_ids": [personagem_id]})
    assert forbidden.status_code == 403
    assert forbidden.json()["detail"]["erro"] == "NAO_MEMBRO"

    with resolve_campaign_session(TEST_CAMPAIGN_SLUG) as session:
        assert session.get(Local, local_id).npcs == []
