from datetime import datetime, timedelta

import pytest
from sqlmodel import Session, SQLModel, create_engine, select
from sqlalchemy.pool import StaticPool

from app.config import settings
from app.models.campanha import Campanha
from app.models.usuario import Convite, Usuario
from app.services.auth_admin import canonical_email, create_usuario_with_invite, invite_url
from app.services.auth_invite import InviteError, accept_activate_invite, issue_invite
from app.services.auth_tokens import hash_token
from app.services.campanha_admin import default_cota_bytes


def test_configured_quota(monkeypatch):
    monkeypatch.setattr(settings, "cota_padrao_bytes", 12345)
    assert default_cota_bytes() == 12345
    assert Campanha(slug="teste", nome="Teste", sistema="wfrp4e", caminho="teste").cota_bytes == 12345


@pytest.mark.parametrize("email,expected", [
    (" Foo+bar@Example.COM ", "foo@example.com"),
    ("F.O.O+bar@GOOGLEMAIL.COM", "foo@gmail.com"),
    ("foo+@gmail.com", "foo@gmail.com"),
    (".foo@gmail.com", "foo@gmail.com"),
])
def test_canonical_email(email, expected):
    assert canonical_email(email) == expected


def test_verification_invite_and_admin_canonicalization():
    engine = create_engine("sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool)
    from app.models.campanha import control_metadata
    control_metadata.create_all(engine)
    with Session(engine) as session:
        user, _ = create_usuario_with_invite(session, "F.o.o+tag@GoogleMail.com")
        assert user.email_canonico == "foo@gmail.com"
        token = issue_invite(session, user.id, "verificar")
        invite = session.exec(select(Convite).where(Convite.token_hash == hash_token(token))).one()
        assert timedelta(hours=4, minutes=59) < invite.expira_em - invite.criado_em < timedelta(hours=5, minutes=1)
        assert invite_url(token, "verificar").endswith(f"/convite/{token}")
        accept_activate_invite(session, token, "StrongPass123!")
        with pytest.raises(InviteError, match="CONVITE_JA_USADO"):
            accept_activate_invite(session, token, "StrongPass123!")
        expired = issue_invite(session, user.id, "verificar")
        row = session.exec(select(Convite).where(Convite.token_hash == hash_token(expired))).one()
        row.expira_em = datetime.utcnow() - timedelta(seconds=1)
        session.add(row)
        session.commit()
        with pytest.raises(InviteError, match="CONVITE_EXPIRADO"):
            accept_activate_invite(session, expired, "StrongPass123!")


def test_package_import_uses_configured_quota(data_root, monkeypatch):
    from app.services.campaign_export import export_campaign_to_bytes
    from app.services.campaign_import import import_campaign_from_bytes
    from tests.conftest import TEST_CAMPAIGN_SLUG, TEST_GM_EMAIL

    monkeypatch.setattr(settings, "cota_padrao_bytes", 400 * 1024**2)
    package = export_campaign_to_bytes(TEST_CAMPAIGN_SLUG)
    imported = import_campaign_from_bytes(package, owner_email=TEST_GM_EMAIL, slug_override="quota-import")
    assert imported.cota_bytes == 400 * 1024**2


def test_above_quota_remains_exportable_but_upload_rejected(data_root):
    import asyncio
    from fastapi import HTTPException
    from sqlmodel import Session, select
    from app.campaign_db import get_control_engine
    from app.services.campaign_export import export_campaign_to_bytes
    from app.services.uploads import save_image
    from tests.conftest import TEST_CAMPAIGN_SLUG

    with Session(get_control_engine()) as session:
        camp = session.exec(select(Campanha).where(Campanha.slug == TEST_CAMPAIGN_SLUG)).one()
        camp.bytes_usados = 400 * 1024**2
        camp.cota_bytes = 300 * 1024**2
        session.add(camp)
        session.commit()
    assert export_campaign_to_bytes(TEST_CAMPAIGN_SLUG)
    class File:
        filename = "image.png"
        content_type = "image/png"

        async def read(self):
            return b"\x89PNG\r\n\x1a\n"

    file = File()
    with pytest.raises(HTTPException) as exc:
        asyncio.run(save_image(file, "portraits", TEST_CAMPAIGN_SLUG))
    assert exc.value.status_code == 413
    with Session(get_control_engine()) as session:
        camp = session.exec(select(Campanha).where(Campanha.slug == TEST_CAMPAIGN_SLUG)).one()
        assert camp.bytes_usados == 400 * 1024**2


def test_package_over_quota_creates_nothing(data_root, monkeypatch):
    from app.campaign_db import resolve_campaign_session, get_control_engine
    from app.services.campaign_export import export_campaign_to_bytes
    from app.services.campaign_import import import_campaign_from_bytes
    from app.services.package_schema import PackageError, COTA_EXCEDIDA
    from tests.helpers import seed_exportable_campaign
    from tests.conftest import TEST_CAMPAIGN_SLUG, TEST_GM_EMAIL

    with resolve_campaign_session(TEST_CAMPAIGN_SLUG) as session:
        seed_exportable_campaign(session, slug=TEST_CAMPAIGN_SLUG)
    package = export_campaign_to_bytes(TEST_CAMPAIGN_SLUG)
    monkeypatch.setattr(settings, "cota_padrao_bytes", 1)
    with pytest.raises(PackageError) as exc:
        import_campaign_from_bytes(package, owner_email=TEST_GM_EMAIL, slug_override="over-quota")
    assert exc.value.codigo == COTA_EXCEDIDA
    with Session(get_control_engine()) as session:
        assert session.exec(select(Campanha).where(Campanha.slug == "over-quota")).first() is None
