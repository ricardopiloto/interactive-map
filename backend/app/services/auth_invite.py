from __future__ import annotations

from datetime import datetime, timedelta

from sqlmodel import Session, select

from app.models.usuario import Convite, Usuario
from app.services.auth_password import hash_password, validate_password_strength
from app.services.auth_session import revoke_all_user_sessions
from app.services.auth_tokens import generate_opaque_token, hash_token

INVITE_TTL_HOURS = 72
REGISTO_TTL_HORAS = 5


class InviteError(Exception):
    def __init__(self, codigo: str, tipo: str | None = None) -> None:
        self.codigo = codigo
        self.tipo = tipo
        super().__init__(codigo)


def _now() -> datetime:
    return datetime.utcnow()


def issue_invite(session: Session, usuario_id: int, tipo: str) -> str:
    if tipo not in ("activar", "verificar", "reset"):
        raise InviteError("TIPO_CONVITE_INVALIDO")
    raw = generate_opaque_token()
    row = Convite(
        usuario_id=usuario_id,
        tipo=tipo,
        token_hash=hash_token(raw),
        expira_em=_now() + timedelta(hours=REGISTO_TTL_HORAS if tipo == "verificar" else INVITE_TTL_HOURS),
        consumido_em=None,
        criado_em=_now(),
    )
    session.add(row)
    session.commit()
    return raw


def _load_valid_invite(session: Session, token: str, expected_tipos: set[str]) -> Convite:
    th = hash_token(token)
    row = session.exec(select(Convite).where(Convite.token_hash == th)).first()
    if row is None:
        raise InviteError("CONVITE_INVALIDO")
    if row.tipo not in expected_tipos:
        raise InviteError("CONVITE_INVALIDO")
    if row.consumido_em is not None:
        raise InviteError("CONVITE_JA_USADO")
    if row.expira_em < _now():
        raise InviteError("CONVITE_EXPIRADO", tipo=row.tipo)
    return row


def accept_activate_invite(session: Session, token: str, password: str) -> Usuario:
    err = validate_password_strength(password)
    if err:
        raise InviteError(err)
    invite = _load_valid_invite(session, token, {"activar", "verificar"})
    usuario = session.get(Usuario, invite.usuario_id)
    if usuario is None:
        raise InviteError("CONVITE_INVALIDO")
    usuario.senha_hash = hash_password(password)
    usuario.activo = True
    usuario.actualizado_em = _now()
    invite.consumido_em = _now()
    session.add(usuario)
    session.add(invite)
    session.commit()
    session.refresh(usuario)
    return usuario


def confirm_reset(session: Session, token: str, password: str) -> Usuario:
    err = validate_password_strength(password)
    if err:
        raise InviteError(err)
    invite = _load_valid_invite(session, token, {"reset"})
    usuario = session.get(Usuario, invite.usuario_id)
    if usuario is None:
        raise InviteError("CONVITE_INVALIDO")
    usuario.senha_hash = hash_password(password)
    usuario.activo = True
    usuario.actualizado_em = _now()
    invite.consumido_em = _now()
    session.add(usuario)
    session.add(invite)
    session.commit()
    revoke_all_user_sessions(session, usuario.id)  # type: ignore[arg-type]
    session.refresh(usuario)
    return usuario
