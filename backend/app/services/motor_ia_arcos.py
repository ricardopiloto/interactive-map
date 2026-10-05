"""Arc proposals from campaign sessions. Persistence stays on the manual arc create path."""

from __future__ import annotations

import json
import re
from collections import defaultdict

import httpx
from sqlmodel import Session, select

from app.deps.auth import MembroContext
from app.models.links import SessaoLocalLink, SessaoNpcLink
from app.models.local import Local
from app.models.npc import NPC
from app.models.sessao import Sessao
from app.schemas.arco import ProporArcosResponse, PropostaArcoRead
from app.services.ia_provider import ItemContextoIa, completar, montar_contexto

MIN_SESSOES_PARA_PROPOSTA = 2

MSG_FALHA = "Não foi possível gerar proposta, use a criação manual."
MSG_INSUFICIENTE = "Não há sessões suficientes para propor um arco. Use a criação manual."

# Fixed prompt. The five numbered rules are normative (see motor-ia-arcos design).
PROMPT_PADRAO = """Você é um assistente que ajuda mestres de RPG de mesa a identificar arcos
narrativos dentro de uma campanha.

Sua tarefa: ler os resumos de sessão fornecidos a seguir (com os locais e
personagens associados a cada uma) e propor um ou mais arcos narrativos
candidatos — agrupamentos de sessões que formam um fio de história coerente.

Regras obrigatórias:
1. Use apenas as sessões, locais e personagens fornecidos nos dados abaixo.
   Nunca invente ou presuma uma sessão, local, personagem ou evento que não
   esteja explicitamente na lista fornecida.
2. Cada sessão pertence a no máximo um arco proposto, exceto quando você
   identificar uma sessão de transição (encerra um arco e inicia o
   seguinte) — nesse caso, identifique-a explicitamente como transição.
3. Se não houver sinal narrativo suficiente para propor um arco coerente,
   responda com uma lista vazia em vez de forçar um agrupamento artificial.
4. Para cada arco proposto, retorne: título curto, resumo de 1 a 3 frases,
   a lista de números de sessão incluídos, e os locais sugeridos (apenas
   entre os fornecidos).
5. Responda apenas no formato estruturado solicitado, sem texto
   explicativo fora dessa estrutura.

Formato de saída, JSON sem markdown:
{"propostas":[{"titulo":"string","resumo":"string","sessoes":[1],"sessao_transicao":null,"locais":["Nome do local"]}]}
sessoes e sessao_transicao usam o número da sessão. locais usa o nome exato. sessao_transicao é null quando não há transição.

Os dados da campanha (sessões, resumos e associações) seguem abaixo."""

_REGRAS_OBRIGATORIAS = (
    "Nunca invente ou presuma uma sessão",
    "identifique-a explicitamente como transição",
    "responda com uma lista vazia",
    "retorne: título curto",
    "formato estruturado solicitado",
)


def prompt_tem_regras_obrigatorias(texto: str = PROMPT_PADRAO) -> bool:
    return all(regra in texto for regra in _REGRAS_OBRIGATORIAS)


def coletar_registros(session: Session, campanha_id: int) -> list[ItemContextoIa]:
    """Raw records for one campaign. Visibility filtering is left to ia_provider."""
    sessoes = list(session.exec(select(Sessao).order_by(Sessao.numero)).all())
    locais = {row.id: row for row in session.exec(select(Local)).all() if row.id is not None}
    npcs = {row.id: row for row in session.exec(select(NPC)).all() if row.id is not None}
    locais_por_sessao: dict[int, list[int]] = defaultdict(list)
    npcs_por_sessao: dict[int, list[int]] = defaultdict(list)
    for link in session.exec(select(SessaoLocalLink)).all():
        locais_por_sessao[link.sessao_id].append(link.local_id)
    for link in session.exec(select(SessaoNpcLink)).all():
        npcs_por_sessao[link.sessao_id].append(link.npc_id)

    registros: list[ItemContextoIa] = []
    for sessao in sessoes:
        if sessao.id is None:
            continue
        registros.append(
            ItemContextoIa(
                campanha_id=campanha_id,
                tipo="sessao",
                registro_id=sessao.id,
                texto=f"Sessão {sessao.numero}: {sessao.titulo}\nResumo: {sessao.resumo}",
                visivel_para_todos=sessao.visivel_para_todos,
            )
        )
        for local_id in locais_por_sessao[sessao.id]:
            local = locais.get(local_id)
            if local is None or local.id is None:
                continue
            registros.append(
                ItemContextoIa(
                    campanha_id=campanha_id,
                    tipo="local",
                    registro_id=local.id,
                    texto=f"Sessão {sessao.numero} local: {local.nome}",
                    visivel_para_todos=sessao.visivel_para_todos and local.visivel_para_todos,
                )
            )
        for npc_id in npcs_por_sessao[sessao.id]:
            npc = npcs.get(npc_id)
            if npc is None or npc.id is None:
                continue
            registros.append(
                ItemContextoIa(
                    campanha_id=campanha_id,
                    tipo="personagem",
                    registro_id=npc.id,
                    texto=f"Sessão {sessao.numero} personagem: {npc.nome}",
                    visivel_para_todos=sessao.visivel_para_todos and npc.visivel_para_todos,
                )
            )
    return registros


def contexto_para_motor(session: Session, campanha_id: int) -> list[dict]:
    """Context actually sent onward. Hidden rows are removed by ia_provider."""
    return montar_contexto(campanha_id, coletar_registros(session, campanha_id))


def propor_arcos(
    session: Session,
    ctx: MembroContext,
    *,
    client: httpx.Client | None = None,
) -> ProporArcosResponse:
    campanha_id = ctx.campanha.id
    if campanha_id is None:
        return _falha()
    registros = coletar_registros(session, campanha_id)
    try:
        contexto = montar_contexto(campanha_id, registros)
    except ValueError:
        return _falha()
    if sum(1 for item in contexto if item["tipo"] == "sessao") < MIN_SESSOES_PARA_PROPOSTA:
        return ProporArcosResponse(estado="sessoes_insuficientes", mensagem=MSG_INSUFICIENTE)

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

    brutas = _ler_propostas(resultado.texto)
    if brutas is None:
        return _falha()
    if len(brutas) == 0:
        return ProporArcosResponse(estado="sessoes_insuficientes", mensagem=MSG_INSUFICIENTE)

    propostas = _sanear_propostas(session, brutas)
    if not propostas:
        return _falha()
    return ProporArcosResponse(estado="propostas", propostas=propostas)


def _falha() -> ProporArcosResponse:
    return ProporArcosResponse(estado="falha", mensagem=MSG_FALHA)


def _ler_propostas(texto: str) -> list[dict] | None:
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
    propostas = data.get("propostas")
    if not isinstance(propostas, list):
        return None
    return [item for item in propostas if isinstance(item, dict)]


def _sanear_propostas(session: Session, brutas: list[dict]) -> list[PropostaArcoRead]:
    sessoes = {
        row.numero: row
        for row in session.exec(select(Sessao)).all()
        if row.id is not None
    }
    locais = {
        row.nome: row.id
        for row in session.exec(select(Local)).all()
        if row.id is not None and row.nome
    }
    saida: list[PropostaArcoRead] = []
    for bruta in brutas:
        proposta = _sanear_uma(bruta, sessoes, locais)
        if proposta is not None:
            saida.append(proposta)
    return saida


def _sanear_uma(
    bruta: dict,
    sessoes: dict[int, Sessao],
    locais: dict[str, int],
) -> PropostaArcoRead | None:
    titulo = str(bruta.get("titulo") or "").strip()[:200]
    if not titulo:
        return None
    resumo = str(bruta.get("resumo") or "").strip()[:5000]
    sessao_ids: list[int] = []
    for numero in _numeros(bruta.get("sessoes")):
        row = sessoes.get(numero)
        if row is None or row.id is None or row.arco_id is not None:
            continue
        if row.id not in sessao_ids:
            sessao_ids.append(row.id)

    transicao_id: int | None = None
    numeros_transicao = _numeros(bruta.get("sessao_transicao"))
    if numeros_transicao:
        row = sessoes.get(numeros_transicao[0])
        if row is not None and row.id is not None and row.arco_transicao_id is None:
            if row.arco_id is not None or row.id not in sessao_ids:
                transicao_id = row.id
                sessao_ids = [item for item in sessao_ids if item != row.id]

    local_ids: list[int] = []
    for nome in bruta.get("locais") or []:
        if not isinstance(nome, str):
            continue
        local_id = locais.get(nome.strip())
        if local_id is not None and local_id not in local_ids:
            local_ids.append(local_id)

    if not sessao_ids and transicao_id is None:
        return None
    return PropostaArcoRead(
        titulo=titulo,
        resumo=resumo,
        sessao_ids=sessao_ids,
        sessao_transicao_id=transicao_id,
        local_ids=local_ids,
    )


def _numeros(valor: object) -> list[int]:
    if isinstance(valor, bool) or valor is None:
        return []
    if isinstance(valor, int):
        return [valor]
    if isinstance(valor, list):
        numeros: list[int] = []
        for item in valor:
            if isinstance(item, bool):
                continue
            if isinstance(item, int):
                numeros.append(item)
            elif isinstance(item, str) and item.strip().isdigit():
                numeros.append(int(item.strip()))
        return numeros
    return []
