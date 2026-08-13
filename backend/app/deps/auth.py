from __future__ import annotations

import secrets

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBasic, HTTPBasicCredentials

from app.config import settings
from app.errors import raise_api_error

security = HTTPBasic(auto_error=False)


def verify_admin(
    credentials: HTTPBasicCredentials | None = Depends(security),
) -> str:
    if not settings.admin_configured:
        raise_api_error(
            "ADMIN_NAO_CONFIGURADO",
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            headers={"WWW-Authenticate": "Basic"},
        )
    if credentials is None:
        raise_api_error(
            "AUTENTICACAO_NECESSARIA",
            status_code=status.HTTP_401_UNAUTHORIZED,
            headers={"WWW-Authenticate": "Basic"},
        )
    user_ok = secrets.compare_digest(credentials.username, settings.admin_user or "")
    pass_ok = secrets.compare_digest(credentials.password, settings.admin_password or "")
    if not (user_ok and pass_ok):
        raise_api_error(
            "CREDENCIAIS_INVALIDAS",
            status_code=status.HTTP_401_UNAUTHORIZED,
            headers={"WWW-Authenticate": "Basic"},
        )
    return credentials.username
