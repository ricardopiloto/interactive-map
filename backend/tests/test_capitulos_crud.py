from app.campaign_db import resolve_campaign_session
from app.models.sessao import Sessao
from tests.conftest import TEST_CAMPAIGN_SLUG, api
from tests.helpers import seed_arco, seed_sessao


def test_capitulo_table_has_expected_constraints(data_root):
    with resolve_campaign_session(TEST_CAMPAIGN_SLUG) as session:
        conn = session.connection()
        cols = {
            row[1]: row
            for row in conn.exec_driver_sql("PRAGMA table_info(capitulo)").fetchall()
        }
        assert set(cols) == {
            "id",
            "arco_id",
            "titulo",
            "ordem",
            "corpo_markdown",
            "visivel_para_todos",
        }
        assert cols["arco_id"][3] == 0  # notnull flag — arco_id is nullable
        fks = conn.exec_driver_sql("PRAGMA foreign_key_list(capitulo)").fetchall()
        by_col = {row[3]: row for row in fks}
        assert by_col["arco_id"][2] == "arco"
        assert by_col["arco_id"][6] == "CASCADE"

        sessao_cols = {
            row[1]: row
            for row in conn.exec_driver_sql("PRAGMA table_info(sessao)").fetchall()
        }
        assert "capitulo_id" in sessao_cols
        sessao_fks = conn.exec_driver_sql("PRAGMA foreign_key_list(sessao)").fetchall()
        sessao_by_col = {row[3]: row for row in sessao_fks}
        assert sessao_by_col["capitulo_id"][2] == "capitulo"
        assert sessao_by_col["capitulo_id"][6] == "SET NULL"


def test_criar_capitulo_sem_arco(client, data_root):
    created = client.post(
        api("/api/admin/capitulos"),
        json={"titulo": "Avulso", "corpo_markdown": "Prep sem aventura ainda."},
    )
    assert created.status_code == 201, created.text
    body = created.json()
    assert body["arco_id"] is None
    assert body["ordem"] == 1


def test_criar_atualizar_e_reordenar(client, data_root):
    with resolve_campaign_session(TEST_CAMPAIGN_SLUG) as session:
        arco = seed_arco(session, titulo="Prep")
        arco_id = arco.id

    created = client.post(
        api("/api/admin/capitulos"),
        json={
            "arco_id": arco_id,
            "titulo": "Cena",
            "corpo_markdown": "## Cenário\n\nUm encontro.\n\n## Handout\n\nBilhete.",
        },
    )
    assert created.status_code == 201, created.text
    body = created.json()
    assert body["ordem"] == 1
    assert "Handout" in body["corpo_markdown"]
    capitulo_id = body["id"]

    segundo = client.post(
        api("/api/admin/capitulos"),
        json={"arco_id": arco_id, "titulo": "Depois", "ordem": 2},
    )
    assert segundo.status_code == 201

    reordenado = client.patch(
        api(f"/api/admin/capitulos/{capitulo_id}"),
        json={"ordem": 3},
    )
    assert reordenado.status_code == 200
    listed = client.get(api("/api/admin/capitulos"), params={"arco_id": arco_id})
    ordens = [row["ordem"] for row in listed.json()["capitulos"]]
    assert ordens == [2, 3]


def test_listar_sem_filtro_inclui_todos_e_avulsos(client, data_root):
    with resolve_campaign_session(TEST_CAMPAIGN_SLUG) as session:
        arco_a = seed_arco(session, titulo="A")
        arco_b = seed_arco(session, titulo="B")
        arco_a_id, arco_b_id = arco_a.id, arco_b.id

    client.post(api("/api/admin/capitulos"), json={"arco_id": arco_a_id, "titulo": "Da"})
    client.post(api("/api/admin/capitulos"), json={"arco_id": arco_b_id, "titulo": "Db"})
    client.post(api("/api/admin/capitulos"), json={"titulo": "Solto"})

    listed = client.get(api("/api/admin/capitulos"))
    titulos = {row["titulo"] for row in listed.json()["capitulos"]}
    assert titulos == {"Da", "Db", "Solto"}

    filtrado = client.get(api("/api/admin/capitulos"), params={"arco_id": arco_a_id})
    assert [row["titulo"] for row in filtrado.json()["capitulos"]] == ["Da"]


def test_rejeita_arco_inexistente(client, data_root):
    missing = client.post(
        api("/api/admin/capitulos"),
        json={"arco_id": 9999, "titulo": "Nada"},
    )
    assert missing.status_code == 422
    assert missing.json()["detail"]["erro"] == "CAPITULO_ARCO_INVALIDO"


def test_capitulo_exige_membro(client_anon, data_root):
    response = client_anon.post(
        api("/api/admin/capitulos"),
        json={"arco_id": 1, "titulo": "Fechado"},
    )
    assert response.status_code == 401
    assert response.json()["detail"]["erro"] == "AUTENTICACAO_NECESSARIA"


def test_capitulo_oculto_some_da_leitura_publica(client, client_anon, data_root):
    with resolve_campaign_session(TEST_CAMPAIGN_SLUG) as session:
        arco = seed_arco(session)
        arco_id = arco.id
    hidden = client.post(
        api("/api/admin/capitulos"),
        json={"arco_id": arco_id, "titulo": "Segredo", "visivel_para_todos": False},
    )
    shown = client.post(
        api("/api/admin/capitulos"),
        json={"arco_id": arco_id, "titulo": "Aberto", "visivel_para_todos": True},
    )
    assert hidden.status_code == 201 and shown.status_code == 201
    admin = client.get(api("/api/admin/capitulos"), params={"arco_id": arco_id}).json()
    public = client_anon.get(api("/api/capitulos"), params={"arco_id": arco_id}).json()
    assert {row["titulo"] for row in admin["capitulos"]} == {"Segredo", "Aberto"}
    assert [row["titulo"] for row in public["capitulos"]] == ["Aberto"]
    hidden_id = hidden.json()["id"]
    assert client_anon.get(api(f"/api/capitulos/{hidden_id}")).status_code == 404


def test_apagar_arco_remove_capitulos_vinculados_e_preserva_avulsos_e_sessoes(client, data_root):
    with resolve_campaign_session(TEST_CAMPAIGN_SLUG) as session:
        arco = seed_arco(session, titulo="Some")
        sessao = seed_sessao(session, numero=7, titulo="Crônica")
        arco_id, sessao_id = arco.id, sessao.id
    created = client.post(
        api("/api/admin/capitulos"),
        json={"arco_id": arco_id, "titulo": "Prep"},
    )
    capitulo_id = created.json()["id"]
    assert client.patch(
        api(f"/api/admin/sessoes/{sessao_id}"), json={"capitulo_id": capitulo_id}
    ).status_code == 200
    avulso = client.post(api("/api/admin/capitulos"), json={"titulo": "Avulso"})
    assert avulso.status_code == 201

    deleted = client.delete(api(f"/api/admin/arcos/{arco_id}"))
    assert deleted.status_code == 204

    assert client.get(api("/api/admin/capitulos"), params={"arco_id": arco_id}).status_code == 422
    restantes = client.get(api("/api/admin/capitulos")).json()["capitulos"]
    assert [row["titulo"] for row in restantes] == ["Avulso"]

    sessao_read = client.get(api(f"/api/admin/sessoes/{sessao_id}"))
    assert sessao_read.status_code == 200
    assert sessao_read.json()["titulo"] == "Crônica"
    assert sessao_read.json()["capitulo_id"] is None

    with resolve_campaign_session(TEST_CAMPAIGN_SLUG) as session:
        assert session.get(Sessao, sessao_id) is not None
