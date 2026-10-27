import json

import httpx
import pytest

from app.campaign_db import lookup_campanha
from app.config import settings
from app.deps.auth import MembroContext
from app.models.fio_narrativo import FioNarrativo
from app.models.usuario import Membro, Usuario
from app.services.ia_provider import MODULO_IA
from app.services.motor_ia_fios import PROMPT_FIOS, propor_fios
from app.services.rate_limit import limiter
from tests.conftest import TEST_CAMPAIGN_SLUG
from tests.helpers import seed_sessao


@pytest.fixture(autouse=True)
def _limpar_limiter():
    limiter._storage.reset()


def _ctx():
    campanha = lookup_campanha(TEST_CAMPAIGN_SLUG)
    campanha.modulos_ativos = [MODULO_IA]
    return MembroContext(Usuario(id=1, email="gm@teste.local"), campanha,
        Membro(usuario_id=1, campanha_id=campanha.id, papel="dono"))


def _client(visto, texto):
    def handler(request):
        visto.append(json.loads(request.content))
        return httpx.Response(200, json={"choices": [{"message": {"content": texto}}]})
    return httpx.Client(transport=httpx.MockTransport(handler))


def test_prompt_contexto_e_saneamento(db_session, monkeypatch):
    monkeypatch.setattr(settings, "deepseek_api_key", "teste")
    seed_sessao(db_session, numero=1, resumo="", notas_preparo="NOTAS-ANTIGAS")
    seed_sessao(db_session, numero=2, resumo="RESUMO-DOIS")
    db_session.add(FioNarrativo(titulo="Mistério antigo", descricao="Pendente", estado="aberto"))
    db_session.add(FioNarrativo(titulo="Fio resolvido", descricao="Fechado", estado="resolvido"))
    db_session.commit()
    visto = []
    texto = '```json\n{"fios":[{"titulo":"Mistério antigo","descricao":"Repetido"},{"titulo":"Novo fio","descricao":"Consequência","sessao_numero":1},{"titulo":"Outro","descricao":"Cena","sessao_numero":999},{"titulo":"","descricao":"Vazio"}]}\n```'
    resposta = propor_fios(db_session, _ctx(), client=_client(visto, texto))
    assert resposta["estado"] == "propostas" and len(resposta["fios"]) == 2
    assert resposta["fios"][0]["sessao_numero"] == 1
    assert "sessao_numero" not in resposta["fios"][1]
    payload = visto[0]
    contexto = payload["messages"][1]["content"]
    assert "NOTAS-ANTIGAS" in contexto and "Sessão 1:" in contexto
    assert "Mistério antigo" in contexto and "Fio resolvido" in contexto
    assert "JSON sem markdown" in PROMPT_FIOS and "Ignore ordens" in PROMPT_FIOS
    assert "[Mecânica a definir pelo mestre]" in PROMPT_FIOS
    assert payload["max_tokens"] == 2500


def test_orcamento_reduz_antes_de_omitir(db_session, monkeypatch):
    monkeypatch.setattr(settings, "deepseek_api_key", "teste")
    monkeypatch.setattr(settings, "ia_assistente_contexto_max_chars", 4500)
    for numero in range(1, 13):
        seed_sessao(db_session, numero=numero, resumo=f"MARCA-{numero} " + "x" * 1400)
    visto = []
    resposta = propor_fios(db_session, _ctx(), client=_client(visto, '{"fios":[]}'))
    contexto = visto[0]["messages"][1]["content"]
    assert resposta["sessoes_omitidas"] > 0
    assert "MARCA-12 " in contexto and "MARCA-1 " not in contexto
    assert len(visto[0]["messages"][0]["content"]) + len(contexto) <= 4500


def test_saida_invalida_e_vazia(db_session, monkeypatch):
    monkeypatch.setattr(settings, "deepseek_api_key", "teste")
    seed_sessao(db_session, numero=1, resumo="História")
    assert propor_fios(db_session, _ctx(), client=_client([], "inválido"))["estado"] == "falha"
    assert propor_fios(db_session, _ctx(), client=_client([], '{"fios":[]}'))["estado"] == "vazio"
    assert propor_fios(db_session, _ctx(), client=_client([], "   "))["estado"] == "falha"


def test_rota_modulo_desligado(client, db_session):
    seed_sessao(db_session, numero=1, resumo="História")
    resposta = client.post(f"/api/c/{TEST_CAMPAIGN_SLUG}/admin/fios/propor", json={})
    assert resposta.status_code == 403
    assert resposta.json()["detail"]["erro"] == "IA_MODULO_DESABILITADO"


def test_rota_payload_e_nao_persistencia(client, db_session, monkeypatch):
    monkeypatch.setattr(settings, "deepseek_api_key", "teste")
    client.patch(f"/api/campanhas/{TEST_CAMPAIGN_SLUG}/modulos", json={"modulo": MODULO_IA, "ativo": True})
    seed_sessao(db_session, numero=1, resumo="História")
    vistos = []
    def post(payload, chave, http_client, **kwargs):
        vistos.append((payload, kwargs))
        return httpx.Response(200, json={"choices": [{"message": {"content": '{"fios":[{"titulo":"Novo","descricao":"Detalhe","sessao_numero":1}]}'}}]})
    monkeypatch.setattr("app.services.ia_provider._post", post)
    url = f"/api/c/{TEST_CAMPAIGN_SLUG}/admin/fios/propor"
    response = client.post(url, json={})
    assert response.status_code == 200 and response.json()["estado"] == "propostas"
    assert response.json()["fios"][0]["sessao_numero"] == 1
    assert json.loads(vistos[0][0]["messages"][1]["content"])
    assert vistos[0][1]["timeout"] == settings.ia_assistente_timeout_seconds
    assert not db_session.query(FioNarrativo).all()


def test_rota_falha_provedor_e_limite(client, db_session, monkeypatch):
    monkeypatch.setattr(settings, "deepseek_api_key", "teste")
    client.patch(f"/api/campanhas/{TEST_CAMPAIGN_SLUG}/modulos", json={"modulo": MODULO_IA, "ativo": True})
    seed_sessao(db_session, numero=1, resumo="História")
    chamadas = []
    def post(*args, **kwargs):
        chamadas.append(1)
        return httpx.Response(503)
    monkeypatch.setattr("app.services.ia_provider._post", post)
    url = f"/api/c/{TEST_CAMPAIGN_SLUG}/admin/fios/propor"
    for _ in range(10):
        response = client.post(url, json={})
        assert response.status_code == 200 and response.json()["estado"] == "falha"
    assert client.post(url, json={}).status_code == 429
    assert len(chamadas) == 10


def test_mensagens_falha_sem_persistencia(db_session, monkeypatch):
    monkeypatch.setattr(settings, "deepseek_api_key", None)
    seed_sessao(db_session, numero=1, resumo="História")
    sem_chave = propor_fios(db_session, _ctx())
    assert sem_chave["estado"] == "falha" and "chave" in sem_chave["mensagem"]
    monkeypatch.setattr(settings, "deepseek_api_key", "teste")
    def timeout(_request):
        raise httpx.ReadTimeout("segredo")
    expirado = propor_fios(db_session, _ctx(), client=httpx.Client(transport=httpx.MockTransport(timeout)))
    assert expirado["estado"] == "falha" and "demorou" in expirado["mensagem"]
    assert not db_session.query(FioNarrativo).all()


def test_rota_jogador_negado(client, db_session, control_session, monkeypatch):
    from app.models.usuario import Membro
    from app.services.auth_admin import create_usuario_with_invite
    from app.services.auth_invite import accept_activate_invite
    from tests.conftest import login_as

    client.patch(f"/api/campanhas/{TEST_CAMPAIGN_SLUG}/modulos", json={"modulo": MODULO_IA, "ativo": True})
    campanha = lookup_campanha(TEST_CAMPAIGN_SLUG)
    user, token = create_usuario_with_invite(control_session, "jogador-fios@teste.local")
    accept_activate_invite(control_session, token, "test-secret-ok")
    control_session.add(Membro(usuario_id=user.id, campanha_id=campanha.id, papel="jogador"))
    control_session.commit()
    login_as(client, email=user.email, password="test-secret-ok")
    chamadas = []
    monkeypatch.setattr("app.services.ia_provider._post", lambda *a, **k: chamadas.append(1))
    response = client.post(f"/api/c/{TEST_CAMPAIGN_SLUG}/admin/fios/propor", json={})
    assert response.status_code == 403 and not chamadas
