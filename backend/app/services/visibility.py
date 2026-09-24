"""Player-facing visibility for any entity with visivel_para_todos."""

from __future__ import annotations

from typing import Any


def is_visivel_para_jogador(entity: Any | None) -> bool:
    """True when the entity may appear in public (player) payloads."""
    if entity is None:
        return False
    return bool(getattr(entity, "visivel_para_todos", True))
