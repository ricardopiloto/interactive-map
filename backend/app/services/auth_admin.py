from __future__ import annotations

from datetime import datetime
from typing import NamedTuple

from sqlmodel import Session, select

from app.config import settings
from app.models.campanha import Campanha
from app.models.usuario import Membro, Usuario
from app.services.auth_invite import issue_invite
from app.services.auth_session import revoke_all_user_sessions


class AuthAdminError(Exception):
    def __init__(self, codigo: str) -> None:
        self.codigo = codigo
        super().__init__(codigo)


def normalize_email(email: str) -> str:
    return email.strip().lower()


def _basic_email_ok(email: str) -> bool:
    if "@" not in email or email.startswith("@") or email.endswith("@"):
        return False
    local, _, domain = email.partition("@")
    return bool(local) and "." in domain


def invite_url(token: str, kind: str) -> str:
    base = settings.public_base_url.rstrip("/")
    path = f"/convite/{token}" if kind == "activar" else f"/reset/{token}"
    return f"{base}{path}"


def create_usuario_with_invite(session: Session, email: str) -> tuple[Usuario, str]:
    norm = normalize_email(email)
    if not _basic_email_ok(norm):
        raise AuthAdminError("EMAIL_INVALIDO")
    existing = session.exec(select(Usuario).where(Usuario.email == norm)).first()
    if existing is not None:
        raise AuthAdminError("EMAIL_DUPLICADO")
    now = datetime.utcnow()
    user = Usuario(
        email=norm,
        senha_hash=None,
        activo=False,
        criado_em=now,
        actualizado_em=now,
    )
    session.add(user)
    session.commit()
    session.refresh(user)
    token = issue_invite(session, user.id, "activar")  # type: ignore[arg-type]
    return user, token


def reset_usuario(session: Session, email: str) -> str:
    norm = normalize_email(email)
    user = session.exec(select(Usuario).where(Usuario.email == norm)).first()
    if user is None:
        raise AuthAdminError("USUARIO_NAO_ENCONTRADO")
    if not user.activo and not user.senha_hash:
        raise AuthAdminError("USUARIO_PENDENTE")
    if not user.activo:
        raise AuthAdminError("USUARIO_INACTIVO")
    return issue_invite(session, user.id, "reset")  # type: ignore[arg-type]


def deactivate_usuario(session: Session, email: str) -> None:
    norm = normalize_email(email)
    user = session.exec(select(Usuario).where(Usuario.email == norm)).first()
    if user is None:
        raise AuthAdminError("USUARIO_NAO_ENCONTRADO")
    user.activo = False
    user.actualizado_em = datetime.utcnow()
    session.add(user)
    session.commit()
    revoke_all_user_sessions(session, user.id)  # type: ignore[arg-type]


class AssignOwnerResult(NamedTuple):
    campanha_id: int
    usuario_id: int
    previous_dono_id: int | None


def assign_owner(session: Session, slug: str, email: str) -> AssignOwnerResult:
    camp = session.exec(select(Campanha).where(Campanha.slug == slug)).first()
    if camp is None:
        raise AuthAdminError("CAMPANHA_NAO_ENCONTRADA")
    norm = normalize_email(email)
    user = session.exec(select(Usuario).where(Usuario.email == norm)).first()
    if user is None:
        raise AuthAdminError("USUARIO_NAO_ENCONTRADO")
    if not user.activo:
        raise AuthAdminError("USUARIO_INACTIVO")

    previous = session.exec(
        select(Membro).where(
            Membro.campanha_id == camp.id,
            Membro.papel == "dono",
        )
    ).first()
    previous_id = previous.usuario_id if previous else None

    if previous is not None and previous.usuario_id != user.id:
        session.delete(previous)
        session.commit()

    existing = session.exec(
        select(Membro).where(
            Membro.usuario_id == user.id,
            Membro.campanha_id == camp.id,
        )
    ).first()
    if existing is None:
        session.add(
            Membro(
                usuario_id=user.id,  # type: ignore[arg-type]
                campanha_id=camp.id,  # type: ignore[arg-type]
                papel="dono",
                criado_em=datetime.utcnow(),
            )
        )
    else:
        existing.papel = "dono"
        session.add(existing)
    session.commit()
    return AssignOwnerResult(
        campanha_id=camp.id,  # type: ignore[arg-type]
        usuario_id=user.id,  # type: ignore[arg-type]
        previous_dono_id=previous_id if previous_id != user.id else None,
    )
