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
from app.models.npc import NPC, NPCStatus, PersonagemTipo
from app.models.vinculo import Vinculo, VinculoDirecao, VinculoTipo


def _pair(a: int, b: int) -> tuple[int, int]:
    return (a, b) if a < b else (b, a)


def _ensure_qualifier_direction_demos(session: Session) -> None:
    """Demo: Marcus↔Tomas Aliado (Mentor); Helga→Ranulf Inimizade (Medo) directed."""
    marcus = session.exec(select(NPC).where(NPC.nome == "Marcus Stein")).first()
    tomas = session.exec(select(NPC).where(NPC.nome == "Brother Tomas")).first()
    if marcus and tomas and marcus.id is not None and tomas.id is not None:
        a, b = _pair(marcus.id, tomas.id)
        row = session.exec(
            select(Vinculo).where(Vinculo.personagem_a_id == a, Vinculo.personagem_b_id == b)
        ).first()
        if row:
            row.qualificador_ab = "Mentor"
            row.qualificador_ba = ""
            row.direcao = None
            session.add(row)

    helga = session.exec(select(NPC).where(NPC.nome == "Capitã Helga Brunn")).first()
    ranulf = session.exec(select(NPC).where(NPC.nome == "Ranulf Grimsby")).first()
    if helga and ranulf and helga.id is not None and ranulf.id is not None:
        a, b = _pair(helga.id, ranulf.id)
        row = session.exec(
            select(Vinculo).where(Vinculo.personagem_a_id == a, Vinculo.personagem_b_id == b)
        ).first()
        if row:
            if helga.id < ranulf.id:
                row.qualificador_ab = "Medo"
                row.qualificador_ba = ""
            else:
                row.qualificador_ab = ""
                row.qualificador_ba = "Medo"
            row.direcao = (
                VinculoDirecao.a_para_b if helga.id < ranulf.id else VinculoDirecao.b_para_a
            )
            session.add(row)

    session.commit()
    print("Seed relações: demos qualificador/direção (Mentor; Medo dirigido).")


def _ensure_elara_marcus_duas_vias(session: Session) -> None:
    """Promote Elara↔Marcus to the duas-vias demo pair when both exist."""
    elara = session.exec(select(NPC).where(NPC.nome == "Elara Voss")).first()
    marcus = session.exec(select(NPC).where(NPC.nome == "Marcus Stein")).first()
    if not elara or not marcus or elara.id is None or marcus.id is None:
        return
    a, b = _pair(elara.id, marcus.id)
    row = session.exec(
        select(Vinculo).where(Vinculo.personagem_a_id == a, Vinculo.personagem_b_id == b)
    ).first()
    if not row:
        return
    # Elara → aliado, Marcus → romance (map through canonical ids)
    if elara.id < marcus.id:
        row.tipo_ab = VinculoTipo.aliado
        row.tipo_ba = VinculoTipo.romance
        row.nota_ab = "Companheiros de estrada desde Bögenhafen"
        row.nota_ba = "Marcus vê mais do que amizade em Elara"
    else:
        row.tipo_ab = VinculoTipo.romance
        row.tipo_ba = VinculoTipo.aliado
        row.nota_ab = "Marcus vê mais do que amizade em Elara"
        row.nota_ba = "Companheiros de estrada desde Bögenhafen"
    row.publico = True
    row.conhecido_ab = True
    row.conhecido_ba = True
    session.add(row)
    session.commit()
    print("Seed relações: Elara↔Marcus actualizado para duas vias (aliado/romance).")


def _ensure_tomas_lila_known_direction(session: Session) -> None:
    """Tomas→Lila romance (secret), Lila→Tomas amizade (known), público."""
    lila = session.exec(select(NPC).where(NPC.nome == "Lila Nacht")).first()
    tomas = session.exec(select(NPC).where(NPC.nome == "Brother Tomas")).first()
    if not lila or not tomas or lila.id is None or tomas.id is None:
        return
    a, b = _pair(lila.id, tomas.id)
    row = session.exec(
        select(Vinculo).where(Vinculo.personagem_a_id == a, Vinculo.personagem_b_id == b)
    ).first()
    if not row:
        return
    # Tomas sees romance (secret); Lila sees amizade (known)
    if tomas.id < lila.id:
        row.tipo_ab = VinculoTipo.romance
        row.tipo_ba = VinculoTipo.amizade
        row.nota_ab = "Sentimento que Lila não conhece"
        row.nota_ba = "Vê-o como um amigo de confiança"
        row.conhecido_ab = False
        row.conhecido_ba = True
    else:
        row.tipo_ab = VinculoTipo.amizade
        row.tipo_ba = VinculoTipo.romance
        row.nota_ab = "Vê-o como um amigo de confiança"
        row.nota_ba = "Sentimento que Lila não conhece"
        row.conhecido_ab = True
        row.conhecido_ba = False
    row.publico = True
    session.add(row)
    session.commit()
    print(
        "Seed relações: Tomas↔Lila duas vias (amizade conhecida / romance secreto)."
    )


def seed_relacoes(session: Session) -> None:
    """Idempotent: add PJs / extra NPCs / vínculos if rede ainda vazia."""
    if session.exec(select(Vinculo)).first():
        _ensure_elara_marcus_duas_vias(session)
        _ensure_tomas_lila_known_direction(session)
        _ensure_qualifier_direction_demos(session)
        print("Seed relações ignorado: já existem vínculos.")
        return

    # Ensure existing NPCs have tipo/papel
    existing = list(session.exec(select(NPC)).all())
    papel_by_nome = {
        "Doutor Hedrich": "Físico",
        "Ranulf Grimsby": "Contrabandista",
        "Irmã Wilhelmina": "Sacerdotisa de Shallya",
        "Barão von Kessler": "Barão",
        "Skrik Orelha-Fendida": "Agente Skaven",
    }
    for n in existing:
        if getattr(n, "tipo", None) is None:
            n.tipo = PersonagemTipo.npc
        if not n.papel and n.nome in papel_by_nome:
            n.papel = papel_by_nome[n.nome]
        session.add(n)
    session.flush()

    by_nome = {n.nome: n for n in session.exec(select(NPC)).all()}

    extras = [
        ("Capitã Helga Brunn", PersonagemTipo.npc, "Capitã da Guarda", "Guarda de Ubersreik", NPCStatus.vivo, "Chefe da guarda municipal; pragmática e desconfiada."),
        ("Greta Mole", PersonagemTipo.npc, "Curandeira", None, NPCStatus.vivo, "Curandeira de aldeia; conhece remédios que o Colégio ignora."),
        ("Elara Voss", PersonagemTipo.pj, "Caçadora de Recompensas", None, NPCStatus.vivo, "PJ — caça recompensas nas estradas do Reikland."),
        ("Marcus Stein", PersonagemTipo.pj, "Soldado", "Exército Imperial", NPCStatus.vivo, "PJ — veterano de campanhas no norte."),
        ("Lila Nacht", PersonagemTipo.pj, "Ladina", None, NPCStatus.vivo, "PJ — mãos leves e ouvidos abertos."),
        ("Brother Tomas", PersonagemTipo.pj, "Iniciado de Sigmar", "Culto de Sigmar", NPCStatus.vivo, "PJ — fé fervorosa e pouco tato social."),
    ]
    for nome, tipo, papel, faccao, status, desc in extras:
        if nome in by_nome:
            continue
        row = NPC(
            nome=nome,
            tipo=tipo,
            papel=papel,
            faccao=faccao,
            status=status,
            descricao=desc,
        )
        session.add(row)
        by_nome[nome] = row
    session.flush()

    def pid(nome: str) -> int:
        return by_nome[nome].id  # type: ignore[return-value]

    links: list[tuple[str, str, VinculoTipo, VinculoTipo | None, str, str, bool]] = [
        (
            "Elara Voss",
            "Marcus Stein",
            VinculoTipo.aliado,
            VinculoTipo.romance,
            "Companheiros de estrada desde Bögenhafen",
            "Marcus vê mais do que amizade em Elara",
            True,
        ),
        ("Elara Voss", "Lila Nacht", VinculoTipo.amizade, None, "Lila deve um favor a Elara — e odeia admitir", "", True),
        ("Marcus Stein", "Brother Tomas", VinculoTipo.aliado, None, "Tomas cura; Marcus protege", "", True),
        ("Lila Nacht", "Ranulf Grimsby", VinculoTipo.conhecido, None, "Negócios no submundo, nada pessoal", "", True),
        ("Brother Tomas", "Irmã Wilhelmina", VinculoTipo.amizade, None, "Respeito entre cultos — com ressalvas", "", True),
        ("Doutor Hedrich", "Irmã Wilhelmina", VinculoTipo.inimizade, None, "Métodos vs compaixão; quase se agridem em público", "", True),
        ("Doutor Hedrich", "Barão von Kessler", VinculoTipo.conhecido, None, "O barão financiava pesquisas… até morrer", "", False),
        ("Barão von Kessler", "Skrik Orelha-Fendida", VinculoTipo.aliado, None, "Pacto secreto no Reikwald", "", False),
        ("Ranulf Grimsby", "Skrik Orelha-Fendida", VinculoTipo.inimizade, None, "Ranulf viu demais no esgoto", "", False),
        ("Capitã Helga Brunn", "Marcus Stein", VinculoTipo.conhecido, None, "Ex-colegas de formação", "", True),
        ("Capitã Helga Brunn", "Ranulf Grimsby", VinculoTipo.inimizade, None, "Quer vê-lo atrás das grades", "", True),
        ("Greta Mole", "Irmã Wilhelmina", VinculoTipo.amizade, None, "Trocam remédios e fofocas de aldeia", "", True),
        ("Greta Mole", "Elara Voss", VinculoTipo.conhecido, None, "Curou um ferimento feio na caçada", "", True),
        ("Brother Tomas", "Lila Nacht", VinculoTipo.romance, VinculoTipo.amizade, "Sentimento que Lila não conhece", "Vê-o como um amigo de confiança", True),
        ("Elara Voss", "Doutor Hedrich", VinculoTipo.familia, None, "Primo distante — ela não gosta de lembrar", "", False),
    ]
    for na, nb, tipo_ab, tipo_ba, nota_ab, nota_ba, publico in links:
        a, b = _pair(pid(na), pid(nb))
        # Seed lists names in story order; map to canonical ids
        if pid(na) < pid(nb):
            t_ab, t_ba, n_ab, n_ba = tipo_ab, tipo_ba, nota_ab, nota_ba
        else:
            if tipo_ba is None:
                t_ab, t_ba, n_ab, n_ba = tipo_ab, None, nota_ab, ""
            else:
                t_ab, t_ba, n_ab, n_ba = tipo_ba, tipo_ab, nota_ba, nota_ab
        # Tomas→romance secret / Lila→amizade known (after canonical map)
        conhecido_ab, conhecido_ba = True, True
        if {na, nb} == {"Lila Nacht", "Brother Tomas"} and t_ba is not None:
            if t_ab == VinculoTipo.romance:
                conhecido_ab, conhecido_ba = False, True
            elif t_ba == VinculoTipo.romance:
                conhecido_ab, conhecido_ba = True, False
        session.add(
            Vinculo(
                personagem_a_id=a,
                personagem_b_id=b,
                tipo_ab=t_ab,
                tipo_ba=t_ba,
                nota_ab=n_ab,
                nota_ba=n_ba,
                publico=publico,
                conhecido_ab=conhecido_ab,
                conhecido_ba=conhecido_ba,
            )
        )
    session.commit()
    print("Seed relações: PJs/NPCs extras e ~15 vínculos aplicados.")
    _ensure_tomas_lila_known_direction(session)
    _ensure_qualifier_direction_demos(session)


def seed(session: Session) -> None:
    if session.exec(select(Arco)).first():
        print("Seed ignorado: já existem arcos no banco.")
        seed_relacoes(session)
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
            tipo=PersonagemTipo.npc,
            papel="Físico",
            descricao="Físico do Colégio da Física, investiga a origem da peste com métodos nem sempre ortodoxos.",
            faccao="Colégio da Física",
            status=NPCStatus.vivo,
        ),
        NPC(
            nome="Ranulf Grimsby",
            tipo=PersonagemTipo.npc,
            papel="Contrabandista",
            descricao="Contrabandista com contatos no submundo de Ubersreik; sabe mais do que aparenta.",
            faccao=None,
            status=NPCStatus.desaparecido,
        ),
        NPC(
            nome="Irmã Wilhelmina",
            tipo=PersonagemTipo.npc,
            papel="Sacerdotisa de Shallya",
            descricao="Sacerdotisa de Shallya que cuida dos doentes sem pedir nada em troca — ou quase nada.",
            faccao="Culto de Shallya",
            status=NPCStatus.vivo,
        ),
        NPC(
            nome="Barão von Kessler",
            tipo=PersonagemTipo.npc,
            papel="Barão",
            descricao="Nobre local com ligações suspeitas a rituais realizados no Reikwald.",
            faccao="Nobreza de Ubersreik",
            status=NPCStatus.morto,
        ),
        NPC(
            nome="Skrik Orelha-Fendida",
            tipo=PersonagemTipo.npc,
            papel="Agente Skaven",
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
    seed_relacoes(session)


def main() -> None:
    if os.getenv("ALLOW_SEED", "1") == "0":
        raise SystemExit("ALLOW_SEED=0 — seed bloqueado.")
    init_db()
    with Session(engine) as session:
        seed(session)


if __name__ == "__main__":
    main()
