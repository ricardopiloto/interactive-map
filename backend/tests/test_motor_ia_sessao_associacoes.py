"""Session association suggestions. The DeepSeek client is mocked; nothing is persisted."""

from __future__ import annotations

import json

import httpx

from app.campaign_db import lookup_campanha
from app.config import settings
from app.deps.auth import MembroContext
from app.models.usuario import Membro, Usuario
from app.services.ia_provider import MODULO_IA, montar_contexto
from app.services.motor_ia_sessao_associacoes import (
    MSG_FALHA,
    MSG_VAZIO,
    PROMPT_PADRAO,
    coletar_registros,
    sugerir_associacoes,
)
from tests.conftest import TEST_CAMPAIGN_SLUG
from tests.helpers import seed_local, seed_personagem

CHAVE = "sk-sessao-teste"


def _ctx() -> MembroContext:
    campanha = lookup_campanha(TEST_CAMPAIGN_SLUG)
    ativos = [item for item in (campanha.modulos_ativos or []) if isinstance(item, str)]
    if MODULO_IA not in ativos:
        campanha.modulos_ativos = [*ativos, MODULO_IA]
    return MembroContext(
        usuario=Usuario(id=1, email="gm@teste.local"),
        campanha=campanha,
        membro=Membro(usuario_id=1, campanha_id=campanha.id or 0, papel="dono"),
    )


def _client(handler) -> httpx.Client:
    return httpx.Client(transport=httpx.MockTransport(handler))


def _ok(body: dict | str):
    content = body if isinstance(body, str) else json.dumps(body, ensure_ascii=False)

    def handler(request: httpx.Request) -> httpx.Response:
        handler.visto = json.loads(request.content.decode())  # type: ignore[attr-defined]
        return httpx.Response(200, json={"choices": [{"message": {"content": content}}]})

    return handler


def test_chamada_envia_prompt_e_resumo_antes_do_catalogo(db_session, monkeypatch) -> None:
    monkeypatch.setattr(settings, "deepseek_api_key", CHAVE)
    local = seed_local(db_session, nome="Altdorf")
    pessoa = seed_personagem(db_session, nome="Ettore")
    handler = _ok({"local_ids": [local.id], "personagem_ids": [pessoa.id]})

    resultado = sugerir_associacoes(
        db_session,
        _ctx(),
        "O grupo chega a Altdorf com Ettore.",
        client=_client(handler),
    )
    mensagens = handler.visto["messages"]  # type: ignore[attr-defined]
    assert mensagens[0]["role"] == "system"
    assert mensagens[0]["content"] == PROMPT_PADRAO
    usuario = json.loads(mensagens[1]["content"])
    assert usuario[0]["tipo"] == "resumo"
    assert "Altdorf" in usuario[0]["texto"]
    assert any(item["tipo"] == "local" and item["id"] == local.id for item in usuario)
    assert resultado.estado == "sugestoes"
    assert resultado.local_ids == [local.id]
    assert resultado.personagem_ids == [pessoa.id]


def test_id_inexistente_e_descartado(db_session, monkeypatch) -> None:
    monkeypatch.setattr(settings, "deepseek_api_key", CHAVE)
    local = seed_local(db_session, nome="Altdorf")
    handler = _ok({"local_ids": [local.id, 999], "personagem_ids": [404]})
    resultado = sugerir_associacoes(db_session, _ctx(), "Em Altdorf.", client=_client(handler))
    assert resultado.estado == "sugestoes"
    assert resultado.local_ids == [local.id]
    assert resultado.personagem_ids == []


def test_ocultos_nao_entram_no_catalogo_nem_na_sugestao(db_session, monkeypatch) -> None:
    monkeypatch.setattr(settings, "deepseek_api_key", CHAVE)
    visivel = seed_local(db_session, nome="Altdorf")
    oculto = seed_local(db_session, nome="SEGREDO-LOCAL", visivel=False)
    pessoa_oculta = seed_personagem(db_session, nome="SEGREDO-PESSOA", visivel=False)
    campanha = lookup_campanha(TEST_CAMPAIGN_SLUG)
    contexto = montar_contexto(campanha.id or 0, coletar_registros(db_session, campanha.id or 0, "texto"))
    textos = " ".join(item["texto"] for item in contexto)
    assert "Altdorf" in textos
    assert "SEGREDO-LOCAL" not in textos
    assert "SEGREDO-PESSOA" not in textos

    handler = _ok(
        {"local_ids": [visivel.id, oculto.id], "personagem_ids": [pessoa_oculta.id]}
    )
    resultado = sugerir_associacoes(db_session, _ctx(), "Em Altdorf.", client=_client(handler))
    assert oculto.id not in resultado.local_ids
    assert pessoa_oculta.id not in resultado.personagem_ids
    assert resultado.local_ids == [visivel.id]
    usuario = json.loads(handler.visto["messages"][1]["content"])  # type: ignore[attr-defined]
    assert all(item["texto"] != "SEGREDO-LOCAL" for item in usuario)
    assert all(item["texto"] != "SEGREDO-PESSOA" for item in usuario)


def test_listas_vazias_nao_sao_falha(db_session, monkeypatch) -> None:
    monkeypatch.setattr(settings, "deepseek_api_key", CHAVE)
    seed_local(db_session, nome="Altdorf")
    handler = _ok({"local_ids": [], "personagem_ids": []})
    resultado = sugerir_associacoes(db_session, _ctx(), "Nada reconhecível.", client=_client(handler))
    assert resultado.estado == "vazio"
    assert resultado.mensagem == MSG_VAZIO
    assert resultado.local_ids == []


def test_falha_do_provedor_nao_expoe_detalhe(db_session, monkeypatch) -> None:
    monkeypatch.setattr(settings, "deepseek_api_key", CHAVE)
    seed_local(db_session, nome="Altdorf")

    def handler(_request: httpx.Request) -> httpx.Response:
        return httpx.Response(500, json={"error": "raw-provider-error", "key": CHAVE})

    resultado = sugerir_associacoes(db_session, _ctx(), "Em Altdorf.", client=_client(handler))
    assert resultado.estado == "falha"
    assert resultado.mensagem == MSG_FALHA
    assert CHAVE not in resultado.mensagem
    assert "raw-provider-error" not in resultado.mensagem


def test_rota_modulo_desligado_nao_chama_o_provedor(client, db_session, monkeypatch) -> None:
    monkeypatch.setattr(settings, "deepseek_api_key", CHAVE)
    local = seed_local(db_session, nome="Altdorf")
    desligado = client.patch(
        f"/api/campanhas/{TEST_CAMPAIGN_SLUG}/modulos",
        json={"modulo": "ia_arcos", "ativo": False},
    )
    assert desligado.status_code == 200, desligado.text

    def handler(_request: httpx.Request) -> httpx.Response:
        raise AssertionError("rede não deveria ser chamada")

    monkeypatch.setattr("app.services.ia_provider.httpx.Client", lambda *args, **kwargs: _client(handler))
    antes = client.get(f"/api/c/{TEST_CAMPAIGN_SLUG}/admin/sessoes")
    resposta = client.post(
        f"/api/c/{TEST_CAMPAIGN_SLUG}/admin/sessoes/sugerir-associacoes",
        json={"resumo": "O grupo chega a Altdorf."},
    )
    assert resposta.status_code == 200, resposta.text
    corpo = resposta.json()
    assert corpo["estado"] == "falha"
    assert corpo["local_ids"] == []
    assert corpo["personagem_ids"] == []
    depois = client.get(f"/api/c/{TEST_CAMPAIGN_SLUG}/admin/sessoes")
    assert len(depois.json()["sessoes"]) == len(antes.json()["sessoes"])
    assert local.id


def test_rota_resumo_vazio_nao_chama_o_provedor(client) -> None:
    def handler(_request: httpx.Request) -> httpx.Response:
        raise AssertionError("rede não deveria ser chamada")

    resposta = client.post(
        f"/api/c/{TEST_CAMPAIGN_SLUG}/admin/sessoes/sugerir-associacoes",
        json={"resumo": "   "},
    )
    assert resposta.status_code == 422


def test_rota_aplica_sugestao_sem_gravar(client, db_session, monkeypatch) -> None:
    monkeypatch.setattr(settings, "deepseek_api_key", CHAVE)
    local = seed_local(db_session, nome="Altdorf")
    pessoa = seed_personagem(db_session, nome="Ettore")
    ligado = client.patch(
        f"/api/campanhas/{TEST_CAMPAIGN_SLUG}/modulos",
        json={"modulo": "ia_arcos", "ativo": True},
    )
    assert ligado.status_code == 200, ligado.text

    class FalsoCliente:
        def __init__(self, *args, **kwargs) -> None:
            pass

        def __enter__(self):
            return self

        def __exit__(self, *args) -> bool:
            return False

        def post(self, url, json=None, headers=None):  # noqa: A002
            return httpx.Response(
                200,
                json={
                    "choices": [
                        {
                            "message": {
                                "content": json_content(local.id, pessoa.id),
                            }
                        }
                    ]
                },
            )

    monkeypatch.setattr("app.services.ia_provider.httpx.Client", FalsoCliente)
    resposta = client.post(
        f"/api/c/{TEST_CAMPAIGN_SLUG}/admin/sessoes/sugerir-associacoes",
        json={"resumo": "Ettore em Altdorf."},
    )
    assert resposta.status_code == 200, resposta.text
    corpo = resposta.json()
    assert corpo["estado"] == "sugestoes"
    assert corpo["local_ids"] == [local.id]
    assert corpo["personagem_ids"] == [pessoa.id]
    gravadas = client.get(f"/api/c/{TEST_CAMPAIGN_SLUG}/admin/sessoes").json()["sessoes"]
    assert all(local.id not in [item["id"] for item in sessao["locais"]] for sessao in gravadas)


def json_content(local_id: int, pessoa_id: int) -> str:
    return json.dumps({"local_ids": [local_id], "personagem_ids": [pessoa_id]})
