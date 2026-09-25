#!/usr/bin/env python3
"""Prepare DATA_DIR + auth cookie for Playwright e2e (spec 109)."""

from __future__ import annotations

import json
import os
import sys
from pathlib import Path

# backend on sys.path when run as `uv run python ../frontend/e2e/seed_e2e.py` from backend/
ROOT = Path(__file__).resolve().parents[2]
BACKEND = ROOT / "backend"
sys.path.insert(0, str(BACKEND))

E2E_SLUG = os.environ.get("E2E_SLUG", "e2e-codex")
E2E_EMAIL = os.environ.get("E2E_EMAIL", "e2e@teste.local")
E2E_PASSWORD = os.environ.get("E2E_PASSWORD", "e2e-secret-ok")
E2E_ADMIN_EMAIL = os.environ.get("E2E_ADMIN_EMAIL", "admin-e2e@teste.local")
E2E_ADMIN_PASSWORD = os.environ.get("E2E_ADMIN_PASSWORD", "admin-e2e-secret-ok")
E2E_DELETE_SLUG = os.environ.get("E2E_DELETE_SLUG", "admin-e2e-descartavel")
E2E_DELETE_MOBILE_SLUG = os.environ.get("E2E_DELETE_MOBILE_SLUG", "admin-e2e-descartavel-mobile")
E2E_ORIGIN = os.environ.get("E2E_ORIGIN", "http://127.0.0.1:4173")
DATA_DIR = Path(os.environ.get("DATA_DIR", ROOT / "frontend" / "e2e" / ".data"))


def main() -> int:
    os.environ["DATA_DIR"] = str(DATA_DIR)
    os.environ["COOKIE_SECURE"] = "false"
    os.environ["PUBLIC_BASE_URL"] = E2E_ORIGIN
    os.environ.setdefault("CORS_ORIGINS", f"{E2E_ORIGIN},http://localhost:4173,http://127.0.0.1:5173")

    from sqlmodel import Session, select
    from app.campaign_db import get_control_engine, init_control, reset_engines, resolve_campaign_session
    from app.cli import _create_campanha
    from app.config import settings
    from app.models.usuario import Usuario
    from app.models.campanha import Campanha
    from app.services.auth_admin import assign_owner, create_usuario_with_invite, promote_admin
    from app.services.auth_invite import accept_activate_invite
    from app.services.auth_password import hash_password
    from app.services.auth_session import COOKIE_NAME, create_session
    from app.services.campanha_admin import create_campanha
    from tests.helpers import seed_arco, seed_local, seed_personagem, seed_vinculo_publico

    DATA_DIR.mkdir(parents=True, exist_ok=True)
    settings.data_dir = DATA_DIR
    settings.cookie_secure = False
    settings.public_base_url = E2E_ORIGIN
    settings.cors_origins = os.environ["CORS_ORIGINS"]
    settings.campaign_slug = None
    reset_engines()
    init_control()

    try:
        _create_campanha(slug=E2E_SLUG, nome="E2E Codex", sistema="wfrp4e")
    except Exception:
        pass  # already exists

    with Session(get_control_engine()) as session:
        existing = session.exec(select(Usuario).where(Usuario.email == E2E_EMAIL)).first()
        if existing is None:
            _user, token = create_usuario_with_invite(session, E2E_EMAIL)
            accept_activate_invite(session, token, E2E_PASSWORD)
        else:
            if not existing.senha_hash:
                existing.senha_hash = hash_password(E2E_PASSWORD)
            existing.activo = True
            session.add(existing)
            session.commit()
        assign_owner(session, E2E_SLUG, E2E_EMAIL)

    with Session(get_control_engine()) as session:
        admin = session.exec(select(Usuario).where(Usuario.email == E2E_ADMIN_EMAIL)).first()
        if admin is None:
            admin, token = create_usuario_with_invite(session, E2E_ADMIN_EMAIL)
            accept_activate_invite(session, token, E2E_ADMIN_PASSWORD)
        else:
            if not admin.senha_hash:
                admin.senha_hash = hash_password(E2E_ADMIN_PASSWORD)
            admin.activo = True
            session.add(admin)
            session.commit()
        promote_admin(session, E2E_ADMIN_EMAIL)

    for slug in (E2E_DELETE_SLUG, E2E_DELETE_MOBILE_SLUG):
        try:
            disposable = create_campanha(slug=slug, nome="Mesa descartável E2E", sistema="wfrp4e")
        except Exception:
            with Session(get_control_engine()) as session:
                disposable = session.exec(select(Campanha).where(Campanha.slug == slug)).one()
        with Session(get_control_engine()) as session:
            assign_owner(session, disposable.slug, E2E_EMAIL)

    with resolve_campaign_session(E2E_SLUG) as session:
        from sqlmodel import select as sel
        from app.models.local import Local
        from app.campaign_db import campaign_uploads_path, lookup_campanha
        from app.models.campanha import Campanha

        if session.exec(sel(Local)).first() is None:
            arco = seed_arco(session, titulo="Arco E2E")
            seed_local(session, nome="Altdorf", arco_id=arco.id)
            seed_local(session, nome="Ubersreik", arco_id=arco.id)
            a = seed_personagem(session, nome="Ada")
            b = seed_personagem(session, nome="Bruno")
            seed_vinculo_publico(session, a.id, b.id)

        camp = lookup_campanha(E2E_SLUG)
        uploads = campaign_uploads_path(camp.caminho)
        (uploads / "map").mkdir(parents=True, exist_ok=True)
        mapa = uploads / "map" / "mapa-e2e.webp"
        if not mapa.exists():
            # Minimal valid-enough bytes for has_map_image flag
            mapa.write_bytes(
                b"RIFF\x28\x00\x00\x00WEBPVP8 \x1c\x00\x00\x00"
                + b"\x30\x01\x00\x9d\x01\x2a\x01\x00\x01\x00\x01\x40\x25\xa4\x00\x03"
                + b"\x70\x00\xfe\xfb\xfd\x50\x00"
            )
        with Session(get_control_engine()) as ctrl:
            row = ctrl.exec(select(Campanha).where(Campanha.slug == E2E_SLUG)).first()
            if row is not None:
                row.mapa_arquivo = "mapa-e2e.webp"
                ctrl.add(row)
                ctrl.commit()

    with Session(get_control_engine()) as session:
        user = session.exec(select(Usuario).where(Usuario.email == E2E_EMAIL)).one()
        cookie = create_session(session, user.id)
        admin_user = session.exec(select(Usuario).where(Usuario.email == E2E_ADMIN_EMAIL)).one()
        admin_cookie = create_session(session, admin_user.id)

    out = {
        "slug": E2E_SLUG,
        "email": E2E_EMAIL,
        "password": E2E_PASSWORD,
        "cookieName": COOKIE_NAME,
        "cookieValue": cookie,
        "adminEmail": E2E_ADMIN_EMAIL,
        "adminPassword": E2E_ADMIN_PASSWORD,
        "adminCookieValue": admin_cookie,
        "deleteCampaignSlug": E2E_DELETE_SLUG,
        "deleteCampaignSlugs": {"desktop": E2E_DELETE_SLUG, "mobile": E2E_DELETE_MOBILE_SLUG},
        "origin": E2E_ORIGIN,
        "dataDir": str(DATA_DIR),
    }
    auth_path = Path(__file__).resolve().parent / ".auth" / "session.json"
    auth_path.parent.mkdir(parents=True, exist_ok=True)
    auth_path.write_text(json.dumps(out, indent=2), encoding="utf-8")
    print(json.dumps(out))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
