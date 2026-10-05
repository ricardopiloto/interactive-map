"""Arc proposal motor. The DeepSeek client is mocked; nothing is persisted by the proposal itself."""

from __future__ import annotations

import json

import httpx

from app.campaign_db import lookup_campanha
from app.config import settings
from app.deps.auth import MembroContext
from app.models.usuario import Membro, Usuario
from app.services.ia_provider import MODULO_IA
from app.services.motor_ia_arcos import (
    MSG_FALHA,
    MSG_INSUFICIENTE,
    PROMPT_PADRAO,
    contexto_para_motor,
    prompt_tem_regras_obrigatorias,
    propor_arcos,
)
from tests.conftest import TEST_CAMPAIGN_SLUG
from tests.helpers import seed_arco, seed_local, seed_personagem, seed_sessao

CHAVE = "sk-motor-teste"


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


def _resposta(propostas: list[dict] | str) -> str:
    if isinstance(propostas, str):
        return propostas
    return json.dumps({"propostas": propostas}, ensure_ascii=False)


def _ok(body: str):
    def handler(request: httpx.Request) -> httpx.Response:
        handler.visto = json.loads(request.content.decode())  # type: ignore[attr-defined]
        return httpx.Response(200, json={"choices": [{"message": {"content": body}}]})

    return handler


def test_prompt_padrao_contem_as_cinco_regras() -> None:
    assert prompt_tem_regras_obrigatorias(PROMPT_PADRAO)
    assert "Nunca invente ou presuma uma sessão" in PROMPT_PADRAO
    assert "identifique-a explicitamente como transição" in PROMPT_PADRAO
    assert "responda com uma lista vazia" in PROMPT_PADRAO
    assert "retorne: título curto" in PROMPT_PADRAO
    assert "formato estruturado solicitado" in PROMPT_PADRAO
    assert '"propostas"' in PROMPT_PADRAO


def test_contexto_reflete_sessoes_e_omite_oculta(db_session) -> None:
    local = seed_local(db_session, nome="Taverna")
    pessoa = seed_personagem(db_session, nome="Greta")
    seed_sessao(
        db_session,
        numero=1,
        titulo="Chegada",
        resumo="O grupo entra na taverna.",
        local_ids=[local.id],
        personagem_ids=[pessoa.id],
    )
    seed_sessao(
        db_session,
        numero=2,
        titulo="Oculta",
        resumo="SEGREDO-OCULTO",
        visivel=False,
        local_ids=[local.id],
    )
    campanha = lookup_campanha(TEST_CAMPAIGN_SLUG)
    contexto = contexto_para_motor(db_session, campanha.id or 0)
    textos = "\n".join(item["texto"] for item in contexto)
    assert "O grupo entra na taverna." in textos
    assert "Taverna" in textos
    assert "Greta" in textos
    assert "SEGREDO-OCULTO" not in textos
    assert all(item["campanha_id"] == campanha.id for item in contexto)


def test_chamada_envia_prompt_antes_dos_dados(db_session, monkeypatch) -> None:
    monkeypatch.setattr(settings, "deepseek_api_key", CHAVE)
    seed_sessao(db_session, numero=1, titulo="Um", resumo="Resumo um")
    seed_sessao(db_session, numero=2, titulo="Dois", resumo="Resumo dois")
    handler = _ok(_resposta([{"titulo": "Fio", "resumo": "Um fio.", "sessoes": [1, 2], "locais": []}]))

    resultado = propor_arcos(db_session, _ctx(), client=_client(handler))
    mensagens = handler.visto["messages"]  # type: ignore[attr-defined]
    assert mensagens[0]["role"] == "system"
    assert mensagens[0]["content"] == PROMPT_PADRAO
    assert mensagens[1]["role"] == "user"
    assert "Resumo um" in mensagens[1]["content"]
    assert PROMPT_PADRAO not in mensagens[1]["content"]
    assert resultado.estado == "propostas"
    assert resultado.propostas[0].titulo == "Fio"


def test_referencia_inexistente_sai_da_proposta(db_session, monkeypatch) -> None:
    monkeypatch.setattr(settings, "deepseek_api_key", CHAVE)
    local = seed_local(db_session, nome="Taverna")
    um = seed_sessao(db_session, numero=1, titulo="Um", resumo="Resumo um", local_ids=[local.id])
    seed_sessao(db_session, numero=2, titulo="Dois", resumo="Resumo dois")
    handler = _ok(
        _resposta(
            [
                {
                    "titulo": "Fio",
                    "resumo": "Um fio.",
                    "sessoes": [1, 99],
                    "locais": ["Taverna", "Lugar inventado"],
                }
            ]
        )
    )
    resultado = propor_arcos(db_session, _ctx(), client=_client(handler))
    assert resultado.estado == "propostas"
    proposta = resultado.propostas[0]
    assert proposta.sessao_ids == [um.id]
    assert 99 not in proposta.sessao_ids
    assert proposta.local_ids == [local.id]


def test_sessao_de_outro_arco_so_entra_como_transicao(db_session, monkeypatch) -> None:
    monkeypatch.setattr(settings, "deepseek_api_key", CHAVE)
    arco = seed_arco(db_session, titulo="Já existe")
    livre = seed_sessao(db_session, numero=1, titulo="Livre", resumo="Livre")
    seed_sessao(db_session, numero=2, titulo="Também livre", resumo="Também")
    ocupada = seed_sessao(db_session, numero=3, titulo="Ocupada", resumo="Ocupada", arco_id=arco.id)
    handler = _ok(
        _resposta(
            [
                {"titulo": "Novo", "resumo": "Novo fio.", "sessoes": [1, 2, 3], "locais": []},
                {
                    "titulo": "Seguinte",
                    "resumo": "Continua.",
                    "sessoes": [2],
                    "sessao_transicao": 3,
                    "locais": [],
                },
            ]
        )
    )
    resultado = propor_arcos(db_session, _ctx(), client=_client(handler))
    assert resultado.estado == "propostas"
    normal = resultado.propostas[0]
    assert ocupada.id not in normal.sessao_ids
    assert livre.id in normal.sessao_ids
    transicao = resultado.propostas[1]
    assert transicao.sessao_transicao_id == ocupada.id
    assert ocupada.id not in transicao.sessao_ids


def test_sessoes_insuficientes_nao_chamam_o_provedor(db_session, monkeypatch) -> None:
    monkeypatch.setattr(settings, "deepseek_api_key", CHAVE)
    seed_sessao(db_session, numero=1, titulo="Só uma", resumo="Pouco")

    def handler(_request: httpx.Request) -> httpx.Response:
        raise AssertionError("rede não deveria ser chamada")

    vazia = propor_arcos(db_session, _ctx(), client=_client(handler))
    assert vazia.estado == "sessoes_insuficientes"
    assert vazia.mensagem == MSG_INSUFICIENTE
    assert vazia.propostas == []


def test_falha_do_provedor_oferece_criacao_manual(db_session, monkeypatch) -> None:
    monkeypatch.setattr(settings, "deepseek_api_key", CHAVE)
    seed_sessao(db_session, numero=1, titulo="Um", resumo="Um")
    seed_sessao(db_session, numero=2, titulo="Dois", resumo="Dois")

    def handler(_request: httpx.Request) -> httpx.Response:
        return httpx.Response(500, json={"error": "raw-provider-error", "key": CHAVE})

    resultado = propor_arcos(db_session, _ctx(), client=_client(handler))
    assert resultado.estado == "falha"
    assert resultado.mensagem == MSG_FALHA
    assert "criação manual" in resultado.mensagem
    assert resultado.propostas == []
    assert CHAVE not in resultado.mensagem
    assert "raw-provider-error" not in resultado.mensagem


def test_integracao_aceite_pelo_caminho_manual(client, db_session, monkeypatch) -> None:
    monkeypatch.setattr(settings, "deepseek_api_key", CHAVE)
    local = seed_local(db_session, nome="Portão")
    visivel = seed_sessao(
        db_session,
        numero=1,
        titulo="Aberta",
        resumo="Sessão revelada",
        local_ids=[local.id],
    )
    seed_sessao(db_session, numero=2, titulo="Segunda", resumo="Segue a estrada")
    seed_sessao(db_session, numero=3, titulo="Oculta", resumo="SEGREDO-DO-MESTRE", visivel=False)
    ligado = client.patch(
        f"/api/campanhas/{TEST_CAMPAIGN_SLUG}/modulos",
        json={"modulo": "ia_arcos", "ativo": True},
    )
    assert ligado.status_code == 200, ligado.text

    capturado: dict = {}

    class FalsoCliente:
        def __init__(self, *args, **kwargs) -> None:
            pass

        def __enter__(self):
            return self

        def __exit__(self, *args) -> bool:
            return False

        def post(self, url, json=None, headers=None):  # noqa: A002
            capturado["body"] = json
            return httpx.Response(
                200,
                json={
                    "choices": [
                        {
                            "message": {
                                "content": _resposta(
                                    [
                                        {
                                            "titulo": "Proposta da IA",
                                            "resumo": "Resumo da IA",
                                            "sessoes": [1, 2, 3],
                                            "locais": ["Portão"],
                                        }
                                    ]
                                )
                            }
                        }
                    ]
                },
            )

    monkeypatch.setattr("app.services.ia_provider.httpx.Client", FalsoCliente)
    antes = client.get(f"/api/c/{TEST_CAMPAIGN_SLUG}/admin/arcos")
    assert antes.status_code == 200
    proposta = client.post(f"/api/c/{TEST_CAMPAIGN_SLUG}/admin/arcos/propor")
    assert proposta.status_code == 200, proposta.text
    corpo = proposta.json()
    assert corpo["estado"] == "propostas"
    assert len(client.get(f"/api/c/{TEST_CAMPAIGN_SLUG}/admin/arcos").json()) == len(antes.json())
    usuario = capturado["body"]["messages"][1]["content"]
    assert "Sessão revelada" in usuario
    assert "SEGREDO-DO-MESTRE" not in usuario
    assert capturado["body"]["messages"][0]["content"] == PROMPT_PADRAO

    item = corpo["propostas"][0]
    assert visivel.id in item["sessao_ids"]
    criado = client.post(
        f"/api/c/{TEST_CAMPAIGN_SLUG}/admin/arcos",
        json={
            "titulo": "Título editado pelo mestre",
            "resumo": item["resumo"],
            "sessao_ids": item["sessao_ids"],
            "sessao_transicao_id": item["sessao_transicao_id"],
        },
    )
    assert criado.status_code == 201, criado.text
    assert criado.json()["titulo"] == "Título editado pelo mestre"
    assert visivel.id in criado.json()["sessao_ids"]


def test_integracao_falha_oferece_caminho_manual(client, db_session, monkeypatch) -> None:
    monkeypatch.setattr(settings, "deepseek_api_key", CHAVE)
    seed_sessao(db_session, numero=1, titulo="Um", resumo="Um")
    seed_sessao(db_session, numero=2, titulo="Dois", resumo="Dois")
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
            return httpx.Response(503, json={"error": "indisponivel"})

    monkeypatch.setattr("app.services.ia_provider.httpx.Client", FalsoCliente)
    resposta = client.post(f"/api/c/{TEST_CAMPAIGN_SLUG}/admin/arcos/propor")
    assert resposta.status_code == 200, resposta.text
    corpo = resposta.json()
    assert corpo["estado"] == "falha"
    assert corpo["mensagem"] == MSG_FALHA
    assert corpo["propostas"] == []
    assert client.get(f"/api/c/{TEST_CAMPAIGN_SLUG}/admin/arcos").json() == []
