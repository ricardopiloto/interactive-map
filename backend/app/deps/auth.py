"""HTTP Basic Auth for /api/admin/* — fail closed if credentials unset."""

from __future__ import annotations

import secrets

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBasic, HTTPBasicCredentials

from app.config import settings

security = HTTPBasic(auto_error=False)


def verify_admin(
    credentials: HTTPBasicCredentials | None = Depends(security),
) -> str:
    if not settings.admin_configured:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Admin não configurado (ADMIN_USER / ADMIN_PASSWORD)",
            headers={"WWW-Authenticate": "Basic"},
        )
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Autenticação necessária",
            headers={"WWW-Authenticate": "Basic"},
        )
    user_ok = secrets.compare_digest(credentials.username, settings.admin_user or "")
    pass_ok = secrets.compare_digest(credentials.password, settings.admin_password or "")
    if not (user_ok and pass_ok):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciais inválidas",
            headers={"WWW-Authenticate": "Basic"},
        )
    return credentials.username
