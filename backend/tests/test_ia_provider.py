"""Infrastructure tests for the DeepSeek client. No live network."""

from __future__ import annotations

import json

import httpx

from app.config import Settings, settings
from app.deps.auth import MembroContext
from app.models.campanha import Campanha
from app.models.usuario import Membro, Usuario
from app.services.ia_provider import (
    IA_CAMPANHAS_MISTURADAS,
    IA_CREDENCIAL_AUSENTE,
    IA_ERRO_PROVEDOR,
    IA_MODULO_DESABILITADO,
    IA_NAO_AUTORIZADO,
    IA_OK,
    IA_TIMEOUT,
    MODULO_IA,
    ItemContextoIa,
    completar,
    modulo_ia_ativo,
)

CHAVE = "sk-teste-nao-enviar"
CORPO_BRUTO = "raw-provider-error-corpo-secreto"


def _campanha(campanha_id: int, *, ia: bool) -> Campanha:
    return Campanha(
        id=campanha_id,
        slug=f"mesa-{campanha_id}",
        nome=f"Mesa {campanha_id}",
        sistema="wfrp4e",
        caminho=f"mesa-{campanha_id}",
        modulos_ativos=[MODULO_IA] if ia else [],
    )


def _ctx(campanha: Campanha, papel: str = "dono") -> MembroContext:
    return MembroContext(
        usuario=Usuario(id=1, email="gm@teste.local"),
        campanha=campanha,
        membro=Membro(usuario_id=1, campanha_id=campanha.id or 0, papel=papel),
    )


def _item(campanha_id: int, registro_id: int, texto: str, *, visivel: bool = True) -> ItemContextoIa:
    return ItemContextoIa(
        campanha_id=campanha_id,
        tipo="sessao",
        registro_id=registro_id,
        texto=texto,
        visivel_para_todos=visivel,
    )


def _client(handler) -> httpx.Client:
    return httpx.Client(transport=httpx.MockTransport(handler))


def _habilitar_chave(monkeypatch) -> None:
    monkeypatch.setattr(settings, "deepseek_api_key", CHAVE)
    monkeypatch.setattr(settings, "deepseek_base_url", "https://api.deepseek.com")
    monkeypatch.setattr(settings, "deepseek_model", "deepseek-chat")


def test_ausencia_da_variavel_nao_derruba_e_ia_fica_indisponivel(monkeypatch) -> None:
    monkeypatch.delenv("DEEPSEEK_API_KEY", raising=False)
    carregado = Settings(_env_file=None)
    assert carregado.deepseek_api_key is None

    monkeypatch.setattr(settings, "deepseek_api_key", None)
    campanha = _campanha(1, ia=True)
    chamado = {"vezes": 0}

    def handler(_request: httpx.Request) -> httpx.Response:
        chamado["vezes"] += 1
        raise AssertionError("rede não deveria ser chamada")

    resultado = completar(
        ctx=_ctx(campanha),
        campanha_id=1,
        modulos_ativos=campanha.modulos_ativos,
        registros=(_item(1, 1, "visível"),),
        instrucao="instrução",
        client=_client(handler),
    )
    assert resultado.ok is False
    assert resultado.codigo == IA_CREDENCIAL_AUSENTE
    assert CHAVE not in resultado.mensagem
    assert chamado["vezes"] == 0


def test_chamada_mockada_confirma_payload_e_resposta(monkeypatch) -> None:
    _habilitar_chave(monkeypatch)
    campanha = _campanha(7, ia=True)
    visto: dict = {}

    def handler(request: httpx.Request) -> httpx.Response:
        visto["url"] = str(request.url)
        visto["auth"] = request.headers.get("authorization")
        visto["body"] = json.loads(request.content.decode())
        return httpx.Response(200, json={"choices": [{"message": {"content": "Arco proposto"}}]})

    resultado = completar(
        ctx=_ctx(campanha),
        campanha_id=7,
        modulos_ativos=campanha.modulos_ativos,
        registros=(_item(7, 3, "Sessão pública"),),
        instrucao="Identifique arcos.",
        client=_client(handler),
    )
    assert resultado.ok is True
    assert resultado.codigo == IA_OK
    assert resultado.texto == "Arco proposto"
    assert visto["url"] == "https://api.deepseek.com/chat/completions"
    assert visto["auth"] == f"Bearer {CHAVE}"
    assert visto["body"]["model"] == "deepseek-chat"
    assert visto["body"]["messages"][0] == {"role": "system", "content": "Identifique arcos."}
    usuario = json.loads(visto["body"]["messages"][1]["content"])
    assert usuario == [{"campanha_id": 7, "tipo": "sessao", "id": 3, "texto": "Sessão pública"}]
    assert CHAVE not in resultado.mensagem


def test_timeout_erro_http_e_credencial_nao_vazam_detalhe(monkeypatch) -> None:
    _habilitar_chave(monkeypatch)
    campanha = _campanha(1, ia=True)
    registros = (_item(1, 1, "visível"),)

    def timeout(_request: httpx.Request) -> httpx.Response:
        raise httpx.TimeoutException("lento demais")

    falha_timeout = completar(
        ctx=_ctx(campanha),
        campanha_id=1,
        modulos_ativos=campanha.modulos_ativos,
        registros=registros,
        instrucao="instrução",
        client=_client(timeout),
    )
    assert falha_timeout.codigo == IA_TIMEOUT
    assert "lento" not in falha_timeout.mensagem
    assert CHAVE not in falha_timeout.mensagem

    def erro_http(_request: httpx.Request) -> httpx.Response:
        return httpx.Response(500, json={"error": CORPO_BRUTO, "key": CHAVE})

    falha_http = completar(
        ctx=_ctx(campanha),
        campanha_id=1,
        modulos_ativos=campanha.modulos_ativos,
        registros=registros,
        instrucao="instrução",
        client=_client(erro_http),
    )
    assert falha_http.codigo == IA_ERRO_PROVEDOR
    assert CORPO_BRUTO not in falha_http.mensagem
    assert CHAVE not in falha_http.mensagem
    assert falha_http.texto is None

    def credencial_rejeitada(_request: httpx.Request) -> httpx.Response:
        return httpx.Response(401, json={"error": CORPO_BRUTO, "key": CHAVE})

    falha_chave = completar(
        ctx=_ctx(campanha),
        campanha_id=1,
        modulos_ativos=campanha.modulos_ativos,
        registros=registros,
        instrucao="instrução",
        client=_client(credencial_rejeitada),
    )
    assert falha_chave.codigo == IA_CREDENCIAL_AUSENTE
    assert CORPO_BRUTO not in falha_chave.mensagem
    assert CHAVE not in falha_chave.mensagem


def test_modulo_ausente_bloqueia_sem_chamar_rede(monkeypatch) -> None:
    _habilitar_chave(monkeypatch)
    campanha = _campanha(1, ia=False)
    assert modulo_ia_ativo(campanha.modulos_ativos) is False
    assert modulo_ia_ativo(None) is False
    assert modulo_ia_ativo(["fadiga"]) is False
    assert modulo_ia_ativo([MODULO_IA]) is True

    def handler(_request: httpx.Request) -> httpx.Response:
        raise AssertionError("rede não deveria ser chamada")

    resultado = completar(
        ctx=_ctx(campanha),
        campanha_id=1,
        modulos_ativos=campanha.modulos_ativos,
        registros=(_item(1, 1, "visível"),),
        instrucao="instrução",
        client=_client(handler),
    )
    assert resultado.codigo == IA_MODULO_DESABILITADO
    assert resultado.ok is False


def test_sessao_oculta_ausente_do_payload(monkeypatch) -> None:
    _habilitar_chave(monkeypatch)
    campanha = _campanha(1, ia=True)
    visto: dict = {}

    def handler(request: httpx.Request) -> httpx.Response:
        visto["body"] = request.content.decode()
        return httpx.Response(200, json={"choices": [{"message": {"content": "ok"}}]})

    completar(
        ctx=_ctx(campanha),
        campanha_id=1,
        modulos_ativos=campanha.modulos_ativos,
        registros=(
            _item(1, 1, "Sessão pública"),
            _item(1, 2, "SEGREDO-OCULTO", visivel=False),
        ),
        instrucao="instrução",
        client=_client(handler),
    )
    assert "Sessão pública" in visto["body"]
    assert "SEGREDO-OCULTO" not in visto["body"]


def test_duas_campanhas_tem_payloads_independentes(monkeypatch) -> None:
    _habilitar_chave(monkeypatch)
    corpos: list[str] = []

    def handler(request: httpx.Request) -> httpx.Response:
        corpos.append(request.content.decode())
        return httpx.Response(200, json={"choices": [{"message": {"content": "ok"}}]})

    client = _client(handler)
    for campanha_id, texto in ((1, "SO-CAMPANHA-1"), (2, "SO-CAMPANHA-2")):
        campanha = _campanha(campanha_id, ia=True)
        resultado = completar(
            ctx=_ctx(campanha),
            campanha_id=campanha_id,
            modulos_ativos=campanha.modulos_ativos,
            registros=(_item(campanha_id, 1, texto),),
            instrucao="instrução",
            client=client,
        )
        assert resultado.ok is True

    assert len(corpos) == 2
    assert "SO-CAMPANHA-1" in corpos[0]
    assert "SO-CAMPANHA-2" not in corpos[0]
    assert "SO-CAMPANHA-2" in corpos[1]
    assert "SO-CAMPANHA-1" not in corpos[1]

    mistura = _campanha(1, ia=True)
    chamado = {"vezes": 0}

    def recusa(_request: httpx.Request) -> httpx.Response:
        chamado["vezes"] += 1
        raise AssertionError("rede não deveria ser chamada")

    misturado = completar(
        ctx=_ctx(mistura),
        campanha_id=1,
        modulos_ativos=mistura.modulos_ativos,
        registros=(_item(1, 1, "SO-CAMPANHA-1"), _item(2, 2, "SO-CAMPANHA-2")),
        instrucao="instrução",
        client=_client(recusa),
    )
    assert misturado.codigo == IA_CAMPANHAS_MISTURADAS
    assert chamado["vezes"] == 0
    assert "SO-CAMPANHA-1" not in misturado.mensagem


def test_sem_contexto_de_mestre_rejeita_antes_do_provedor(monkeypatch) -> None:
    _habilitar_chave(monkeypatch)
    campanha = _campanha(1, ia=True)

    def handler(_request: httpx.Request) -> httpx.Response:
        raise AssertionError("rede não deveria ser chamada")

    client = _client(handler)
    for ctx in (None, _ctx(campanha, papel="jogador")):
        resultado = completar(
            ctx=ctx,
            campanha_id=1,
            modulos_ativos=campanha.modulos_ativos,
            registros=(_item(1, 1, "visível"),),
            instrucao="instrução",
            client=client,
        )
        assert resultado.codigo == IA_NAO_AUTORIZADO
        assert CHAVE not in resultado.mensagem


def test_fluxo_completo_e_modulo_desabilitado(monkeypatch) -> None:
    _habilitar_chave(monkeypatch)
    campanha = _campanha(4, ia=True)
    visto: dict = {}

    def handler(request: httpx.Request) -> httpx.Response:
        visto["body"] = request.content.decode()
        visto["vezes"] = visto.get("vezes", 0) + 1
        return httpx.Response(200, json={"choices": [{"message": {"content": "Proposta pronta"}}]})

    sucesso = completar(
        ctx=_ctx(campanha),
        campanha_id=4,
        modulos_ativos=campanha.modulos_ativos,
        registros=(
            _item(4, 1, "Sessão revelada"),
            _item(4, 2, "SEGREDO-DO-MESTRE", visivel=False),
        ),
        instrucao="Proponha arcos.",
        client=_client(handler),
    )
    assert sucesso.ok is True
    assert sucesso.texto == "Proposta pronta"
    assert visto["vezes"] == 1
    assert "Sessão revelada" in visto["body"]
    assert "SEGREDO-DO-MESTRE" not in visto["body"]
    contexto = json.loads(json.loads(visto["body"])["messages"][1]["content"])
    assert contexto == [{"campanha_id": 4, "tipo": "sessao", "id": 1, "texto": "Sessão revelada"}]

    def bloqueado(_request: httpx.Request) -> httpx.Response:
        raise AssertionError("rede não deveria ser chamada")

    desligado = completar(
        ctx=_ctx(campanha),
        campanha_id=4,
        modulos_ativos=[],
        registros=(_item(4, 1, "Sessão revelada"),),
        instrucao="Proponha arcos.",
        client=_client(bloqueado),
    )
    assert desligado.codigo == IA_MODULO_DESABILITADO
    assert desligado.ok is False
