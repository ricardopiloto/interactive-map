"""Seed opcional para dev/teste. Nunca roda automaticamente em produção.

Uso:
  cd backend && SEED=1 uv run python -m app.seed
  # ou
  uv run python -m app.seed
"""

from __future__ import annotations

import os

from sqlmodel import Session, select

from app.database import engine, init_db
from app.models.arco import Arco
from app.models.grupo import GrupoPosicao
from app.models.local import Local
from app.models.npc import NPC, NPCStatus


def seed(session: Session) -> None:
    if session.exec(select(Arco)).first():
        print("Seed ignorado: já existem arcos no banco.")
        return

    a1 = Arco(
        titulo="Arco 1 — A Peste em Ubersreik",
        ordem=1,
        resumo="O grupo investiga uma doença misteriosa que se espalha pela cidade de Ubersreik.",
    )
    a2 = Arco(
        titulo="Arco 2 — Os Segredos do Reikwald",
        ordem=2,
        resumo="Rumores de cultistas e criaturas skaven levam o grupo à floresta de Reikwald.",
    )
    session.add(a1)
    session.add(a2)
    session.flush()

    npcs = [
        NPC(
            nome="Doutor Hedrich",
            descricao="Físico do Colégio da Física, investiga a origem da peste com métodos nem sempre ortodoxos.",
            faccao="Colégio da Física",
            status=NPCStatus.vivo,
        ),
        NPC(
            nome="Ranulf Grimsby",
            descricao="Contrabandista com contatos no submundo de Ubersreik; sabe mais do que aparenta.",
            faccao=None,
            status=NPCStatus.desaparecido,
        ),
        NPC(
            nome="Irmã Wilhelmina",
            descricao="Sacerdotisa de Shallya que cuida dos doentes sem pedir nada em troca — ou quase nada.",
            faccao="Culto de Shallya",
            status=NPCStatus.vivo,
        ),
        NPC(
            nome="Barão von Kessler",
            descricao="Nobre local com ligações suspeitas a rituais realizados no Reikwald.",
            faccao="Nobreza de Ubersreik",
            status=NPCStatus.morto,
        ),
        NPC(
            nome="Skrik Orelha-Fendida",
            descricao="Agente skaven avistado nos arredores da torre abandonada, provável ligação ao Clã Eshin.",
            faccao="Clã Eshin",
            status=NPCStatus.desaparecido,
        ),
    ]
    for n in npcs:
        session.add(n)
    session.flush()

    locais_data = [
        (
            "Ubersreik — Praça do Mercado",
            0.32,
            0.58,
            "O grupo notou os primeiros sinais da doença entre os mercadores, com corpos sendo escondidos às pressas.",
            a1.id,
            [npcs[0].id, npcs[2].id],
            "Sessão 3",
        ),
        (
            "Taverna do Javali Dourado",
            0.36,
            0.52,
            "Encontro com um contrabandista disposto a falar sobre remédios de origem duvidosa, por um preço.",
            a1.id,
            [npcs[1].id],
            "Sessão 4",
        ),
        (
            "Reikwald — Clareira Antiga",
            0.55,
            0.35,
            "Marcas rituais entalhadas em pedras cobertas de musgo, recentes o bastante para preocupar.",
            a2.id,
            [npcs[3].id],
            "Sessão 6",
        ),
        (
            "Torre Abandonada",
            0.63,
            0.21,
            "Uma torre de vigia esquecida, agora ocupada por algo que definitivamente não é humano.",
            a2.id,
            [npcs[4].id],
            "Sessão 7",
        ),
        (
            "Aldeia de Grissenwald",
            0.72,
            0.4,
            "Vilarejo isolado que parou de enviar suprimentos para Ubersreik há semanas — silêncio suspeito.",
            a2.id,
            [npcs[3].id, npcs[4].id],
            "Sessão 8",
        ),
    ]

    for nome, x, y, desc, arco_id, npc_ids, data in locais_data:
        local = Local(
            nome=nome,
            descricao=desc,
            x=x,
            y=y,
            arco_id=arco_id,
            data_sessao=data,
        )
        local.npcs = [n for n in npcs if n.id in npc_ids]
        session.add(local)

    grupo = session.get(GrupoPosicao, 1)
    if grupo is None:
        session.add(GrupoPosicao(id=1, x=0.66, y=0.27, formato="bandeira"))
    else:
        grupo.x = 0.66
        grupo.y = 0.27
        grupo.formato = getattr(grupo, "formato", None) or "bandeira"
        session.add(grupo)

    session.commit()
    print("Seed aplicado: 2 arcos, 5 NPCs, 5 locais, posição do grupo.")


def main() -> None:
    if os.getenv("ALLOW_SEED", "1") == "0":
        raise SystemExit("ALLOW_SEED=0 — seed bloqueado.")
    init_db()
    with Session(engine) as session:
        seed(session)


if __name__ == "__main__":
    main()
