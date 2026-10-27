"""Coleta e orçamento de contexto compartilhados pelos motores de escrita."""
from __future__ import annotations
import json
from dataclasses import replace
from sqlmodel import Session, select
from app.config import settings
from app.models.arco import Arco
from app.models.evento import Evento
from app.models.fio_narrativo import FioNarrativo
from app.models.links import LocalConexaoLink, SessaoLocalLink, SessaoNpcLink
from app.models.local import Local
from app.models.npc import NPC
from app.models.sessao import Sessao
from app.schemas.ia_assistente import AssistirRequest
from app.services.ia_provider import ItemContextoIa, item_contexto_entidade, montar_contexto
MAX_REGISTRO_CHARS = 1500

def _item(campanha_id: int, tipo: str, entidade, texto: str) -> ItemContextoIa:
    return item_contexto_entidade(campanha_id, tipo, entidade, texto[:MAX_REGISTRO_CHARS])


def _texto_sessao(sessao: Sessao) -> str:
    texto = sessao.resumo or sessao.notas_preparo
    titulo = f"Sessão {sessao.numero}: {sessao.titulo}"
    return f"{titulo}; {texto}" if texto else titulo


def coletar_registros(session: Session, campanha_id: int, pedido: AssistirRequest, alvo) -> list[ItemContextoIa]:
    sessoes = list(session.exec(select(Sessao).order_by(Sessao.id.desc())).all())
    arcos = list(session.exec(select(Arco).order_by(Arco.id.desc())).all())
    eventos = list(session.exec(select(Evento).order_by(Evento.id.desc())).all())
    pessoas = list(session.exec(select(NPC).order_by(NPC.id.desc())).all())
    locais = list(session.exec(select(Local).order_by(Local.id.desc())).all())
    registros: list[ItemContextoIa] = []

    def add(tipo, rows, texto):
        registros.extend(
            _item(campanha_id, tipo, row, texto(row))
            for row in rows
            if row.id is not None
        )

    def arco_rows(ids):
        return [a for a in arcos if a.id in ids]

    if pedido.tipo == "rascunho_sessao":
        sessoes_contexto = (
            [s for s in sessoes if s.id != getattr(alvo, "id", None)]
            if pedido.tipo == "rascunho_sessao" else sessoes
        )
        add("sessao", sessoes_contexto, _texto_sessao)
        add("arco", arcos, lambda a: f"{a.titulo}: {a.resumo}")
        if pedido.tipo == "rascunho_sessao":
            anteriores = [
                s for s in sessoes
                if s.id != getattr(alvo, "id", None) and s.notas_preparo
            ]
            add(
                "notas_preparo_anterior", anteriores,
                lambda s: f"Sessão {s.numero}: {s.notas_preparo}",
            )
        add("evento", eventos, lambda e: f"{e.titulo}: {e.descricao}")
        add("personagem", pessoas, lambda p: f"{p.nome}; papel: {p.papel}; facção: {p.faccao}; {p.descricao}")
        add("local", locais, lambda l: f"{l.nome}: {l.descricao}")
        if pedido.tipo == "rascunho_sessao":
            add("faccao", [p for p in pessoas if p.faccao], lambda p: f"{p.faccao}; personagem: {p.nome}")
    elif pedido.tipo == "resumo_sessao":
        if alvo is None:
            add("sessao_anterior", sessoes, _texto_sessao)
            add("arco", arcos, lambda a: f"{a.titulo}: {a.resumo}")
            add("evento", eventos, lambda e: f"{e.titulo}: {e.descricao}")
            add("personagem", pessoas, lambda p: f"{p.nome}: {p.descricao}")
            add("local", locais, lambda l: f"{l.nome}: {l.descricao}")
            return sorted(registros, key=lambda r: -r.registro_id)
        add("notas_preparo", [alvo], lambda s: f"Sessão {s.numero}: {s.notas_preparo}")
        locais_ligados = session.exec(
            select(SessaoLocalLink).where(SessaoLocalLink.sessao_id == alvo.id)
        ).all()
        pessoas_ligadas = session.exec(
            select(SessaoNpcLink).where(SessaoNpcLink.sessao_id == alvo.id)
        ).all()
        lid = {x.local_id for x in locais_ligados}
        pid = {x.npc_id for x in pessoas_ligadas}
        add("personagem", [p for p in pessoas if p.id in pid], lambda p: f"{p.nome}: {p.descricao}")
        add("local", [l for l in locais if l.id in lid], lambda l: f"{l.nome}: {l.descricao}")
        add("arco", arco_rows({alvo.arco_id, alvo.arco_transicao_id}), lambda a: f"{a.titulo}: {a.resumo}")
        anteriores = [s for s in sessoes if s.numero < alvo.numero][:1]
        add("sessao_anterior", anteriores, _texto_sessao)
    elif pedido.tipo == "descricao_personagem":
        if alvo is None:
            add("personagem", pessoas, lambda p: f"{p.nome}: {p.descricao}")
            add("local", locais, lambda l: f"{l.nome}: {l.descricao}")
            add("arco", arcos, lambda a: f"{a.titulo}: {a.resumo}")
            return sorted(registros, key=lambda r: -r.registro_id)
        add(
            "personagem_alvo", [alvo],
            lambda p: (
                f"{p.nome}; papel: {p.papel}; facção: {p.faccao}; "
                f"tipo: {p.tipo}; {p.descricao}"
            ),
        )
        mesma_faccao = [
            p for p in pessoas
            if p.id != alvo.id and p.faccao and p.faccao == alvo.faccao
        ]
        add("personagem", mesma_faccao, lambda p: f"{p.nome}: {p.descricao}")
        add("local", list(alvo.locais), lambda l: f"{l.nome}: {l.descricao}")
        add("arco", arco_rows({l.arco_id for l in alvo.locais}), lambda a: f"{a.titulo}: {a.resumo}")
    else:
        if alvo is None:
            add("local", locais, lambda l: f"{l.nome}: {l.descricao}")
            add("personagem", pessoas, lambda p: f"{p.nome}: {p.descricao}")
            add("arco", arcos, lambda a: f"{a.titulo}: {a.resumo}")
            return sorted(registros, key=lambda r: -r.registro_id)
        add("local_alvo", [alvo], lambda l: f"{l.nome}: {l.descricao}")
        add("personagem", list(alvo.npcs), lambda p: f"{p.nome}: {p.descricao}")
        add("arco", arco_rows({alvo.arco_id}), lambda a: f"{a.titulo}: {a.resumo}")
        links = session.exec(
            select(LocalConexaoLink).where(
                (LocalConexaoLink.origem_id == alvo.id)
                | (LocalConexaoLink.destino_id == alvo.id)
            )
        ).all()
        ids = {x.destino_id if x.origem_id == alvo.id else x.origem_id for x in links}
        add("local_vizinho", [l for l in locais if l.id in ids], lambda l: l.nome)
    return sorted(registros, key=lambda r: -r.registro_id)


def coletar_fios(session: Session, campanha_id: int, sessao_id: int | None = None) -> tuple[list[ItemContextoIa], list[Sessao]]:
    sessoes = list(session.exec(select(Sessao).order_by(Sessao.numero)).all())
    registros = coletar_registros(session, campanha_id, AssistirRequest(tipo="rascunho_sessao"), None)
    # Replace the session slice with numeric order and optionally exclude the draft.
    registros = [r for r in registros if r.tipo not in ("sessao", "notas_preparo_anterior")]
    sessoes_contexto = [s for s in sessoes if s.id != sessao_id]
    sessoes_items = [_item(campanha_id, "sessao", s, _texto_sessao(s)) for s in sessoes_contexto]
    fios = list(session.exec(select(FioNarrativo).order_by(FioNarrativo.ordem)).all())
    fios_items = [ItemContextoIa(campanha_id, "fio_existente", f.id or 0,
        f"{f.estado}: {f.titulo}; {f.descricao}", False) for f in fios]
    return sessoes_items + registros + fios_items, sessoes_contexto


def _tamanho(system: str, registros: list[ItemContextoIa], campanha_id: int) -> int:
    contexto = montar_contexto(campanha_id, registros, incluir_ocultos=True)
    return len(system) + len(json.dumps(contexto, ensure_ascii=False))


def _orcamento(system: str, registros: list[ItemContextoIa], campanha_id: int) -> list[ItemContextoIa]:
    teto = settings.ia_assistente_contexto_max_chars
    fixos = [r for r in registros if r.tipo in ("texto_atual", "instrucao_mestre")]
    outros = [r for r in registros if r.tipo not in ("texto_atual", "instrucao_mestre")]
    if _tamanho(system, fixos, campanha_id) > teto:
        espaco = max(0, teto - len(system) - 200)
        fixos = [
            replace(r, texto=r.texto[-espaco:]) if r.tipo == "texto_atual" else r
            for r in fixos
        ]
        while _tamanho(system, fixos, campanha_id) > teto and any(r.texto for r in fixos):
            i = max(range(len(fixos)), key=lambda n: len(fixos[n].texto))
            corte = max(1, len(fixos[i].texto) // 10)
            fixos[i] = replace(fixos[i], texto=fixos[i].texto[corte:])
    finais = list(fixos)
    for registro in outros:
        if _tamanho(system, finais + [registro], campanha_id) <= teto:
            finais.append(registro)
    return finais


