from __future__ import annotations

from typing import Any

from fastapi import status

from app.errors import raise_api_error
from app.services.stat_blocks import wod, wfrp
from app.services.stat_blocks.base import StatBlockTemplate, StatField

_TEMPLATES: dict[str, StatBlockTemplate] = {
    "wfrp": wfrp,
    "wfrp4e": wfrp,
    "wod": wod,
}


def template_for(sistema: str) -> StatBlockTemplate | None:
    return _TEMPLATES.get(sistema.strip().casefold())


def fields_for(sistema: str) -> tuple[StatField, ...]:
    template = template_for(sistema)
    if template is None:
        return ()
    return template.FIELDS


def validar_stat_block(sistema: str, payload: dict[str, Any] | None) -> dict[str, Any]:
    raw = payload or {}
    if not isinstance(raw, dict):
        raise_api_error(
            "STAT_BLOCK_TIPO_INVALIDO",
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detalhes={"campo": "stat_block", "tipo": "object"},
        )
    template = template_for(sistema)
    if template is None:
        if raw:
            raise_api_error(
                "STAT_BLOCK_SISTEMA_DESCONHECIDO",
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detalhes={"sistema": sistema},
            )
        return {}
    return template.validate(raw)


def render_markdown(sistema: str, payload: dict[str, Any] | None) -> str:
    template = template_for(sistema)
    if template is None:
        return ""
    return template.render_markdown(payload or {})
