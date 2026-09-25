from __future__ import annotations

from pathlib import Path

from sqlmodel import Session, select

from app.campaign_db import campaign_uploads_path, get_control_engine
from app.models.campanha import Campanha
from app.models.links import LocalConexaoLink, LocalNPCLink
from app.models.local import Local
from app.models.npc import PersonagemTipo
from app.models.waypoint import Waypoint
from app.services.media_paths import media_url
from tests.conftest import TEST_CAMPAIGN_SLUG, api
from tests.helpers import seed_arco, seed_local, seed_personagem, seed_sessao


def test_schema_default_visivel_para_todos(db_session) -> None:
    local = seed_local(db_session, nome="Default local")
    arco = seed_arco(db_session, titulo="Default arco")
    assert local.visivel_para_todos is True
    assert arco.visivel_para_todos is True
    assert hasattr(Local, "visivel_para_todos")


def test_hidden_local_absent_from_public_list_detail_and_saidas(client, db_session) -> None:
    origem = seed_local(db_session, nome="Origem", visivel=True)
    destino_oculto = seed_local(db_session, nome="Destino oculto", visivel=False)
    destino_visivel = seed_local(db_session, nome="Destino visivel", visivel=True)
    db_session.add(LocalConexaoLink(origem_id=origem.id, destino_id=destino_oculto.id))  # type: ignore[arg-type]
    db_session.add(LocalConexaoLink(origem_id=origem.id, destino_id=destino_visivel.id))  # type: ignore[arg-type]
    db_session.commit()

    lista = client.get(api("/api/locais")).json()
    ids = {row["id"] for row in lista}
    assert origem.id in ids
    assert destino_visivel.id in ids
    assert destino_oculto.id not in ids

    assert client.get(api(f"/api/locais/{destino_oculto.id}")).status_code == 404
    detail = client.get(api(f"/api/locais/{destino_oculto.id}")).json()
    assert detail["detail"]["erro"] == "LOCAL_NAO_ENCONTRADO"

    origem_public = next(row for row in lista if row["id"] == origem.id)
    assert destino_visivel.id in origem_public["saida_ids"]
    assert destino_oculto.id not in origem_public["saida_ids"]

    admin_ids = {row["id"] for row in client.get(api("/api/admin/locais")).json()}
    assert destino_oculto.id in admin_ids


def test_hidden_arco_omitted_and_arco_id_redacted(client, db_session) -> None:
    arco_oculto = seed_arco(db_session, titulo="Arco oculto", visivel=False)
    arco_visivel = seed_arco(db_session, titulo="Arco visivel", ordem=2, visivel=True)
    local = seed_local(db_session, nome="Com arco oculto", arco_id=arco_oculto.id, visivel=True)

    arcos = client.get(api("/api/arcos")).json()
    arco_ids = {row["id"] for row in arcos}
    assert arco_visivel.id in arco_ids
    assert arco_oculto.id not in arco_ids
    assert client.get(api(f"/api/arcos/{arco_oculto.id}")).status_code == 404
    assert client.get(api(f"/api/arcos/{arco_oculto.id}")).json()["detail"]["erro"] == "ARCO_NAO_ENCONTRADO"

    public_local = next(row for row in client.get(api("/api/locais")).json() if row["id"] == local.id)
    assert public_local["arco_id"] is None

    admin_arcos = {row["id"] for row in client.get(api("/api/admin/arcos")).json()}
    assert arco_oculto.id in admin_arcos

    # Hiding an arco must not hide its locais
    assert local.id in {row["id"] for row in client.get(api("/api/locais")).json()}


def test_npc_public_local_ids_omit_hidden_local(client, db_session) -> None:
    oculto = seed_local(db_session, nome="Local oculto", visivel=False)
    visivel = seed_local(db_session, nome="Local visivel", visivel=True)
    npc = seed_personagem(db_session, nome="NPC com locais")
    db_session.add(LocalNPCLink(local_id=oculto.id, npc_id=npc.id))  # type: ignore[arg-type]
    db_session.add(LocalNPCLink(local_id=visivel.id, npc_id=npc.id))  # type: ignore[arg-type]
    db_session.commit()

    public_npc = next(row for row in client.get(api("/api/npcs")).json() if row["id"] == npc.id)
    assert visivel.id in public_npc["local_ids"]
    assert oculto.id not in public_npc["local_ids"]

    admin_npc = next(row for row in client.get(api("/api/admin/npcs")).json() if row["id"] == npc.id)
    assert oculto.id in admin_npc["local_ids"]
    assert oculto.id not in {row["id"] for row in client.get(api("/api/locais")).json()}


def test_local_character_links_filter_hidden_pj_and_npc_for_public_reads(client, db_session) -> None:
    local = seed_local(db_session, nome="Local com personagens", visivel=True)
    pj_visivel = seed_personagem(
        db_session, nome="PJ visível no Local", visivel=True, tipo=PersonagemTipo.pj
    )
    npc_visivel = seed_personagem(
        db_session, nome="NPC visível no Local", visivel=True, tipo=PersonagemTipo.npc
    )
    pj_oculto = seed_personagem(
        db_session, nome="PJ oculto no Local", visivel=False, tipo=PersonagemTipo.pj
    )
    npc_oculto = seed_personagem(
        db_session, nome="NPC oculto no Local", visivel=False, tipo=PersonagemTipo.npc
    )
    db_session.add_all(
        [
            LocalNPCLink(local_id=local.id, npc_id=row.id)
            for row in (pj_visivel, npc_visivel, pj_oculto, npc_oculto)
        ]
    )
    db_session.commit()

    public_local = client.get(api(f"/api/locais/{local.id}")).json()
    assert set(public_local["npc_ids"]) == {pj_visivel.id, npc_visivel.id}
    admin_local = next(
        row for row in client.get(api("/api/admin/locais")).json() if row["id"] == local.id
    )
    assert set(admin_local["npc_ids"]) == {
        pj_visivel.id,
        npc_visivel.id,
        pj_oculto.id,
        npc_oculto.id,
    }

    public_ids = {row["id"] for row in client.get(api("/api/npcs")).json()}
    assert {pj_visivel.id, npc_visivel.id} <= public_ids
    assert pj_oculto.id not in public_ids and npc_oculto.id not in public_ids


def test_admin_patch_persists_visivel_flag(client, db_session) -> None:
    local = seed_local(db_session, nome="Toggle local", visivel=True)
    arco = seed_arco(db_session, titulo="Toggle arco", visivel=True)

    r_local = client.put(
        api(f"/api/admin/locais/{local.id}"),
        json={"visivel_para_todos": False},
    )
    assert r_local.status_code == 200
    assert r_local.json()["visivel_para_todos"] is False

    r_arco = client.put(
        api(f"/api/admin/arcos/{arco.id}"),
        json={"visivel_para_todos": False},
    )
    assert r_arco.status_code == 200
    assert r_arco.json()["visivel_para_todos"] is False

    admin_local = next(row for row in client.get(api("/api/admin/locais")).json() if row["id"] == local.id)
    assert admin_local["visivel_para_todos"] is False
    assert local.id not in {row["id"] for row in client.get(api("/api/locais")).json()}


def test_hidden_local_media_anonymous_404_member_200(client, client_anon, db_session) -> None:
    name = "local-oculto.webp"
    with Session(get_control_engine()) as ctrl:
        camp = ctrl.exec(select(Campanha).where(Campanha.slug == TEST_CAMPAIGN_SLUG)).one()
        dest = campaign_uploads_path(camp.caminho) / "locals"
        dest.mkdir(parents=True, exist_ok=True)
        (dest / name).write_bytes(b"\x89PNG\r\n\x1a\nxxxx")

    url = media_url(TEST_CAMPAIGN_SLUG, "locals", name)
    loc = seed_local(db_session, nome="Com imagem oculta", visivel=False)
    loc.imagem_url = url
    db_session.add(loc)
    db_session.commit()

    assert client_anon.get(url).status_code == 404
    assert client.get(url).status_code == 200


def test_waypoint_unlinks_hidden_local(client, db_session) -> None:
    loc = seed_local(db_session, nome="WP oculto", visivel=False)
    wp = Waypoint(nome="Nó", x=0.5, y=0.5, local_id=loc.id)
    db_session.add(wp)
    db_session.commit()
    db_session.refresh(wp)

    rows = client.get(api("/api/waypoints")).json()
    match = next(row for row in rows if row["id"] == wp.id)
    assert match["local_id"] is None
