"""Closed genre palette (spec 111) — replaces accent_palette."""

from __future__ import annotations

GENRE_IDS = frozenset({"fantasia", "gotico", "scifi", "urbano"})

DEFAULT_GENRE = "fantasia"


def normalize_genero(value: str | None) -> str:
    if value is None or value == "":
        raise ValueError("GENERO_OBRIGATORIO")
    if value not in GENRE_IDS:
        raise ValueError("GENERO_INVALIDO")
    return value


def genero_from_legacy(sistema: str | None, acento_id: str | None) -> str:
    """Backfill / import mapping from pre-111 sistema+acento_id."""
    sistema_n = (sistema or "").strip().lower()
    acento = (acento_id or "").strip().lower() or None

    if sistema_n == "wfrp4e" and acento in (None, "latao"):
        return "fantasia"
    if sistema_n == "wod" and acento == "vinho":
        return "gotico"
    if acento == "vinho":
        return "gotico"
    return DEFAULT_GENRE
