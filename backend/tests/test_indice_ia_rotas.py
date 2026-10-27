"""Rotas privadas do índice; executar fora do sandbox com TestClient."""

import pytest

from app.campaign_db import lookup_campanha
from app.models.usuario import Membro
from app.services.auth_admin import assign_owner, create_usuario_with_invite
from app.services.auth_invite import accept_activate_invite
from app.services.ia_provider import MODULO_IA
from app.services.rate_limit import limiter
from tests.conftest import TEST_CAMPAIGN_SLUG, login_as
from tests.helpers import seed_sessao


@pytest.fixture(autouse=True)
def _limpar_limiter():
    limiter._storage.reset()


def _url(suffix=""):
    return f"/api/c/{TEST_CAMPAIGN_SLUG}/admin/ia/indice{suffix}"


def _ligar(client):
    response = client.patch(
        f"/api/campanhas/{TEST_CAMPAIGN_SLUG}/modulos",
        json={"modulo": MODULO_IA, "ativo": True},
    )
    assert response.status_code == 200


def test_estado_e_reindexacao(client, db_session):
    _ligar(client)
    seed_sessao(db_session, numero=1, resumo="Emboscada no caminho")
    anterior = client.get(_url())
    assert anterior.status_code == 200
    assert set(anterior.json()) == {"estado", "registros", "trechos", "atualizado_em"}
    response = client.post(_url("/reindexar"))
    assert response.status_code == 200, response.text
    assert response.json()["estado"] == "ok"
    assert response.json()["registros"] >= 1
    assert response.json()["trechos"] >= 1
    assert response.json()["atualizado_em"]
    assert client.get(_url()).json() == response.json()


def test_reindexar_limite(client):
    _ligar(client)
    for _ in range(3):
        assert client.post(_url("/reindexar")).status_code == 200
    assert client.post(_url("/reindexar")).status_code == 429


@pytest.mark.parametrize("method,suffix", [("get", ""), ("post", "/reindexar")])
def test_ia_desligada(client, method, suffix):
    response = getattr(client, method)(_url(suffix))
    assert response.status_code == 403
    assert response.json()["detail"]["erro"] == "IA_MODULO_DESABILITADO"


@pytest.mark.parametrize("method,suffix", [("get", ""), ("post", "/reindexar")])
def test_jogador_negado(client, control_session, method, suffix):
    _ligar(client)
    camp = lookup_campanha(TEST_CAMPAIGN_SLUG)
    user, token = create_usuario_with_invite(control_session, "jogador-indice@teste.local")
    accept_activate_invite(control_session, token, "test-secret-ok")
    control_session.add(Membro(usuario_id=user.id, campanha_id=camp.id, papel="jogador"))
    control_session.commit()
    login_as(client, email=user.email, password="test-secret-ok")
    assert getattr(client, method)(_url(suffix)).status_code == 403


@pytest.mark.parametrize("method,suffix", [("get", ""), ("post", "/reindexar")])
@pytest.mark.parametrize("own_other", [False, True])
def test_outro_usuario_negado(client, control_session, method, suffix, own_other):
    from app.cli import _create_campanha

    _ligar(client)
    user, token = create_usuario_with_invite(control_session, f"outro-indice-{own_other}@teste.local")
    accept_activate_invite(control_session, token, "test-secret-ok")
    if own_other:
        _create_campanha(slug="mesa-segunda-indice", nome="Segunda", sistema="outro")
        assign_owner(control_session, "mesa-segunda-indice", user.email)
    login_as(client, email=user.email, password="test-secret-ok")
    assert getattr(client, method)(_url(suffix)).status_code == 403
