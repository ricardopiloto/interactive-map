import json
import re

import httpx
import pytest

from app.campaign_db import lookup_campanha
from app.config import settings
from app.deps.auth import MembroContext
from app.models.usuario import Membro, Usuario
from app.schemas.ia_assistente import AssistirRequest
from app.services.ia_provider import MODULO_IA
from app.services.motor_ia_assistente import BLOCOS_TIPO, PLACEHOLDER_MECANICA, PROMPT_BASE, assistir, renderizar_prompt
from app.services.rate_limit import limiter
from tests.conftest import TEST_CAMPAIGN_SLUG
from tests.helpers import seed_personagem, seed_sessao


@pytest.fixture(autouse=True)
def _limpar_limiter():
    limiter._storage.reset()


def _ctx():
    campanha = lookup_campanha(TEST_CAMPAIGN_SLUG)
    campanha.modulos_ativos = [MODULO_IA]
    return MembroContext(Usuario(id=1, email="gm@teste.local"), campanha, Membro(usuario_id=1, campanha_id=campanha.id, papel="dono"))


def _client(visto, texto="Sugestão pronta"):
    def handler(request):
        visto.append(json.loads(request.content))
        return httpx.Response(200, json={"choices": [{"message": {"content": texto}}]})
    return httpx.Client(transport=httpx.MockTransport(handler))


def test_prompts_fixos():
    assert "oculto" in PROMPT_BASE
    for tipo, bloco in BLOCOS_TIPO.items():
        prompt = renderizar_prompt(tipo, True)
        assert bloco in prompt
        assert not re.search(r"\{[^}]+\}", prompt)
        assert "idioma" in prompt and "caracteres" in prompt
        assert "---" not in prompt and "[[" not in prompt
    for tipo in ("rascunho_sessao", "fios_narrativos", "descricao_personagem"):
        assert PLACEHOLDER_MECANICA in renderizar_prompt(tipo, True)


def test_payload_ocultos_e_texto_como_dados(db_session, monkeypatch, caplog):
    monkeypatch.setattr(settings, "deepseek_api_key", "teste")
    seed_sessao(db_session, numero=1, resumo="HISTORIA-SECRETA", visivel=False)
    seed_personagem(db_session, nome="PESSOA-SECRETA", visivel=False)
    visto = []
    pedido = AssistirRequest(tipo="rascunho_sessao", texto_atual="TEXTO-ATUAL", instrucao="INSTRUCAO-MESTRE")
    resposta = assistir(db_session, _ctx(), pedido, client=_client(visto))
    assert resposta.estado == "sugestao" and resposta.usou_conteudo_oculto
    system, user = (m["content"] for m in visto[0]["messages"])
    assert "TEXTO-ATUAL" not in system and "INSTRUCAO-MESTRE" not in system
    assert "TEXTO-ATUAL" in user and "INSTRUCAO-MESTRE" in user
    assert any(x.get("oculto") for x in json.loads(user))
    assert "HISTORIA-SECRETA" not in caplog.text and "Sugestão pronta" not in caplog.text


def test_orcamento_preserva_recente(db_session, monkeypatch):
    monkeypatch.setattr(settings, "deepseek_api_key", "teste")
    monkeypatch.setattr(settings, "ia_assistente_contexto_max_chars", 5000)
    for n in range(1, 9):
        seed_sessao(db_session, numero=n, resumo=f"SESSAO-{n} " + "x" * 1200)
    visto = []
    assistir(db_session, _ctx(), AssistirRequest(tipo="fios_narrativos", texto_atual="y" * 500), client=_client(visto))
    system, user = (m["content"] for m in visto[0]["messages"])
    assert len(system) + len(user) <= 5000
    assert "SESSAO-8" in user and "SESSAO-1" not in user


def test_vazio(db_session):
    assert assistir(db_session, _ctx(), AssistirRequest(tipo="fios_narrativos")).estado == "vazio"


def test_rota_validacao_e_publico(client, db_session, monkeypatch):
    monkeypatch.setattr(settings, "deepseek_api_key", "teste")
    client.patch(f"/api/campanhas/{TEST_CAMPAIGN_SLUG}/modulos", json={"modulo": "ia_arcos", "ativo": True})
    pessoa = seed_personagem(db_session, nome="Visível")
    visto = []
    monkeypatch.setattr("app.services.ia_provider._post", lambda payload, chave, http_client, **kwargs: (visto.append(payload) or httpx.Response(200, json={"choices": [{"message": {"content": "  Texto  "}}]})))
    url = f"/api/c/{TEST_CAMPAIGN_SLUG}/admin/ia/assistir"
    assert client.post(url, json={"tipo": "notas_mecanicas"}).status_code == 422
    assert client.post(url, json={"tipo": "descricao_local"}).status_code == 422
    assert client.post(url, json={"tipo": "descricao_local", "alvo_id": 999999}).status_code == 404
    r = client.post(url, json={"tipo": "descricao_personagem", "alvo_id": pessoa.id, "campo_publico": False})
    assert r.status_code == 200, r.text
    assert r.json()["texto"] == "Texto"
    assert "(true)" in visto[-1]["messages"][0]["content"]
    assert db_session.get(type(pessoa), pessoa.id).descricao == ""


def test_publico_nao_serializa_notas(client, db_session):
    sessao = seed_sessao(db_session, numero=1, notas_preparo="SEGREDO-PREPARO")
    pessoa = seed_personagem(db_session, nome="Pessoa", notas_mecanicas="SEGREDO-MECANICO")
    s = client.get(f"/api/c/{TEST_CAMPAIGN_SLUG}/sessoes/{sessao.id}")
    p = client.get(f"/api/c/{TEST_CAMPAIGN_SLUG}/personagens/{pessoa.id}")
    assert s.status_code == 200 and p.status_code == 200
    assert "notas_preparo" not in s.json() and p.json()["notas_mecanicas"] == ""


def test_resposta_vazia_e_truncamento(db_session, monkeypatch):
    monkeypatch.setattr(settings, "deepseek_api_key", "teste")
    seed_sessao(db_session, numero=1, resumo="Primeira")
    seed_sessao(db_session, numero=2, resumo="Segunda")
    pedido = AssistirRequest(tipo="rascunho_sessao")
    vazio = assistir(db_session, _ctx(), pedido, client=_client([], "   "))
    assert vazio.estado == "falha"
    grande = "Parágrafo inicial.\n\n" + "x" * 51000
    resposta = assistir(db_session, _ctx(), pedido, client=_client([], grande))
    assert resposta.estado == "sugestao" and resposta.truncado
    assert resposta.texto == "Parágrafo inicial."
    assert resposta.limite_caracteres == 50000 and resposta.campo_destino == "notas_preparo"


def test_publico_no_servico(db_session, monkeypatch):
    monkeypatch.setattr(settings, "deepseek_api_key", "teste")
    pessoa = seed_personagem(db_session, nome="Personagem", visivel=True)
    visto = []
    assistir(db_session, _ctx(), AssistirRequest(tipo="descricao_personagem", alvo_id=pessoa.id, campo_publico=False), client=_client(visto))
    assert "(true)" in visto[0]["messages"][0]["content"]
    visto.clear()
    assistir(
        db_session, _ctx(),
        AssistirRequest(tipo="descricao_personagem", alvo_id=pessoa.id),
        client=_client(visto),
    )
    assert "(true)" in visto[0]["messages"][0]["content"]
    visto.clear()
    seed_sessao(db_session, numero=1, resumo="Primeira")
    assistir(db_session, _ctx(), AssistirRequest(tipo="rascunho_sessao", campo_publico=True, texto_atual="Texto"), client=_client(visto))
    assert "(false)" in visto[0]["messages"][0]["content"]


def _ligar_ia(client):
    response = client.patch(
        f"/api/campanhas/{TEST_CAMPAIGN_SLUG}/modulos",
        json={"modulo": MODULO_IA, "ativo": True},
    )
    assert response.status_code == 200, response.text


def _rota(slug=TEST_CAMPAIGN_SLUG):
    return f"/api/c/{slug}/admin/ia/assistir"


def test_rota_modulo_desligado_sem_provedor(client, db_session, monkeypatch):
    seed_sessao(db_session, numero=1, resumo="Primeira")
    seed_sessao(db_session, numero=2, resumo="Segunda")
    chamadas = []
    monkeypatch.setattr(
        "app.services.ia_provider._post",
        lambda *args, **kwargs: chamadas.append(args),
    )
    response = client.post(_rota(), json={"tipo": "rascunho_sessao"})
    assert response.status_code == 403
    assert response.json()["detail"]["erro"] == "IA_MODULO_DESABILITADO"
    assert not chamadas


def test_rota_jogador_negado_sem_provedor(client, db_session, control_session, monkeypatch):
    from app.models.usuario import Membro
    from app.services.auth_admin import create_usuario_with_invite
    from app.services.auth_invite import accept_activate_invite
    from tests.conftest import login_as

    _ligar_ia(client)
    campanha = lookup_campanha(TEST_CAMPAIGN_SLUG)
    user, token = create_usuario_with_invite(control_session, "jogador@teste.local")
    accept_activate_invite(control_session, token, "test-secret-ok")
    control_session.add(Membro(usuario_id=user.id, campanha_id=campanha.id, papel="jogador"))
    control_session.commit()
    login_as(client, email="jogador@teste.local", password="test-secret-ok")
    chamadas = []
    monkeypatch.setattr("app.services.ia_provider._post", lambda *args, **kwargs: chamadas.append(args))
    response = client.post(_rota(), json={"tipo": "rascunho_sessao"})
    assert response.status_code == 403
    assert not chamadas


def test_rota_validacoes_sem_provedor(client, db_session, monkeypatch):
    _ligar_ia(client)
    chamadas = []
    monkeypatch.setattr("app.services.ia_provider._post", lambda *args, **kwargs: chamadas.append(args))
    for payload, status in (
        ({"tipo": "notas_mecanicas"}, 422),
        ({"tipo": "descricao_personagem"}, 422),
        ({"tipo": "descricao_local", "alvo_id": 999999}, 404),
    ):
        assert client.post(_rota(), json=payload).status_code == status
    assert not chamadas


def test_rota_limite_decimo_primeiro_sem_provedor(client, db_session, monkeypatch):
    _ligar_ia(client)
    chamadas = []
    monkeypatch.setattr("app.services.ia_provider._post", lambda *args, **kwargs: chamadas.append(args))
    for _ in range(10):
        assert client.post(_rota(), json={"tipo": "rascunho_sessao"}).status_code == 200
    response = client.post(_rota(), json={"tipo": "rascunho_sessao"})
    assert response.status_code == 429
    assert not chamadas


def test_timeout_e_erro_nao_persistem(db_session, monkeypatch):
    monkeypatch.setattr(settings, "deepseek_api_key", "teste")
    pessoa = seed_personagem(db_session, nome="Antes")

    def timeout(_request):
        raise httpx.ReadTimeout("segredo do provedor")

    def erro(_request):
        return httpx.Response(503, text="segredo do provedor")

    pedido = AssistirRequest(tipo="descricao_personagem", alvo_id=pessoa.id, texto_atual="Rascunho")
    for handler in (timeout, erro):
        response = assistir(
            db_session, _ctx(), pedido,
            client=httpx.Client(transport=httpx.MockTransport(handler)),
        )
        assert response.estado == "falha"
        assert "segredo do provedor" not in response.mensagem
        db_session.refresh(pessoa)
        assert pessoa.descricao == ""


def test_oculto_cortado_pelo_orcamento(db_session, monkeypatch):
    monkeypatch.setattr(settings, "deepseek_api_key", "teste")
    monkeypatch.setattr(settings, "ia_assistente_contexto_max_chars", 2500)
    seed_sessao(db_session, numero=1, resumo="SEGREDO-ANTIGO " + "z" * 1400, visivel=False)
    for n in range(2, 8):
        seed_sessao(db_session, numero=n, resumo=f"PUBLICO-{n} " + "x" * 100)
    visto = []
    response = assistir(
        db_session, _ctx(), AssistirRequest(tipo="rascunho_sessao"),
        client=_client(visto),
    )
    user = visto[0]["messages"][1]["content"]
    assert response.estado == "sugestao"
    assert "SEGREDO-ANTIGO" not in user
    assert response.usou_conteudo_oculto is False


def test_assistencia_envia_ocultos_mas_associacoes_nao(db_session, monkeypatch):
    from app.services.motor_ia_sessao_associacoes import sugerir_associacoes

    monkeypatch.setattr(settings, "deepseek_api_key", "teste")
    seed_sessao(db_session, numero=1, resumo="SESSAO-OCULTA", visivel=False)
    seed_personagem(db_session, nome="PESSOA-OCULTA", visivel=False)
    assistente = []
    assistir(
        db_session, _ctx(), AssistirRequest(tipo="rascunho_sessao", texto_atual="Rascunho"),
        client=_client(assistente),
    )
    associacoes = []
    resposta_associacoes = json.dumps({"local_ids": [], "personagem_ids": []})
    sugerir_associacoes(
        db_session, _ctx(), "Resumo público",
        client=_client(associacoes, resposta_associacoes),
    )
    payload_assistente = assistente[0]["messages"][1]["content"]
    payload_associacoes = associacoes[0]["messages"][1]["content"]
    assert "SESSAO-OCULTA" in payload_assistente
    assert "PESSOA-OCULTA" in payload_assistente
    assert "SESSAO-OCULTA" not in payload_associacoes
    assert "PESSOA-OCULTA" not in payload_associacoes


def test_dono_duas_campanhas_payload_isolado(db_session, monkeypatch):
    from app.campaign_db import resolve_campaign_session
    from app.cli import _create_campanha
    from app.services.auth_admin import assign_owner
    from app.campaign_db import get_control_engine
    from sqlmodel import Session
    from fastapi import HTTPException

    monkeypatch.setattr(settings, "deepseek_api_key", "teste")
    outra = _create_campanha(slug="outra-mesa", nome="Outra", sistema="outro")
    outra.modulos_ativos = [MODULO_IA]
    with Session(get_control_engine()) as control:
        assign_owner(control, "outra-mesa", "gm@teste.local")
    with resolve_campaign_session("outra-mesa") as sessao_b:
        for numero in range(1, 3):
            seed_sessao(sessao_b, numero=numero, resumo="SOMENTE-CAMPANHA-B")
        pessoa_b = seed_personagem(sessao_b, nome="PESSOA-CAMPANHA-B")
        id_b = pessoa_b.id
    for numero in range(1, 3):
        seed_sessao(db_session, numero=numero, resumo="SOMENTE-CAMPANHA-A")
    visto = []
    resposta = assistir(
        db_session, _ctx(), AssistirRequest(tipo="rascunho_sessao"),
        client=_client(visto),
    )
    assert resposta.estado == "sugestao"
    payload = visto[0]["messages"][1]["content"]
    assert "SOMENTE-CAMPANHA-A" in payload
    assert "SOMENTE-CAMPANHA-B" not in payload
    assert "PESSOA-CAMPANHA-B" not in payload
    with __import__("pytest").raises(HTTPException) as exc:
        assistir(
            db_session, _ctx(),
            AssistirRequest(tipo="descricao_personagem", alvo_id=id_b),
            client=_client(visto),
        )
    assert exc.value.status_code == 404
    assert len(visto) == 1


def test_dono_de_outra_campanha_negado_sem_provedor(client, control_session, monkeypatch):
    from app.cli import _create_campanha
    from app.services.auth_admin import assign_owner, create_usuario_with_invite
    from app.services.auth_invite import accept_activate_invite
    from tests.conftest import login_as

    _ligar_ia(client)
    _create_campanha(slug="mesa-segunda", nome="Segunda", sistema="outro")
    user, token = create_usuario_with_invite(control_session, "outra@teste.local")
    accept_activate_invite(control_session, token, "test-secret-ok")
    assign_owner(control_session, "mesa-segunda", user.email)
    login_as(client, email=user.email, password="test-secret-ok")
    chamadas = []
    monkeypatch.setattr("app.services.ia_provider._post", lambda *args, **kwargs: chamadas.append(args))
    response = client.post(_rota(), json={"tipo": "rascunho_sessao"})
    assert response.status_code == 403
    assert not chamadas


def test_rascunho_destino_prioridade_e_sessao_sem_resumo(db_session, monkeypatch):
    monkeypatch.setattr(settings, "deepseek_api_key", "teste")
    seed_sessao(db_session, numero=1, resumo="", notas_preparo="NOTAS-ANTERIORES")
    seed_sessao(db_session, numero=2, resumo="Resumo anterior")
    visto = []
    resposta = assistir(
        db_session, _ctx(),
        AssistirRequest(tipo="rascunho_sessao", texto_atual="Notas atuais"),
        client=_client(visto),
    )
    assert resposta.campo_destino == "notas_preparo"
    assert resposta.limite_caracteres == 50000
    assert "NOTAS-ANTERIORES" in visto[0]["messages"][1]["content"]
    assert "instrução do mestre" in visto[0]["messages"][0]["content"]
    assert "texto já escrito" in visto[0]["messages"][0]["content"]
    assert visto[0]["max_tokens"] == 16000


def test_fios_inclui_notas_quando_resumo_vazio(db_session, monkeypatch):
    monkeypatch.setattr(settings, "deepseek_api_key", "teste")
    seed_sessao(db_session, numero=1, resumo="", notas_preparo="FIO-NAS-NOTAS")
    seed_sessao(db_session, numero=2, resumo="Outra sessão")
    visto = []
    resposta = assistir(
        db_session, _ctx(), AssistirRequest(tipo="fios_narrativos"),
        client=_client(visto),
    )
    assert resposta.campo_destino == "notas_preparo"
    assert "FIO-NAS-NOTAS" in visto[0]["messages"][1]["content"]


def test_falha_avisa_sem_conteudo(db_session, monkeypatch, caplog):
    monkeypatch.setattr(settings, "deepseek_api_key", None)
    seed_sessao(db_session, numero=1, resumo="SEGREDO-NA-CAMPANHA")
    seed_sessao(db_session, numero=2, resumo="Mais contexto")
    with caplog.at_level("WARNING"):
        resposta = assistir(db_session, _ctx(), AssistirRequest(tipo="rascunho_sessao"))
    assert resposta.estado == "falha"
    assert resposta.mensagem == "IA indisponível: configure a chave do provedor"
    assert "IA_CREDENCIAL_AUSENTE" in caplog.text
    assert "SEGREDO-NA-CAMPANHA" not in caplog.text


def test_assistente_usa_timeout_dedicado(db_session, monkeypatch):
    from app.services.ia_provider import IaResultado

    seed_sessao(db_session, numero=1, resumo="Primeira")
    seed_sessao(db_session, numero=2, resumo="Segunda")
    vistos = []

    def completar_falso(**kwargs):
        vistos.append(kwargs["timeout"])
        return IaResultado(True, "ok", "", "Sugestão")

    monkeypatch.setattr("app.services.motor_ia_assistente.completar", completar_falso)
    monkeypatch.setattr(settings, "ia_assistente_timeout_seconds", 145.0)
    resposta = assistir(db_session, _ctx(), AssistirRequest(tipo="rascunho_sessao"))
    assert resposta.estado == "sugestao"
    assert vistos == [145.0]


def test_resumo_usa_notas_e_campo_publico(db_session, monkeypatch):
    monkeypatch.setattr(settings, "deepseek_api_key", "teste")
    sessao = seed_sessao(
        db_session, numero=1, notas_preparo="RASCUNHO-DA-SESSAO", visivel=False,
    )
    visto = []
    resposta = assistir(
        db_session, _ctx(),
        AssistirRequest(
            tipo="resumo_sessao", alvo_id=sessao.id, campo_publico=True,
        ),
        client=_client(visto),
    )
    assert resposta.campo_destino == "resumo"
    assert "(true)" in visto[0]["messages"][0]["content"]
    assert "RASCUNHO-DA-SESSAO" in visto[0]["messages"][1]["content"]
