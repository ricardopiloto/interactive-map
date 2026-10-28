from __future__ import annotations

from html import escape

from app.config import settings

_TEXT = {
    'pt-BR': {
        'verificar': ('Confirme seu e-mail', 'Confirme seu e-mail para criar sua conta: {link}'),
        'existente': ('Sua conta já existe', 'Sua conta já existe. Entre em: {link} Se esqueceu sua senha, recupere em: {recovery_link}'),
        'admin': ('Convite para o Mapa', 'Você recebeu um convite. Abra: {link}'),
        'reset': ('Redefinir sua senha', 'Redefina sua senha em: {link} Este link é válido por 1 hora. Se você não pediu, ignore esta mensagem.'),
    },
    'en': {
        'verificar': ('Confirm your email', 'Confirm your email to create your account: {link}'),
        'existente': ('Your account already exists', 'Your account already exists. Sign in: {link} If you forgot your password, recover it at: {recovery_link}'),
        'admin': ('Invitation to Mapa', 'You have been invited. Open: {link}'),
        'reset': ('Reset your password', 'Reset your password at: {link} This link is valid for 1 hour. If you did not request this, ignore this message.'),
    },
}


def render_email(kind: str, idioma: str = 'pt-BR', token: str | None = None) -> tuple[str, str, str]:
    base = settings.public_base_url.rstrip('/')
    links = {
        'verificar': f'{base}/convite/{token}',
        'admin': f'{base}/convite/{token}',
        'reset': f'{base}/reset/{token}',
        'existente': f'{base}/login',
    }
    subject, template = _TEXT[idioma if idioma in _TEXT else 'pt-BR'][kind]
    plain = template.format(link=links[kind], recovery_link=f'{base}/esqueci-senha')
    return subject, '<p>' + escape(plain) + '</p>', plain
