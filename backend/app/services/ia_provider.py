"""DeepSeek client shared by future AI features.

Callers must already have passed the campaign owner check (`require_dono`).
This module does not expose an HTTP route.
"""

from __future__ import annotations

import json
from collections.abc import Sequence
from dataclasses import dataclass
from typing import Any

import httpx

from app.config import settings
from app.deps.auth import MembroContext
from app.services.visibility import is_visivel_para_jogador

# Value stored in Campanha.modulos_ativos. Same name as the mestre toggle.
# Naming debt: ia_arcos also governs the writing assistant.
MODULO_IA = "ia_arcos"

IA_OK = "ok"
IA_MODULO_DESABILITADO = "IA_MODULO_DESABILITADO"
IA_NAO_AUTORIZADO = "IA_NAO_AUTORIZADO"
IA_CREDENCIAL_AUSENTE = "IA_CREDENCIAL_AUSENTE"
IA_TIMEOUT = "IA_TIMEOUT"
IA_ERRO_PROVEDOR = "IA_ERRO_PROVEDOR"
IA_RESPOSTA_CORTADA = "IA_RESPOSTA_CORTADA"
IA_CAMPANHAS_MISTURADAS = "IA_CAMPANHAS_MISTURADAS"

_MSG_MODULO = "A IA não está habilitada para essa campanha."
_MSG_AUTORIZACAO = "Apenas o mestre autorizado pode acionar a IA."
_MSG_INDISPONIVEL = "A IA está indisponível."
_MSG_TIMEOUT = "A IA não respondeu a tempo."
_MSG_CAMPANHA = "A chamada de IA aceita dados de uma única campanha."


@dataclass(frozen=True)
class ItemContextoIa:
    """One campaign record that may be sent to the provider after visibility filtering."""

    campanha_id: int
    tipo: str
    registro_id: int
    texto: str
    visivel_para_todos: bool = True


def item_contexto_entidade(campanha_id: int, tipo: str, entidade: Any, texto: str) -> ItemContextoIa:
    """Build a context item using the entity's own visibility."""
    return ItemContextoIa(
        campanha_id=campanha_id,
        tipo=tipo,
        registro_id=entidade.id,
        texto=texto,
        visivel_para_todos=entidade.visivel_para_todos,
    )


@dataclass(frozen=True)
class IaResultado:
    ok: bool
    codigo: str
    mensagem: str
    texto: str | None = None


def modulo_ia_ativo(modulos_ativos: Sequence[Any] | None) -> bool:
    """True when the campaign list contains the IA module. Default is off."""
    active_set = {item for item in (modulos_ativos or []) if isinstance(item, str)}
    return MODULO_IA in active_set


def montar_contexto(
    campanha_id: int,
    registros: Sequence[ItemContextoIa],
    *,
    incluir_ocultos: bool = False,
) -> list[dict[str, Any]]:
    """Filter one campaign. Direct calls do not authorize hidden access; hidden rows get ``oculto`` only when included."""
    if any(item.campanha_id != campanha_id for item in registros):
        raise ValueError(IA_CAMPANHAS_MISTURADAS)
    return [
        {
            "campanha_id": item.campanha_id,
            "tipo": item.tipo,
            "id": item.registro_id,
            "texto": item.texto,
            **({"oculto": True} if incluir_ocultos and not is_visivel_para_jogador(item) else {}),
        }
        for item in registros
        if incluir_ocultos or is_visivel_para_jogador(item)
    ]


def completar(
    *,
    ctx: MembroContext | None,
    campanha_id: int,
    modulos_ativos: Sequence[Any] | None,
    registros: Sequence[ItemContextoIa],
    instrucao: str,
    client: httpx.Client | None = None,
    incluir_ocultos: bool = False,
    max_tokens: int | None = None,
    timeout: float | None = None,
) -> IaResultado:
    """Call DeepSeek for one campaign. Never persists data and never calls the network on refusal."""
    if not _mestre_autorizado(ctx, campanha_id):
        return _falha(IA_NAO_AUTORIZADO, _MSG_AUTORIZACAO)
    if not modulo_ia_ativo(modulos_ativos):
        return _falha(IA_MODULO_DESABILITADO, _MSG_MODULO)
    try:
        contexto = montar_contexto(campanha_id, registros, incluir_ocultos=incluir_ocultos)
    except ValueError:
        return _falha(IA_CAMPANHAS_MISTURADAS, _MSG_CAMPANHA)

    chave = settings.deepseek_api_key
    if not chave:
        return _falha(IA_CREDENCIAL_AUSENTE, _MSG_INDISPONIVEL)

    payload = {
        "model": settings.deepseek_model,
        "messages": [
            {"role": "system", "content": instrucao},
            {"role": "user", "content": json.dumps(contexto, ensure_ascii=False)},
        ],
    }
    if max_tokens is not None:
        payload["max_tokens"] = max_tokens
    try:
        response = _post(payload, chave, client, timeout=timeout)
    except httpx.TimeoutException:
        return _falha(IA_TIMEOUT, _MSG_TIMEOUT)
    except httpx.HTTPError:
        return _falha(IA_ERRO_PROVEDOR, _MSG_INDISPONIVEL)

    if response.status_code == 401:
        return _falha(IA_CREDENCIAL_AUSENTE, _MSG_INDISPONIVEL)
    if response.status_code >= 400:
        return _falha(IA_ERRO_PROVEDOR, _MSG_INDISPONIVEL)
    texto = _texto_resposta(response)
    if texto is None:
        try:
            if response.json()["choices"][0]["finish_reason"] == "length":
                return _falha(IA_RESPOSTA_CORTADA, _MSG_INDISPONIVEL)
        except (KeyError, IndexError, TypeError, ValueError):
            pass
        return _falha(IA_ERRO_PROVEDOR, _MSG_INDISPONIVEL)
    return IaResultado(ok=True, codigo=IA_OK, mensagem="", texto=texto)


def _mestre_autorizado(ctx: MembroContext | None, campanha_id: int) -> bool:
    """Same gate as admin routes: session member with papel dono of this campaign."""
    if ctx is None:
        return False
    if ctx.membro.papel != "dono":
        return False
    return ctx.campanha.id == campanha_id


def _falha(codigo: str, mensagem: str) -> IaResultado:
    return IaResultado(ok=False, codigo=codigo, mensagem=mensagem, texto=None)


def _post(
    payload: dict[str, Any], chave: str, client: httpx.Client | None,
    *, timeout: float | None = None,
) -> httpx.Response:
    url = f"{settings.deepseek_base_url.rstrip('/')}/chat/completions"
    headers = {"Authorization": f"Bearer {chave}"}
    if client is not None:
        return client.post(url, json=payload, headers=headers)
    effective_timeout = httpx.Timeout(
        timeout if timeout is not None else settings.deepseek_timeout_seconds
    )
    with httpx.Client(timeout=effective_timeout) as owned:
        return owned.post(url, json=payload, headers=headers)


def _texto_resposta(response: httpx.Response) -> str | None:
    try:
        data = response.json()
        texto = data["choices"][0]["message"]["content"]
    except (KeyError, IndexError, TypeError, ValueError):
        return None
    if not isinstance(texto, str) or not texto.strip():
        return None
    return texto
