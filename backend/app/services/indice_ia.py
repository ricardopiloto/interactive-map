"""Rebuildable FTS5 index for one campaign database."""
from __future__ import annotations

import logging
import re
import threading
import time
import unicodedata
from datetime import datetime

from sqlalchemy import text
from sqlmodel import Session, select

from app.config import settings
from app.models.arco import Arco
from app.models.evento import Evento
from app.models.item import Item
from app.models.local import Local
from app.models.npc import NPC
from app.models.sessao import Sessao
from app.services.ia_provider import ItemContextoIa

logger = logging.getLogger(__name__)
TIPOS = {Sessao: ("sessao", ("numero", "titulo", "resumo", "notas_preparo", "visivel_para_todos")), Arco: ("arco", ("titulo", "resumo", "visivel_para_todos")), Evento: ("evento", ("titulo", "descricao", "visivel_para_todos")), NPC: ("personagem", ("nome", "papel", "faccao", "descricao", "visivel_para_todos")), Local: ("local", ("nome", "descricao", "visivel_para_todos")), Item: ("item", ("nome", "descricao", "visivel_para_todos"))}
_LOCKS: dict[str, threading.Lock] = {}
_LOCKS_GUARD = threading.Lock()


def _tabelas(conn) -> bool:
    return {"indice_ia", "indice_ia_estado"} <= {r[0] for r in conn.execute(text("SELECT name FROM sqlite_master WHERE name IN ('indice_ia', 'indice_ia_estado')"))}


def estado(session: Session) -> dict:
    conn = session.connection()
    if not _tabelas(conn):
        return {"estado": "ausente", "atualizado_em": None, "registros": 0, "trechos": 0}
    row = conn.execute(text("SELECT estado, atualizado_em FROM indice_ia_estado WHERE id=1")).first()
    status = row[0] if row else "ausente"
    if status == "indisponivel":
        return {"estado": status, "atualizado_em": row[1], "registros": 0, "trechos": 0}
    count = conn.execute(text("SELECT count(*), count(DISTINCT tipo || ':' || registro_id) FROM indice_ia")).first()
    return {"estado": status, "atualizado_em": row[1] if row else None, "registros": count[1], "trechos": count[0]}


def _criar(conn) -> None:
    conn.execute(text("CREATE TABLE IF NOT EXISTS indice_ia_estado (id INTEGER PRIMARY KEY CHECK(id=1), estado TEXT NOT NULL CHECK(estado IN ('ok','desatualizado','indisponivel')), atualizado_em TEXT, versao_indice INTEGER NOT NULL)"))
    try:
        conn.execute(text("CREATE VIRTUAL TABLE IF NOT EXISTS indice_ia USING fts5(texto, tipo UNINDEXED, registro_id UNINDEXED, parte UNINDEXED, visivel UNINDEXED, tokenize='unicode61 remove_diacritics 2')"))
    except Exception:
        conn.execute(text("INSERT OR REPLACE INTO indice_ia_estado VALUES (1,'indisponivel',NULL,1)"))
        raise


def _texto(obj) -> tuple[str, str]:
    if isinstance(obj, Sessao):
        return f"Sessão {obj.numero}: {obj.titulo}", "\n".join(filter(None, (obj.resumo, obj.notas_preparo)))
    if isinstance(obj, NPC):
        return obj.nome, "; ".join(filter(None, (obj.papel, obj.faccao, obj.descricao)))
    nome = getattr(obj, "titulo", None) or obj.nome
    return nome, getattr(obj, "resumo", None) or getattr(obj, "descricao", "") or ""


def dividir_trechos(cabecalho: str, corpo: str, limite: int = 1200) -> list[str]:
    prefixo = cabecalho[:max(0, limite - 2)]
    tamanho = max(1, limite - len(prefixo) - 2)
    partes = re.split(r"\n\s*\n", corpo.strip()) if corpo.strip() else [""]
    resultado = []
    for paragrafo in partes:
        for frase in re.split(r"(?<=[.!?])\s+", paragrafo):
            while frase:
                if resultado and len(resultado[-1]) + len(frase) + 1 <= limite:
                    resultado[-1] += " " + frase
                    break
                corte = min(len(frase), tamanho)
                if corte < len(frase):
                    espaco = frase.rfind(" ", 0, corte + 1)
                    if espaco > tamanho // 2:
                        corte = espaco
                resultado.append(f"{prefixo}: {frase[:corte].strip()}" if frase[:corte].strip() else prefixo)
                frase = frase[corte:].strip()
    return resultado or [prefixo]


def remover_registro(conn, tipo: str, registro_id: int) -> None:
    conn.execute(text("DELETE FROM indice_ia WHERE tipo=:tipo AND registro_id=:id"), {"tipo": tipo, "id": registro_id})


def indexar_registro(conn, obj) -> None:
    tipo = TIPOS[type(obj)][0]
    remover_registro(conn, tipo, obj.id)
    cabecalho, corpo = _texto(obj)
    for parte, trecho in enumerate(dividir_trechos(cabecalho, corpo)):
        conn.execute(text("INSERT INTO indice_ia (texto,tipo,registro_id,parte,visivel) VALUES (:texto,:tipo,:id,:parte,:visivel)"), {"texto": trecho, "tipo": tipo, "id": obj.id, "parte": parte, "visivel": int(obj.visivel_para_todos)})


def reconstruir(session: Session) -> dict:
    key = str(session.get_bind().url)
    with _LOCKS_GUARD:
        lock = _LOCKS.setdefault(key, threading.Lock())
    inicio = time.monotonic()
    with lock:
        conn = session.connection()
        _criar(conn)
        conn.execute(text("DELETE FROM indice_ia"))
        for cls in TIPOS:
            for obj in session.exec(select(cls)).all():
                indexar_registro(conn, obj)
        conn.execute(text("INSERT OR REPLACE INTO indice_ia_estado VALUES (1,'ok',:atualizado,1)"), {"atualizado": datetime.utcnow().isoformat()})
        result = estado(session)
        logger.info("indice_ia reconstruir registros=%s trechos=%s segundos=%.3f", result["registros"], result["trechos"], time.monotonic() - inicio)
        return result


_STOP = {"de", "da", "do", "das", "dos", "que", "com", "para", "uma", "the", "and", "for", "from", "sobre", "como", "esta", "esse", "isso", "por", "entre", "seu", "sua"}


def extrair_termos(texto_atual: str, instrucao: str, alvo=None) -> list[str]:
    titulo = str(getattr(alvo, "titulo", None) or getattr(alvo, "nome", None) or "")
    numero = str(getattr(alvo, "numero", "") or "")
    fonte = f"{texto_atual[-2000:]} {instrucao} {titulo} {numero}"
    fonte = unicodedata.normalize("NFKD", fonte.lower())
    fonte = "".join(c for c in fonte if not unicodedata.combining(c))
    termos = []
    for termo in re.findall(r"[a-z0-9]+", fonte):
        if len(termo) >= 3 and termo not in _STOP and termo not in termos:
            termos.append(termo)
        if len(termos) == 24:
            break
    return termos


def consultar(session: Session, campanha_id: int, texto_atual: str, instrucao: str, alvo=None) -> list[tuple[str, ItemContextoIa]]:
    termos = extrair_termos(texto_atual, instrucao, alvo)
    if not termos:
        return []
    query = " OR ".join(f'"{t}"{"*" if len(t) >= 5 else ""}' for t in termos)
    rows = session.connection().execute(text("SELECT tipo,registro_id,texto,visivel FROM indice_ia WHERE indice_ia MATCH :query ORDER BY bm25(indice_ia), CAST(registro_id AS INTEGER) DESC, parte LIMIT :limite"), {"query": query, "limite": settings.ia_indice_trechos_max})
    return [(r[0], ItemContextoIa(campanha_id, "trecho", r[1], r[2], bool(r[3]))) for r in rows]
