"""Suggest event location and character links from a description. Nothing is persisted."""

from __future__ import annotations

import json
import re

import httpx
from sqlmodel import Session, select

from app.deps.auth import MembroContext
from app.models.local import Local
from app.models.npc import NPC
from app.schemas.evento import SugestaoAssociacoesEventoResponse
from app.services.ia_provider import ItemContextoIa, completar

MSG_FALHA = "Não foi possível sugerir locais e personagens. Revise a seleção manualmente."
MSG_VAZIO = "Nenhum local ou personagem identificado."

PROMPT_PADRAO = """Você identifica locais e personagens presentes na descrição de um evento de RPG.

Regras obrigatórias:
1. Use apenas os locais e personagens do catálogo fornecido. Nunca invente um nome ou um id.
2. Se a descrição não indicar nenhum local ou personagem do catálogo, devolva listas vazias.
3. Responda apenas no formato estruturado solicitado, sem texto fora dessa estrutura.

Formato de saída, JSON sem markdown:
{"local_ids":[1],"personagem_ids":[2]}

A descrição e o catálogo da campanha seguem abaixo."""


def sugerir_associacoes(
    session: Session,
    ctx: MembroContext,
    descricao: str,
    *,
    client: httpx.Client | None = None,
) -> SugestaoAssociacoesEventoResponse:
    texto = descricao.strip()
    if not texto:
        return _falha()

    campanha_id = ctx.campanha.id or 0
    registros = coletar_registros(session, campanha_id, texto)
    resultado = completar(
        ctx=ctx,
        campanha_id=campanha_id,
        modulos_ativos=ctx.campanha.modulos_ativos,
        registros=registros,
        instrucao=PROMPT_PADRAO,
        client=client,
    )
    if not resultado.ok or not resultado.texto:
        return _falha()

    bruto = _ler_ids(resultado.texto)
    if bruto is None:
        return _falha()

    local_ids, personagem_ids = _sanear(session, bruto)
    if not local_ids and not personagem_ids:
        return SugestaoAssociacoesEventoResponse(estado="vazio", mensagem=MSG_VAZIO)
    return SugestaoAssociacoesEventoResponse(
        estado="sugestoes",
        local_ids=local_ids,
        personagem_ids=personagem_ids,
    )


def coletar_registros(session: Session, campanha_id: int, descricao: str) -> list[ItemContextoIa]:
    """Description first, then the campaign catalog. Visibility filtering stays in ia_provider."""
    registros = [
        ItemContextoIa(
            campanha_id=campanha_id,
            tipo="descricao",
            registro_id=0,
            texto=descricao,
            visivel_para_todos=True,
        )
    ]
    for local in session.exec(select(Local).order_by(Local.id)).all():
        if local.id is None:
            continue
        registros.append(
            ItemContextoIa(
                campanha_id=campanha_id,
                tipo="local",
                registro_id=local.id,
                texto=local.nome,
                visivel_para_todos=local.visivel_para_todos,
            )
        )
    for pessoa in session.exec(select(NPC).order_by(NPC.id)).all():
        if pessoa.id is None:
            continue
        registros.append(
            ItemContextoIa(
                campanha_id=campanha_id,
                tipo="personagem",
                registro_id=pessoa.id,
                texto=pessoa.nome,
                visivel_para_todos=pessoa.visivel_para_todos,
            )
        )
    return registros


def _falha() -> SugestaoAssociacoesEventoResponse:
    return SugestaoAssociacoesEventoResponse(estado="falha", mensagem=MSG_FALHA)


def _ler_ids(texto: str) -> dict | None:
    limpo = texto.strip()
    cerca = re.search(r"```(?:json)?\s*(.*?)\s*```", limpo, flags=re.DOTALL)
    if cerca:
        limpo = cerca.group(1).strip()
    try:
        data = json.loads(limpo)
    except json.JSONDecodeError:
        return None
    if not isinstance(data, dict):
        return None
    if not isinstance(data.get("local_ids"), list) or not isinstance(data.get("personagem_ids"), list):
        return None
    return data


def _sanear(session: Session, bruto: dict) -> tuple[list[int], list[int]]:
    locais = {
        row.id
        for row in session.exec(select(Local)).all()
        if row.id is not None and row.visivel_para_todos
    }
    pessoas = {
        row.id
        for row in session.exec(select(NPC)).all()
        if row.id is not None and row.visivel_para_todos
    }
    return _ids_validos(bruto.get("local_ids"), locais), _ids_validos(bruto.get("personagem_ids"), pessoas)


def _ids_validos(valor: object, permitidos: set[int]) -> list[int]:
    if not isinstance(valor, list):
        return []
    saida: list[int] = []
    for item in valor:
        if isinstance(item, bool) or not isinstance(item, int):
            continue
        if item in permitidos and item not in saida:
            saida.append(item)
    return saida
