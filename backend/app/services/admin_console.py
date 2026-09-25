from __future__ import annotations

import shutil
from datetime import datetime
from pathlib import Path

from sqlalchemy import inspect
from sqlmodel import Session, select

from app.campaign_db import (
    campaign_db_path,
    data_dir,
    forget_campaign_engine,
    get_campaign_engine,
    get_control_engine,
)
from app.models.campanha import Campanha
from app.models.usuario import Convite, LoginBloqueio, Membro, Sessao, Usuario
from app.services.auth_admin import AuthAdminError, create_usuario_with_invite, invite_url, reset_usuario
from app.services.auth_lockout import email_key


class AdminConsoleError(Exception):
    def __init__(self, codigo: str, *, campaigns: list[dict] | None = None) -> None:
        self.codigo = codigo
        self.campaigns = campaigns or []
        super().__init__(codigo)


def user_state(user: Usuario) -> str:
    if not user.activo:
        return "inativa" if user.senha_hash else "pendente"
    return "ativa"


def user_view(session: Session, user: Usuario) -> dict:
    owned: list[dict] = []
    rows = session.exec(
        select(Campanha, Membro)
        .join(Membro, Membro.campanha_id == Campanha.id)
        .where(Membro.usuario_id == user.id, Membro.papel == "dono")
        .order_by(Campanha.nome)
    ).all()
    for campaign, _membership in rows:
        owned.append({"id": campaign.id, "slug": campaign.slug, "nome": campaign.nome, "activa": campaign.activa})
    return {
        "id": user.id,
        "email": user.email,
        "estado": user_state(user),
        "is_admin": user.is_admin,
        "criado_em": user.criado_em,
        "mesas_proprietarias": owned,
    }


def list_users(session: Session, *, email: str | None = None, estado: str | None = None) -> list[dict]:
    query = select(Usuario).order_by(Usuario.email)
    if email and email.strip():
        query = query.where(Usuario.email.contains(email.strip().lower()))
    users = session.exec(query).all()
    return [view for user in users if (estado is None or user_state(user) == estado) if (view := user_view(session, user))]


def _get_user(session: Session, user_id: int) -> Usuario:
    user = session.get(Usuario, user_id)
    if user is None:
        raise AdminConsoleError("USUARIO_NAO_ENCONTRADO")
    return user


def _ensure_not_last_admin(session: Session, user: Usuario) -> None:
    if user.is_admin and user.activo:
        count = len(session.exec(select(Usuario.id).where(Usuario.is_admin.is_(True), Usuario.activo.is_(True))).all())
        if count <= 1:
            raise AdminConsoleError("ULTIMO_ADMINISTRADOR")


def _owned_campaigns(session: Session, user_id: int) -> list[dict]:
    rows = session.exec(
        select(Campanha, Membro)
        .join(Membro, Membro.campanha_id == Campanha.id)
        .where(Membro.usuario_id == user_id, Membro.papel == "dono")
        .order_by(Campanha.nome)
    ).all()
    return [{"id": campaign.id, "nome": campaign.nome, "slug": campaign.slug} for campaign, _ in rows]


def set_user_active(session: Session, user_id: int, active: bool) -> dict:
    user = _get_user(session, user_id)
    if not active:
        _ensure_not_last_admin(session, user)
        campaigns = _owned_campaigns(session, user_id)
        if campaigns:
            raise AdminConsoleError("PROPRIETARIO_COM_MESAS", campaigns=campaigns)
    user.activo = active
    user.actualizado_em = datetime.utcnow()
    session.add(user)
    if not active:
        for row in session.exec(select(Sessao).where(Sessao.usuario_id == user_id)).all():
            row.revogada = True
            session.add(row)
    session.commit()
    session.refresh(user)
    return user_view(session, user)


def delete_user(session: Session, user_id: int) -> None:
    user = _get_user(session, user_id)
    _ensure_not_last_admin(session, user)
    campaigns = _owned_campaigns(session, user_id)
    if campaigns:
        raise AdminConsoleError("PROPRIETARIO_COM_MESAS", campaigns=campaigns)
    for model in (Convite, Sessao, Membro):
        for row in session.exec(select(model).where(model.usuario_id == user_id)).all():
            session.delete(row)
    lockout = session.exec(select(LoginBloqueio).where(LoginBloqueio.chave == email_key(user.email))).first()
    if lockout is not None:
        session.delete(lockout)
    session.delete(user)
    session.commit()


def create_invite(session: Session, email: str) -> dict:
    try:
        user, token = create_usuario_with_invite(session, email)
    except AuthAdminError as exc:
        raise AdminConsoleError(exc.codigo) from exc
    return {"email": user.email, "link": invite_url(token, "activar")}


def create_reset_link(session: Session, user_id: int) -> dict:
    user = _get_user(session, user_id)
    try:
        token = reset_usuario(session, user.email)
    except AuthAdminError as exc:
        raise AdminConsoleError(exc.codigo) from exc
    return {"email": user.email, "link": invite_url(token, "reset")}


def list_campaigns(session: Session, *, q: str | None = None, estado: str | None = None) -> list[dict]:
    query = select(Campanha).order_by(Campanha.nome)
    if estado == "ativa":
        query = query.where(Campanha.activa.is_(True))
    elif estado == "inativa":
        query = query.where(Campanha.activa.is_(False))
    needle = (q or "").strip().lower()
    rows = session.exec(query).all()
    result = []
    for campaign in rows:
        owner = session.exec(
            select(Usuario)
            .join(Membro, Membro.usuario_id == Usuario.id)
            .where(Membro.campanha_id == campaign.id, Membro.papel == "dono")
        ).first()
        if owner is None:
            continue
        if needle and needle not in f"{campaign.nome} {campaign.slug} {owner.email}".lower():
            continue
        modified = _campaign_content_modified(campaign)
        created = getattr(campaign, "criado_em", None)
        settings_modified = getattr(campaign, "modificado_em", None)
        dates = [value for value in (created, settings_modified, modified) if value is not None]
        result.append({
            "id": campaign.id, "nome": campaign.nome, "slug": campaign.slug, "sistema": campaign.sistema,
            "proprietario": {"id": owner.id, "email": owner.email}, "activa": campaign.activa,
            "visibilidade": campaign.visibilidade, "criado_em": created, "modificado_em": modified,
            "ultima_alteracao_em": max(dates) if dates else None,
        })
    return result


def _campaign_content_modified(campaign: Campanha) -> datetime | None:
    root = (data_dir() / "campanhas").resolve()
    candidate = data_dir() / campaign.caminho
    resolved = candidate.resolve()
    if candidate.is_symlink() or resolved.parent != root:
        return None
    path = campaign_db_path(campaign.caminho)
    if not path.is_file():
        return None
    try:
        engine = get_campaign_engine(Path(campaign.caminho).name, campaign.caminho)
        if "campaign_state" not in inspect(engine).get_table_names():
            return None
        with engine.connect() as connection:
            value = connection.exec_driver_sql("SELECT modificado_em FROM campaign_state WHERE id = 1").scalar_one_or_none()
        if isinstance(value, str):
            return datetime.fromisoformat(value)
        return value
    except Exception:
        return None


def set_campaign_active(session: Session, campaign_id: int, active: bool) -> dict:
    campaign = session.get(Campanha, campaign_id)
    if campaign is None:
        raise AdminConsoleError("CAMPANHA_NAO_ENCONTRADA")
    campaign.activa = active
    campaign.modificado_em = datetime.utcnow()
    session.add(campaign)
    session.commit()
    return next(item for item in list_campaigns(session) if item["id"] == campaign_id)


def transfer_campaign_owner(session: Session, campaign_id: int, email: str) -> dict:
    campaign = session.get(Campanha, campaign_id)
    if campaign is None:
        raise AdminConsoleError("CAMPANHA_NAO_ENCONTRADA")
    owner = session.exec(select(Usuario).where(Usuario.email == email.strip().lower())).first()
    if owner is None:
        raise AdminConsoleError("USUARIO_NAO_ENCONTRADO")
    if not owner.activo:
        raise AdminConsoleError("USUARIO_INACTIVO")
    old = session.exec(select(Membro).where(Membro.campanha_id == campaign_id, Membro.papel == "dono")).first()
    if old and old.usuario_id != owner.id:
        session.delete(old)
    target_membership = session.exec(select(Membro).where(Membro.campanha_id == campaign_id, Membro.usuario_id == owner.id)).first()
    if target_membership is None:
        session.add(Membro(usuario_id=owner.id, campanha_id=campaign_id, papel="dono"))
    else:
        target_membership.papel = "dono"
        session.add(target_membership)
    campaign.modificado_em = datetime.utcnow()
    session.add(campaign)
    session.commit()
    return next(item for item in list_campaigns(session) if item["id"] == campaign_id)


def delete_campaign(session: Session, campaign_id: int) -> None:
    campaign = session.get(Campanha, campaign_id)
    if campaign is None:
        raise AdminConsoleError("CAMPANHA_NAO_ENCONTRADA")
    root = (data_dir() / "campanhas").resolve()
    candidate = data_dir() / campaign.caminho
    source = candidate.resolve()
    if candidate.is_symlink() or source.parent != root or source == root:
        raise AdminConsoleError("CAMINHO_CAMPANHA_INVALIDO")
    trash_candidate = data_dir() / ".admin-trash"
    if trash_candidate.is_symlink():
        raise AdminConsoleError("CAMINHO_CAMPANHA_INVALIDO")
    trash = trash_candidate.resolve()
    trash.mkdir(parents=True, exist_ok=True)
    staged = trash / f"{campaign_id}-{source.name}"
    campaign.activa = False
    session.add(campaign)
    session.commit()
    forget_campaign_engine(source.name)
    moved = False
    database_committed = False
    try:
        if staged.exists() and not source.exists():
            shutil.move(str(staged), str(source))
        if source.exists():
            if staged.exists():
                raise AdminConsoleError("EXCLUSAO_EM_RECUPERACAO")
            shutil.move(str(source), str(staged))
            moved = True
        for member in session.exec(select(Membro).where(Membro.campanha_id == campaign_id)).all():
            session.delete(member)
        session.delete(campaign)
        session.commit()
        database_committed = True
        if staged.exists():
            shutil.rmtree(staged)
    except Exception as exc:
        session.rollback()
        if not database_committed and moved and staged.exists() and not source.exists():
            shutil.move(str(staged), str(source))
        if isinstance(exc, AdminConsoleError):
            raise
        raise AdminConsoleError("FALHA_EXCLUSAO_CAMPANHA") from exc


def reconcile_campaign_deletions() -> None:
    """Recover staged deletes after a process interruption, preserving registered rows."""
    trash = data_dir() / ".admin-trash"
    if not trash.is_dir():
        return
    with Session(get_control_engine()) as session:
        for staged in trash.iterdir():
            if staged.is_symlink() or not staged.is_dir():
                continue
            try:
                campaign_id = int(staged.name.split("-", 1)[0])
            except ValueError:
                continue
            campaign = session.get(Campanha, campaign_id)
            if campaign is None:
                try:
                    shutil.rmtree(staged)
                except OSError:
                    continue
                continue
            target_candidate = data_dir() / campaign.caminho
            target = target_candidate.resolve()
            root = (data_dir() / "campanhas").resolve()
            if target_candidate.is_symlink() or target.parent != root:
                continue
            if not target.exists():
                target.parent.mkdir(parents=True, exist_ok=True)
                try:
                    shutil.move(str(staged), str(target))
                except OSError:
                    continue
