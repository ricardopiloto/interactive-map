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
            "#e5484d",
        ),
        (
            "Taverna do Javali Dourado",
            0.36,
            0.52,
            "Encontro com um contrabandista disposto a falar sobre remédios de origem duvidosa, por um preço.",
            a1.id,
            [npcs[1].id],
            "Sessão 4",
            "#e5484d",
        ),
        (
            "Reikwald — Clareira Antiga",
            0.55,
            0.35,
            "Marcas rituais entalhadas em pedras cobertas de musgo, recentes o bastante para preocupar.",
            a2.id,
            [npcs[3].id],
            "Sessão 6",
            "#c4b5fd",
        ),
        (
            "Torre Abandonada",
            0.63,
            0.21,
            "Uma torre de vigia esquecida, agora ocupada por algo que definitivamente não é humano.",
            a2.id,
            [npcs[4].id],
            "Sessão 7",
            "#c4b5fd",
        ),
        (
            "Aldeia de Grissenwald",
            0.72,
            0.4,
            "Vilarejo isolado que parou de enviar suprimentos para Ubersreik há semanas — silêncio suspeito.",
            a2.id,
            [npcs[3].id, npcs[4].id],
            "Sessão 8",
            "#c4b5fd",
        ),
    ]

    for nome, x, y, desc, arco_id, npc_ids, data, cor_pin in locais_data:
        local = Local(
            nome=nome,
            descricao=desc,
            x=x,
            y=y,
            arco_id=arco_id,
            data_sessao=data,
            cor_pin=cor_pin,
        )
        local.npcs = [n for n in npcs if n.id in npc_ids]
        session.add(local)

    session.flush()
    seeded_locais = list(session.exec(select(Local).order_by(Local.id)).all())
    # Example exits: Praça → Taverna + Clareira; Clareira → Torre
    if len(seeded_locais) >= 4:
        from app.models.links import LocalConexaoLink

        session.add(
            LocalConexaoLink(origem_id=seeded_locais[0].id, destino_id=seeded_locais[1].id)  # type: ignore[arg-type]
        )
        session.add(
            LocalConexaoLink(origem_id=seeded_locais[0].id, destino_id=seeded_locais[2].id)  # type: ignore[arg-type]
        )
        session.add(
            LocalConexaoLink(origem_id=seeded_locais[2].id, destino_id=seeded_locais[3].id)  # type: ignore[arg-type]
        )

    grupo = session.get(GrupoPosicao, 1)
    if grupo is None:
        session.add(GrupoPosicao(id=1, x=0.66, y=0.27, formato="bandeira"))
    else:
        grupo.x = 0.66
        grupo.y = 0.27
        grupo.formato = getattr(grupo, "formato", None) or "bandeira"
        session.add(grupo)

    # Travel graph (021): two paths Praça → Torre via Clareira vs via Grissenwald
    from app.models.waypoint import MapScale, RouteSegment, RouteTipo, Waypoint
    from app.services.route_planner import compute_distancia_milhas, dump_pontos

    if session.get(MapScale, 1) is None:
        session.add(MapScale(id=1, miles_per_map_unit=80.0, notas="Seed: ~80 mi por unidade de mapa"))

    if not session.exec(select(Waypoint)).first() and len(seeded_locais) >= 5:
        # 0 Praça, 1 Taverna, 2 Clareira, 3 Torre, 4 Grissenwald
        wps = [
            Waypoint(nome=seeded_locais[0].nome, x=seeded_locais[0].x, y=seeded_locais[0].y, local_id=seeded_locais[0].id),
            Waypoint(nome=seeded_locais[2].nome, x=seeded_locais[2].x, y=seeded_locais[2].y, local_id=seeded_locais[2].id),
            Waypoint(nome=seeded_locais[3].nome, x=seeded_locais[3].x, y=seeded_locais[3].y, local_id=seeded_locais[3].id),
            Waypoint(nome=seeded_locais[4].nome, x=seeded_locais[4].x, y=seeded_locais[4].y, local_id=seeded_locais[4].id),
            Waypoint(nome="Cruzamento do Reik", x=0.48, y=0.45, local_id=None),
        ]
        for w in wps:
            session.add(w)
        session.flush()
        scale = 80.0
        pairs = [
            (wps[0], wps[4], RouteTipo.estrada, []),
            (wps[4], wps[1], RouteTipo.estrada, []),
            (wps[1], wps[2], RouteTipo.trilha, []),
            (wps[0], wps[3], RouteTipo.rio, [{"x": 0.5, "y": 0.5}]),
            (wps[3], wps[2], RouteTipo.estrada, []),
        ]
        from app.schemas.routes import Point

        for a, b, tipo, mid_raw in pairs:
            mid = [Point(**p) for p in mid_raw]
            dist = compute_distancia_milhas(a, b, mid, scale)
            session.add(
                RouteSegment(
                    waypoint_a_id=a.id,  # type: ignore[arg-type]
                    waypoint_b_id=b.id,  # type: ignore[arg-type]
                    tipo=tipo,
                    pontos_intermediarios=dump_pontos(mid),
                    distancia_milhas=dist,
                )
            )

    session.commit()
    print("Seed aplicado: 2 arcos, 5 NPCs, 5 locais, conexões de saída, rotas de viagem, posição do grupo.")


def main() -> None:
    if os.getenv("ALLOW_SEED", "1") == "0":
        raise SystemExit("ALLOW_SEED=0 — seed bloqueado.")
    init_db()
    with Session(engine) as session:
        seed(session)


if __name__ == "__main__":
    main()
