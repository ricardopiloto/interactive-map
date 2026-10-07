from __future__ import annotations

from typing import Any

from app.services.stat_blocks.base import StatField, render_characteristics, validate_against

FIELDS: tuple[StatField, ...] = (
    StatField("ca", "CA", "int"),
    StatField("hpr", "HPr", "int"),
    StatField("for", "FOR", "int"),
    StatField("res", "RES", "int"),
    StatField("ini", "IN", "int"),
    StatField("ag", "AG", "int"),
    StatField("des", "DES", "int"),
    StatField("int", "INT", "int"),
    StatField("von", "VON", "int"),
    StatField("cam", "CAM", "int"),
    StatField("pericias", "Perícias", "list[str]"),
    StatField("talentos", "Talentos", "list[str]"),
    StatField("pertences", "Pertences", "list[str]"),
)


def validate(payload: dict[str, Any]) -> dict[str, Any]:
    return validate_against(FIELDS, payload)


def render_markdown(payload: dict[str, Any]) -> str:
    return render_characteristics(FIELDS, validate(payload))
