from typing import Any

from fastapi import status

from app.config import settings
from app.errors import raise_api_error

FADIGA_MIN = 0
FADIGA_MAX = 6


def _validate_fadiga(value: Any) -> int:
    if isinstance(value, bool) or not isinstance(value, int):
        raise_api_error("FADIGA_INVALIDA", status_code=status.HTTP_422_UNPROCESSABLE_ENTITY)
    if value < FADIGA_MIN or value > FADIGA_MAX:
        raise_api_error(
            "FADIGA_FORA_INTERVALO",
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detalhes={"min": FADIGA_MIN, "max": FADIGA_MAX},
        )
    return value


def _validate_module_value(module: str, value: Any) -> Any:
    if module == "fadiga":
        return _validate_fadiga(value)
    raise_api_error(
        "MODULO_MECANICA_DESCONHECIDO",
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        detalhes={"modulo": module},
    )


def sanitize_extensoes(raw: dict[str, Any] | None, modulos: list[str] | None = None) -> dict[str, Any]:
    """Write path: drop inactive keys silently; validate active keys."""
    active = modulos if modulos is not None else settings.modulos_ativos
    active_set = set(active)
    if not raw:
        return {}
    out: dict[str, Any] = {}
    for key, value in raw.items():
        if key not in active_set:
            continue
        out[key] = _validate_module_value(key, value)
    return out


def filter_extensoes(raw: dict[str, Any] | None, modulos: list[str] | None = None) -> dict[str, Any]:
    """Read path: expose only active module keys."""
    active = modulos if modulos is not None else settings.modulos_ativos
    active_set = set(active)
    if not raw:
        return {}
    return {k: v for k, v in raw.items() if k in active_set}
