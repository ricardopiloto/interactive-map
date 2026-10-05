"""First-appearance aggregation for the "Por descoberta" timeline mode.

Chronological key (earlier first), aligned with the existing event order
(ano, mês with nulls last, sessão.numero with nulls last) and a stable
tie-break that places a session before an event that shares its slot:

    (ano, mês ou 13, numero da sessão ou um sentinela, 0=sessão/1=evento, id)

A session with no in-world year inherits the earliest event that points at it.
A session with neither a year nor a linked event sorts after every dated record,
ordered by numero among those undated sessions.
"""

from __future__ import annotations

from collections import defaultdict
from dataclasses import dataclass

from sqlmodel import Session, select

from app.models.evento import Evento
from app.models.item import Item
from app.models.links import (
    EventoLocalLink,
    EventoNpcLink,
    ItemEventoLink,
    ItemSessaoLink,
    SessaoLocalLink,
    SessaoNpcLink,
)
from app.models.local import Local
from app.models.npc import NPC
from app.models.sessao import Sessao
from app.schemas.descoberta import (
    AlertaInconsistencia,
    AparicaoAdmin,
    AparicaoPublic,
    DescobertaAdmin,
    DescobertaPublic,
    EntidadeDescobertaAdmin,
    EntidadeDescobertaPublic,
    IntervaloAparicao,
)
from app.services.visibility import is_visivel_para_jogador

_ANO_SEM_DATA = 10**9
_MES_DESCONHECIDO = 13
_NUMERO_SEM_SESSAO = 10**9
_TIPO_ORDEM = {"personagem": 0, "local": 1, "faccao": 2, "item": 3}


@dataclass(frozen=True)
class _Chave:
    ano: int
    mes: int
    numero: int
    tipo_rank: int
    id: int

    def as_tuple(self) -> tuple[int, int, int, int, int]:
        return (self.ano, self.mes, self.numero, self.tipo_rank, self.id)


@dataclass
class _Bruta:
    origem: str
    id: int
    titulo: str
    numero: int | None
    ano: int | None
    mes: int | None
    visivel: bool
    chave: _Chave


def _mes_ord(mes: int | None) -> int:
    return mes if mes is not None else _MES_DESCONHECIDO


def _mes_duracao(mes: int) -> int:
    return mes if 1 <= mes <= 12 else 1


def _ancora_sessao(sessao: Sessao, eventos_da_sessao: list[Evento]) -> tuple[int, int]:
    if not eventos_da_sessao:
        return (_ANO_SEM_DATA, _MES_DESCONHECIDO)
    melhor = min(eventos_da_sessao, key=lambda e: (e.ano, _mes_ord(e.mes), e.id or 0))
    return (melhor.ano, _mes_ord(melhor.mes))


def _chave_sessao(sessao: Sessao, eventos_da_sessao: list[Evento]) -> _Chave:
    ano, mes = _ancora_sessao(sessao, eventos_da_sessao)
    return _Chave(ano, mes, sessao.numero, 0, sessao.id or 0)


def _chave_evento(evento: Evento, numero: int | None) -> _Chave:
    return _Chave(
        evento.ano,
        _mes_ord(evento.mes),
        numero if numero is not None else _NUMERO_SEM_SESSAO,
        1,
        evento.id or 0,
    )


def _intervalo(anterior: _Bruta, atual: _Bruta) -> IntervaloAparicao:
    anos = 0
    meses = 0
    if anterior.chave.ano < _ANO_SEM_DATA and atual.chave.ano < _ANO_SEM_DATA:
        total = (atual.chave.ano * 12 + _mes_duracao(atual.chave.mes)) - (
            anterior.chave.ano * 12 + _mes_duracao(anterior.chave.mes)
        )
        if total < 0:
            total = 0
        anos, meses = divmod(total, 12)
    sessoes: int | None = None
    if (
        anterior.numero is not None
        and atual.numero is not None
        and atual.numero >= anterior.numero
    ):
        sessoes = atual.numero - anterior.numero
    return IntervaloAparicao(anos=anos, meses=meses, sessoes=sessoes)


def _grafia_legivel(variantes: list[str]) -> str:
    def rank(value: str) -> tuple[int, int]:
        stripped = value.strip()
        caps = sum(1 for ch in stripped if ch.isupper())
        return (caps, len(stripped))

    best = max(rank(v) for v in variantes)
    candidates = sorted({v.strip() for v in variantes if rank(v) == best})
    return candidates[0]


def _carregar(session: Session) -> dict[str, object]:
    sessoes = [s for s in session.exec(select(Sessao)).all() if s.id is not None]
    eventos = [e for e in session.exec(select(Evento)).all() if e.id is not None]
    locais = {row.id: row for row in session.exec(select(Local)).all() if row.id is not None}
    npcs = {row.id: row for row in session.exec(select(NPC)).all() if row.id is not None}
    itens = {row.id: row for row in session.exec(select(Item)).all() if row.id is not None}
    eventos_por_sessao: dict[int, list[Evento]] = defaultdict(list)
    for evento in eventos:
        if evento.sessao_id is not None:
            eventos_por_sessao[evento.sessao_id].append(evento)
    sessao_por_id = {s.id: s for s in sessoes}
    return {
        "sessoes": sessoes,
        "eventos": eventos,
        "locais": locais,
        "npcs": npcs,
        "itens": itens,
        "eventos_por_sessao": eventos_por_sessao,
        "sessao_por_id": sessao_por_id,
        "sessao_npc": list(session.exec(select(SessaoNpcLink)).all()),
        "sessao_local": list(session.exec(select(SessaoLocalLink)).all()),
        "evento_npc": list(session.exec(select(EventoNpcLink)).all()),
        "evento_local": list(session.exec(select(EventoLocalLink)).all()),
        "item_sessao": list(session.exec(select(ItemSessaoLink)).all()),
        "item_evento": list(session.exec(select(ItemEventoLink)).all()),
    }


def _bruta_sessao(sessao: Sessao, eventos_da_sessao: list[Evento]) -> _Bruta:
    ano, mes = _ancora_sessao(sessao, eventos_da_sessao)
    return _Bruta(
        origem="sessao",
        id=sessao.id or 0,
        titulo=sessao.titulo,
        numero=sessao.numero,
        ano=None if ano >= _ANO_SEM_DATA else ano,
        mes=None if mes >= _MES_DESCONHECIDO else mes,
        visivel=is_visivel_para_jogador(sessao),
        chave=_chave_sessao(sessao, eventos_da_sessao),
    )


def _bruta_evento(evento: Evento, numero: int | None) -> _Bruta:
    return _Bruta(
        origem="evento",
        id=evento.id or 0,
        titulo=evento.titulo,
        numero=numero,
        ano=evento.ano,
        mes=evento.mes,
        visivel=is_visivel_para_jogador(evento),
        chave=_chave_evento(evento, numero),
    )


def _dedupe_sort(brutas: list[_Bruta], *, apenas_visiveis: bool) -> list[_Bruta]:
    seen: set[tuple[str, int]] = set()
    out: list[_Bruta] = []
    for bruta in brutas:
        if apenas_visiveis and not bruta.visivel:
            continue
        key = (bruta.origem, bruta.id)
        if key in seen:
            continue
        seen.add(key)
        out.append(bruta)
    out.sort(key=lambda b: b.chave.as_tuple())
    return out


def _para_publica(brutas: list[_Bruta]) -> list[AparicaoPublic]:
    aparicoes: list[AparicaoPublic] = []
    for index, bruta in enumerate(brutas):
        aparicoes.append(
            AparicaoPublic(
                origem=bruta.origem,  # type: ignore[arg-type]
                id=bruta.id,
                titulo=bruta.titulo,
                numero=bruta.numero,
                ano=bruta.ano,
                mes=bruta.mes,
                reaparicao=index > 0,
                intervalo=_intervalo(brutas[index - 1], bruta) if index > 0 else None,
            )
        )
    return aparicoes


def _para_admin(brutas: list[_Bruta]) -> list[AparicaoAdmin]:
    aparicoes: list[AparicaoAdmin] = []
    for index, bruta in enumerate(brutas):
        aparicoes.append(
            AparicaoAdmin(
                origem=bruta.origem,  # type: ignore[arg-type]
                id=bruta.id,
                titulo=bruta.titulo,
                numero=bruta.numero,
                ano=bruta.ano,
                mes=bruta.mes,
                visivel_para_todos=bruta.visivel,
                reaparicao=index > 0,
                intervalo=_intervalo(brutas[index - 1], bruta) if index > 0 else None,
            )
        )
    return aparicoes


def alertas_por_sessao(session: Session) -> dict[int, list[AlertaInconsistencia]]:
    """Characters on a visible session who also appear in an earlier hidden session."""
    dados = _carregar(session)
    sessoes: list[Sessao] = dados["sessoes"]  # type: ignore[assignment]
    npcs: dict[int, NPC] = dados["npcs"]  # type: ignore[assignment]
    por_npc: dict[int, list[Sessao]] = defaultdict(list)
    sessao_por_id: dict[int, Sessao] = dados["sessao_por_id"]  # type: ignore[assignment]
    for link in dados["sessao_npc"]:  # type: ignore[union-attr]
        sessao = sessao_por_id.get(link.sessao_id)
        if sessao is not None:
            por_npc[link.npc_id].append(sessao)
    out: dict[int, list[AlertaInconsistencia]] = defaultdict(list)
    for npc_id, rows in por_npc.items():
        npc = npcs.get(npc_id)
        if npc is None:
            continue
        ocultas = [s for s in rows if not s.visivel_para_todos and s.id is not None]
        for visivel in rows:
            if not visivel.visivel_para_todos or visivel.id is None:
                continue
            for oculta in ocultas:
                if oculta.numero >= visivel.numero or oculta.id is None:
                    continue
                out[visivel.id].append(
                    AlertaInconsistencia(
                        personagem_id=npc_id,
                        personagem_nome=npc.nome,
                        sessao_visivel_id=visivel.id,
                        sessao_visivel_numero=visivel.numero,
                        sessao_oculta_id=oculta.id,
                        sessao_oculta_numero=oculta.numero,
                        sessao_oculta_titulo=oculta.titulo,
                    )
                )
    _ = sessoes
    return dict(out)


def _entidades(session: Session, *, apenas_visiveis: bool) -> list[dict]:
    dados = _carregar(session)
    eventos: list[Evento] = dados["eventos"]  # type: ignore[assignment]
    locais: dict[int, Local] = dados["locais"]  # type: ignore[assignment]
    npcs: dict[int, NPC] = dados["npcs"]  # type: ignore[assignment]
    itens: dict[int, Item] = dados["itens"]  # type: ignore[assignment]
    eventos_por_sessao: dict[int, list[Evento]] = dados["eventos_por_sessao"]  # type: ignore[assignment]
    sessao_por_id: dict[int, Sessao] = dados["sessao_por_id"]  # type: ignore[assignment]
    evento_por_id = {e.id: e for e in eventos if e.id is not None}

    def sessao_ok(sessao_id: int) -> Sessao | None:
        return sessao_por_id.get(sessao_id)

    def evento_ok(evento_id: int) -> Evento | None:
        return evento_por_id.get(evento_id)

    por_personagem: dict[int, list[_Bruta]] = defaultdict(list)
    por_local: dict[int, list[_Bruta]] = defaultdict(list)
    por_item: dict[int, list[_Bruta]] = defaultdict(list)

    for link in dados["sessao_npc"]:  # type: ignore[union-attr]
        sessao = sessao_ok(link.sessao_id)
        if sessao is None or link.npc_id not in npcs:
            continue
        por_personagem[link.npc_id].append(_bruta_sessao(sessao, eventos_por_sessao.get(sessao.id or 0, [])))
    for link in dados["evento_npc"]:  # type: ignore[union-attr]
        evento = evento_ok(link.evento_id)
        if evento is None or link.npc_id not in npcs:
            continue
        numero = sessao_por_id[evento.sessao_id].numero if evento.sessao_id in sessao_por_id else None
        por_personagem[link.npc_id].append(_bruta_evento(evento, numero))
    for link in dados["sessao_local"]:  # type: ignore[union-attr]
        sessao = sessao_ok(link.sessao_id)
        if sessao is None or link.local_id not in locais:
            continue
        por_local[link.local_id].append(_bruta_sessao(sessao, eventos_por_sessao.get(sessao.id or 0, [])))
    for link in dados["evento_local"]:  # type: ignore[union-attr]
        evento = evento_ok(link.evento_id)
        if evento is None or link.local_id not in locais:
            continue
        numero = sessao_por_id[evento.sessao_id].numero if evento.sessao_id in sessao_por_id else None
        por_local[link.local_id].append(_bruta_evento(evento, numero))
    for link in dados["item_sessao"]:  # type: ignore[union-attr]
        sessao = sessao_ok(link.sessao_id)
        if sessao is None or link.item_id not in itens:
            continue
        por_item[link.item_id].append(_bruta_sessao(sessao, eventos_por_sessao.get(sessao.id or 0, [])))
    for link in dados["item_evento"]:  # type: ignore[union-attr]
        evento = evento_ok(link.evento_id)
        if evento is None or link.item_id not in itens:
            continue
        numero = sessao_por_id[evento.sessao_id].numero if evento.sessao_id in sessao_por_id else None
        por_item[link.item_id].append(_bruta_evento(evento, numero))

    entidades: list[dict] = []

    def adicionar(tipo: str, entidade_id: int | None, nome: str, descricao: str | None, brutas: list[_Bruta], visivel_entidade: bool) -> None:
        if apenas_visiveis and not visivel_entidade:
            return
        ordenadas = _dedupe_sort(brutas, apenas_visiveis=apenas_visiveis)
        if not ordenadas:
            return
        entidades.append(
            {
                "tipo": tipo,
                "id": entidade_id,
                "nome": nome,
                "descricao": descricao,
                "aparicoes": ordenadas,
                "chave": ordenadas[0].chave.as_tuple(),
            }
        )

    for npc_id, brutas in por_personagem.items():
        npc = npcs[npc_id]
        adicionar("personagem", npc_id, npc.nome, None, brutas, is_visivel_para_jogador(npc))
    for local_id, brutas in por_local.items():
        local = locais[local_id]
        adicionar("local", local_id, local.nome, None, brutas, is_visivel_para_jogador(local))
    for item_id, brutas in por_item.items():
        item = itens[item_id]
        adicionar("item", item_id, item.nome, item.descricao or "", brutas, is_visivel_para_jogador(item))

    faccoes: dict[str, dict] = {}
    for npc in npcs.values():
        bruto = (npc.faccao or "").strip()
        if not bruto:
            continue
        if apenas_visiveis and not is_visivel_para_jogador(npc):
            continue
        chave = bruto.casefold()
        grupo = faccoes.setdefault(chave, {"variantes": [], "brutas": []})
        grupo["variantes"].append(npc.faccao or bruto)
        grupo["brutas"].extend(por_personagem.get(npc.id or 0, []))
    for grupo in faccoes.values():
        adicionar(
            "faccao",
            None,
            _grafia_legivel(grupo["variantes"]),
            None,
            grupo["brutas"],
            True,
        )

    entidades.sort(key=lambda e: (e["chave"], _TIPO_ORDEM[e["tipo"]], e["nome"].casefold()))
    return entidades


def list_public(session: Session) -> DescobertaPublic:
    entidades = []
    for row in _entidades(session, apenas_visiveis=True):
        entidades.append(
            EntidadeDescobertaPublic(
                tipo=row["tipo"],
                id=row["id"],
                nome=row["nome"],
                descricao=row["descricao"],
                aparicoes=_para_publica(row["aparicoes"]),
            )
        )
    return DescobertaPublic(entidades=entidades)


def list_admin(session: Session) -> DescobertaAdmin:
    entidades = []
    for row in _entidades(session, apenas_visiveis=False):
        entidades.append(
            EntidadeDescobertaAdmin(
                tipo=row["tipo"],
                id=row["id"],
                nome=row["nome"],
                descricao=row["descricao"],
                aparicoes=_para_admin(row["aparicoes"]),
            )
        )
    alertas: list[AlertaInconsistencia] = []
    for itens in alertas_por_sessao(session).values():
        alertas.extend(itens)
    alertas.sort(key=lambda a: (a.sessao_visivel_numero, a.personagem_nome.casefold(), a.sessao_oculta_numero))
    return DescobertaAdmin(entidades=entidades, alertas=alertas)
