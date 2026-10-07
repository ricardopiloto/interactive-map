from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Literal, Protocol

from fastapi import status

from app.errors import raise_api_error

FieldTipo = Literal["int", "str", "list[str]"]


@dataclass(frozen=True)
class StatField:
    nome: str
    rotulo: str
    tipo: FieldTipo


class StatBlockTemplate(Protocol):
    FIELDS: tuple[StatField, ...]

    def validate(self, payload: dict[str, Any]) -> dict[str, Any]: ...

    def render_markdown(self, payload: dict[str, Any]) -> str: ...


def fields_by_name(fields: tuple[StatField, ...]) -> dict[str, StatField]:
    return {field.nome: field for field in fields}


def validate_against(fields: tuple[StatField, ...], payload: dict[str, Any]) -> dict[str, Any]:
    known = fields_by_name(fields)
    cleaned: dict[str, Any] = {}
    for key, value in payload.items():
        field = known.get(key)
        if field is None:
            raise_api_error(
                "STAT_BLOCK_CAMPO_DESCONHECIDO",
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detalhes={"campo": key},
            )
        if value is None or value == "":
            continue
        cleaned[key] = _coerce(field, value)
    return cleaned


def _coerce(field: StatField, value: Any) -> Any:
    if field.tipo == "int":
        if isinstance(value, bool) or not isinstance(value, int):
            raise_api_error(
                "STAT_BLOCK_TIPO_INVALIDO",
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detalhes={"campo": field.nome, "tipo": field.tipo},
            )
        return value
    if field.tipo == "str":
        if not isinstance(value, str):
            raise_api_error(
                "STAT_BLOCK_TIPO_INVALIDO",
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detalhes={"campo": field.nome, "tipo": field.tipo},
            )
        return value
    if not isinstance(value, list) or any(not isinstance(item, str) for item in value):
        raise_api_error(
            "STAT_BLOCK_TIPO_INVALIDO",
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detalhes={"campo": field.nome, "tipo": field.tipo},
        )
    return list(value)


def render_characteristics(fields: tuple[StatField, ...], payload: dict[str, Any]) -> str:
    ints = [field for field in fields if field.tipo == "int" and field.nome in payload]
    lists = [field for field in fields if field.tipo == "list[str]" and payload.get(field.nome)]
    strs = [field for field in fields if field.tipo == "str" and payload.get(field.nome)]
    parts: list[str] = []
    if ints:
        header = "| " + " | ".join(field.rotulo for field in ints) + " |"
        sep = "| " + " | ".join(":-:" for _ in ints) + " |"
        row = "| " + " | ".join(str(payload[field.nome]) for field in ints) + " |"
        parts.append("\n".join((header, sep, row)))
    for field in strs:
        parts.append(f"**{field.rotulo}**\n\n{payload[field.nome]}")
    for field in lists:
        items = "\n".join(f"- {item}" for item in payload[field.nome])
        parts.append(f"**{field.rotulo}**\n\n{items}")
    return "\n\n".join(parts)
