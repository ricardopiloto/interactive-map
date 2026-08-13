from __future__ import annotations

from typing import Any

from fastapi import HTTPException


def raise_api_error(
    codigo: str,
    *,
    status_code: int,
    detalhes: dict[str, Any] | None = None,
    headers: dict[str, str] | None = None,
) -> None:
    """Raise HTTPException with structured detail for frontend i18n."""
    payload: dict[str, Any] = {"erro": codigo}
    if detalhes:
        payload["detalhes"] = detalhes
    raise HTTPException(status_code=status_code, detail=payload, headers=headers)
