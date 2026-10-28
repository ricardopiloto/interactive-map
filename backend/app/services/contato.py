from __future__ import annotations

from hashlib import sha256
from html import escape
import re
from unicodedata import category

from app.services.auth_admin import normalize_email, valid_email_format

ASSUNTOS = {'duvida', 'privacidade', 'problema', 'sugestao', 'outro'}
URL_PATTERN = re.compile(r'https?://', re.IGNORECASE)


def validate_contato(nome: str, email: str, assunto: str, mensagem: str, idioma: str) -> str | None:
    if not 1 <= len(nome) <= 100 or not nome.strip():
        return 'NOME_INVALIDO'
    if not valid_email_format(email):
        return 'EMAIL_INVALIDO'
    if assunto not in ASSUNTOS:
        return 'ASSUNTO_INVALIDO'
    if not 10 <= len(mensagem) <= 4000 or len(URL_PATTERN.findall(mensagem)) > 2:
        return 'MENSAGEM_INVALIDA'
    if idioma not in {'pt-BR', 'en'}:
        return 'IDIOMA_INVALIDO'
    return None


def contato_key(email: str) -> str:
    return 'contato:' + sha256(normalize_email(email).encode()).hexdigest()


def render_contato(nome: str, email: str, assunto: str, mensagem: str) -> tuple[str, str, str]:
    safe_name = ''.join(char for char in nome if category(char) != 'Cc')[:100]
    subject = f'[Contato · {assunto}] {safe_name}'[:160]
    plain = f'Nome: {nome}\nE-mail: {normalize_email(email)}\nAssunto: {assunto}\n\n{mensagem}'
    plain = URL_PATTERN.sub(lambda match: match.group()[:1] + '\u200b' + match.group()[1:], plain)
    html = '<pre>' + escape(plain) + '</pre>'
    return subject, html, plain
