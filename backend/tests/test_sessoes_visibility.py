from __future__ import annotations

from fastapi.testclient import TestClient

from tests.conftest import api
from tests.helpers import seed_local, seed_personagem, seed_sessao


def test_public_list_order_and_visibility(client: TestClient, db_session) -> None:
    seed_sessao(db_session, numero=1, titulo="Antiga")
    seed_sessao(db_session, numero=2, titulo="Recente")
    seed_sessao(db_session, numero=3, titulo="Oculta", visivel=False)

    resp = client.get(api("/api/sessoes"))
    assert resp.status_code == 200
    sessoes = resp.json()["sessoes"]
    assert [s["numero"] for s in sessoes] == [2, 1]
    assert all(s["titulo"] != "Oculta" for s in sessoes)


def test_public_hides_hidden_npc_chips(client: TestClient, db_session) -> None:
    vis = seed_personagem(db_session, nome="Visivel", visivel=True)
    oculto = seed_personagem(db_session, nome="Oculto", visivel=False)
    loc = seed_local(db_session, nome="Porto")
    seed_sessao(
        db_session,
        numero=1,
        titulo="Com chips",
        local_ids=[loc.id],  # type: ignore[list-item]
        personagem_ids=[vis.id, oculto.id],  # type: ignore[list-item]
    )

    resp = client.get(api("/api/sessoes"))
    assert resp.status_code == 200
    s = resp.json()["sessoes"][0]
    nomes = {p["nome"] for p in s["personagens"]}
    assert "Visivel" in nomes
    assert "Oculto" not in nomes
    assert any(l["nome"] == "Porto" for l in s["locais"])


def test_public_hides_hidden_local_chips(client: TestClient, db_session) -> None:
    loc_vis = seed_local(db_session, nome="Porto", visivel=True)
    loc_oculto = seed_local(db_session, nome="Caverna", visivel=False)
    seed_sessao(
        db_session,
        numero=1,
        titulo="Com local oculto",
        local_ids=[loc_vis.id, loc_oculto.id],  # type: ignore[list-item]
    )

    resp = client.get(api("/api/sessoes"))
    assert resp.status_code == 200
    nomes = {l["nome"] for l in resp.json()["sessoes"][0]["locais"]}
    assert "Porto" in nomes
    assert "Caverna" not in nomes


def test_public_detail_404_when_hidden(client: TestClient, db_session) -> None:
    row = seed_sessao(db_session, numero=1, titulo="Oculta", visivel=False)
    resp = client.get(api(f"/api/sessoes/{row.id}"))
    assert resp.status_code == 404
    assert resp.json()["detail"]["erro"] == "SESSAO_NAO_ENCONTRADA"


def test_local_npc_lists_unchanged(client: TestClient, db_session) -> None:
    """Public local/NPC list payloads must not gain sessao fields."""
    seed_local(db_session, nome="X")
    seed_personagem(db_session, nome="Y")
    locais = client.get(api("/api/locais")).json()
    npcs = client.get(api("/api/npcs")).json()
    assert locais and "sessoes" not in locais[0]
    assert npcs and "sessoes" not in npcs[0]


def test_public_list_never_includes_notas_preparo(client: TestClient, db_session) -> None:
    """GM-only prep notes must not leak into the public Sessao schema."""
    visible = seed_sessao(
        db_session,
        numero=1,
        titulo="Visível com preparo",
        visivel=True,
        notas_preparo="Segredo do mestre",
    )
    hidden = seed_sessao(
        db_session,
        numero=2,
        titulo="Oculta com preparo",
        visivel=False,
        notas_preparo="Ainda não jogada",
    )
    from app.models.fio_narrativo import FioNarrativo
    db_session.add_all([
        FioNarrativo(titulo="Fio privado visível", descricao="Descrição privada", sessao_origem_id=visible.id),
        FioNarrativo(titulo="Fio privado oculto", descricao="Outro segredo", sessao_origem_id=hidden.id),
    ])
    db_session.commit()

    resp = client.get(api("/api/sessoes"))
    assert resp.status_code == 200
    sessoes = resp.json()["sessoes"]
    assert [s["titulo"] for s in sessoes] == ["Visível com preparo"]
    assert all("notas_preparo" not in s for s in sessoes)
    assert all("fio" not in key.lower() for s in sessoes for key in s)
    assert all(private not in resp.text for private in ("Segredo do mestre", "Ainda não jogada", "Fio privado", "Descrição privada", "Outro segredo"))

    detail = client.get(api(f"/api/sessoes/{sessoes[0]['id']}"))
    assert detail.status_code == 200
    assert "notas_preparo" not in detail.json()
    assert all("fio" not in key.lower() for key in detail.json())
    assert all(private not in detail.text for private in ("Segredo do mestre", "Fio privado", "Descrição privada"))
    assert client.get(api(f"/api/sessoes/{hidden.id}")).status_code == 404


def test_filling_resumo_preserves_notas_preparo(client: TestClient, db_session) -> None:
    from tests.conftest import login_as

    login_as(client)
    row = seed_sessao(
        db_session,
        numero=1,
        titulo="Preparo",
        visivel=False,
        notas_preparo="Cena de abertura com o barão",
    )

    patched = client.patch(
        api(f"/api/admin/sessoes/{row.id}"),
        json={"resumo": "O grupo enfrentou o barão."},
    )
    assert patched.status_code == 200, patched.text
    body = patched.json()
    assert body["resumo"] == "O grupo enfrentou o barão."
    assert body["notas_preparo"] == "Cena de abertura com o barão"

    again = client.get(api(f"/api/admin/sessoes/{row.id}"))
    assert again.status_code == 200
    assert again.json()["notas_preparo"] == "Cena de abertura com o barão"


def test_duplicate_numero_returns_4xx_not_500(client: TestClient, db_session) -> None:
    from tests.conftest import login_as

    login_as(client)
    seed_sessao(db_session, numero=7, titulo="Já existe")

    first = client.post(
        api("/api/admin/sessoes"),
        json={
            "numero": 7,
            "titulo": "Concorrente A",
            "resumo": "",
            "notas_preparo": "Preparo A",
            "visivel_para_todos": False,
        },
    )
    assert first.status_code == 400, first.text
    assert first.json()["detail"]["erro"] == "NUMERO_DUPLICADO"

    second = client.post(
        api("/api/admin/sessoes"),
        json={
            "numero": 7,
            "titulo": "Concorrente B",
            "resumo": "",
            "notas_preparo": "Preparo B",
            "visivel_para_todos": False,
        },
    )
    assert second.status_code == 400, second.text
    assert second.status_code < 500
    assert second.json()["detail"]["erro"] == "NUMERO_DUPLICADO"
