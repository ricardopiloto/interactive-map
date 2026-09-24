from __future__ import annotations

from pwdlib import PasswordHash

_hasher = PasswordHash.recommended()

MIN_PASSWORD_LEN = 8


def hash_password(password: str) -> str:
    return _hasher.hash(password)


def verify_password(password: str, stored_hash: str) -> bool:
    return _hasher.verify(password, stored_hash)


def validate_password_strength(password: str) -> str | None:
    """Return error code or None if OK."""
    if len(password) < MIN_PASSWORD_LEN:
        return "SENHA_CURTA"
    return None
