"""Player-facing visibility helpers for personagens / NPCs.

Re-exports the shared helper so existing imports keep working.
Prefer `app.services.visibility` for new call sites.
"""

from __future__ import annotations

from app.services.visibility import is_visivel_para_jogador

__all__ = ["is_visivel_para_jogador"]
