from __future__ import annotations

from html import escape

from app.services.auth_admin import invite_url

_TEXT = {
    'pt-BR': {
        'verificar': ('Confirme seu e-mail', 'Confirme seu e-mail para criar sua conta: {link}'),
        'existente': ('Sua conta já existe', 'Sua conta já existe. Entre em: {link}'),
        'admin': ('Convite para o Mapa', 'Você recebeu um convite. Abra: {link}'),
    },
    'en': {
        'verificar': ('Confirm your email', 'Confirm your email to create your account: {link}'),
        'existente': ('Your account already exists', 'Your account already exists. Sign in: {link}'),
        'admin': ('Invitation to Mapa', 'You have been invited. Open: {link}'),
    },
}


def render_email(kind: str, idioma: str = 'pt-BR', token: str | None = None) -> tuple[str, str, str]:
    from app.config import settings
    subject, template = _TEXT[idioma if idioma in _TEXT else 'pt-BR'][kind]
    link = invite_url(token, 'verificar' if kind == 'verificar' else 'activar') if kind != 'existente' else settings.public_base_url.rstrip('/') + '/login'
    plain = template.format(link=link)
    return subject, '<p>' + escape(plain) + '</p>', plain
