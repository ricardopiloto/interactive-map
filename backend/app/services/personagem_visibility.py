"""Player-facing visibility helpers for personagens / NPCs."""

from __future__ import annotations

from app.models.npc import NPC


def is_visivel_para_jogador(npc: NPC | None) -> bool:
    """True when the character may appear in public (player) payloads."""
    if npc is None:
        return False
    return bool(getattr(npc, "visivel_para_todos", True))
