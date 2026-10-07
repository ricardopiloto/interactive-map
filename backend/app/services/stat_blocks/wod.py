from __future__ import annotations

from typing import Any

from app.services.stat_blocks.base import StatField, render_characteristics, validate_against

FIELDS: tuple[StatField, ...] = (
    StatField("forca", "Força", "int"),
    StatField("destreza", "Destreza", "int"),
    StatField("vigor", "Vigor", "int"),
    StatField("carisma", "Carisma", "int"),
    StatField("manipulacao", "Manipulação", "int"),
    StatField("aparencia", "Aparência", "int"),
    StatField("percepcao", "Percepção", "int"),
    StatField("inteligencia", "Inteligência", "int"),
    StatField("raciocinio", "Raciocínio", "int"),
    StatField("forca_vontade", "Força de Vontade", "int"),
    StatField("vitalidade", "Vitalidade", "int"),
    StatField("habilidades", "Habilidades", "list[str]"),
    StatField("poderes", "Poderes", "list[str]"),
    StatField("equipamento", "Equipamento", "list[str]"),
)


def validate(payload: dict[str, Any]) -> dict[str, Any]:
    return validate_against(FIELDS, payload)


def render_markdown(payload: dict[str, Any]) -> str:
    return render_characteristics(FIELDS, validate(payload))
