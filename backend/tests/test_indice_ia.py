from sqlalchemy import text
from sqlmodel import select

from app.campaign_db import resolve_campaign_session
from app.models.npc import NPC
from app.models.sessao import Sessao
from app.services.indice_ia import consultar, estado, reconstruir, extrair_termos
from tests.conftest import TEST_CAMPAIGN_SLUG


def test_trechos_limite_cabecalho_acentos(data_root):
    from app.services.indice_ia import dividir_trechos
    trechos = dividir_trechos("Sessão 1: Érica", "Árvore grande. " * 300)
    assert len(trechos) > 1
    assert all(t.startswith("Sessão 1: Érica: ") and len(t) <= 1200 for t in trechos)
    with resolve_campaign_session(TEST_CAMPAIGN_SLUG) as session:
        session.add(NPC(nome="ÉRICA", descricao="Árvore antiga"))
        session.commit()
        reconstruir(session)
        assert consultar(session, 1, "", "arvore")
        assert consultar(session, 1, "", "ÉRICA")


def test_reconstrucao_simultanea_sem_duplicar(data_root):
    from concurrent.futures import ThreadPoolExecutor
    with resolve_campaign_session(TEST_CAMPAIGN_SLUG) as session:
        session.add(NPC(nome="Guarda", descricao="Ponte antiga"))
        session.commit()

    def run(_):
        with resolve_campaign_session(TEST_CAMPAIGN_SLUG) as session:
            result = reconstruir(session)
            session.commit()
            return result

    with ThreadPoolExecutor(max_workers=2) as pool:
        results = list(pool.map(run, range(2)))
    assert all(r["registros"] == 1 and r["trechos"] == 1 for r in results)
    with resolve_campaign_session(TEST_CAMPAIGN_SLUG) as session:
        assert estado(session)["trechos"] == 1


def test_exportacao_sem_indice_importacao_reconstroi(data_root):
    import io
    import json
    import zipfile
    from app.services.campaign_export import export_campaign_to_bytes
    from app.services.campaign_import import import_campaign_from_bytes
    from app.services.package_schema import CONTENT_FILENAME
    from tests.conftest import TEST_GM_EMAIL
    with resolve_campaign_session(TEST_CAMPAIGN_SLUG) as session:
        session.add(NPC(nome="Guardião", descricao="Relíquia escondida"))
        session.commit()
        reconstruir(session)
        session.commit()
    payload = export_campaign_to_bytes(TEST_CAMPAIGN_SLUG)
    with zipfile.ZipFile(io.BytesIO(payload)) as archive:
        assert "indice_ia" not in archive.namelist()
        assert "indice_ia" not in json.loads(archive.read(CONTENT_FILENAME))
    imported = import_campaign_from_bytes(payload, owner_email=TEST_GM_EMAIL, slug_override="indice-importado")
    with resolve_campaign_session(imported.slug) as session:
        assert estado(session)["estado"] == "ok"
        assert consultar(session, imported.id or 0, "", "reliquia")


def test_rollback_insert_nao_deixa_trechos(data_root):
    with resolve_campaign_session(TEST_CAMPAIGN_SLUG) as session:
        reconstruir(session)
        session.commit()
        session.add(NPC(nome="Temporário", descricao="Segredo efêmero"))
        session.flush()
        assert consultar(session, 1, "", "efemero")
        session.rollback()
    with resolve_campaign_session(TEST_CAMPAIGN_SLUG) as session:
        assert not consultar(session, 1, "", "efemero")
        assert estado(session)["registros"] == 0


def test_contexto_grande_catalogo_oculto_e_termo_antigo(data_root):
    from app.services.contexto_ia import compor_contexto, _orcamento, _tamanho
    from app.schemas.ia_assistente import AssistirRequest
    from app.services.ia_provider import ItemContextoIa, montar_contexto
    from app.config import settings
    with resolve_campaign_session(TEST_CAMPAIGN_SLUG) as session:
        session.add_all(Sessao(numero=n, titulo=f"Capítulo {n}", resumo="Relíquia âmbar" if n == 1 else "Jornada comum") for n in range(1, 301))
        session.add(NPC(nome="Oráculo oculto", visivel_para_todos=False))
        session.add(NPC(nome="Guarda visível"))
        session.commit()
        pedido = AssistirRequest(tipo="rascunho_sessao", instrucao="relíquia")
        registros, n = compor_contexto(session, 1, pedido, None)
        assert n > 0
        assert any(r.tipo == "trecho" and "âmbar" in r.texto for r in registros)
        assert any(r.tipo == "sessao" and "300" in r.texto for r in registros)
        visivel = next(r for r in registros if r.tipo == "catalogo")
        oculto = next(r for r in registros if r.tipo == "catalogo_oculto")
        assert "Guarda visível" in visivel.texto and "Oráculo oculto" not in visivel.texto
        assert "Oráculo oculto" in oculto.texto and "Guarda visível" not in oculto.texto
        base = [ItemContextoIa(1, "texto_atual", 0, ""), ItemContextoIa(1, "instrucao_mestre", 0, "relíquia")]
        final = _orcamento("prompt", base + registros, 1)
        assert _tamanho("prompt", final, 1) <= settings.ia_assistente_contexto_max_chars
        assert any(x.get("oculto") for x in montar_contexto(1, final, incluir_ocultos=True))


def test_sem_termos_mantem_recentes_e_catalogo(data_root):
    from app.services.contexto_ia import compor_contexto
    from app.schemas.ia_assistente import AssistirRequest
    with resolve_campaign_session(TEST_CAMPAIGN_SLUG) as session:
        session.add(Sessao(numero=1, titulo="Ponte"))
        session.add(NPC(nome="Guarda"))
        session.commit()
        registros, count = compor_contexto(session, 1, AssistirRequest(tipo="rascunho_sessao", instrucao="de e"), None)
        assert count == 0
        assert any(r.tipo == "sessao" for r in registros)
        assert any(r.tipo == "catalogo" and "Guarda" in r.texto for r in registros)


def test_recuo_quando_indice_indisponivel_ou_consulta_falha(data_root, monkeypatch):
    import pytest
    from app.services import indice_ia
    from app.services.contexto_ia import compor_contexto, coletar_registros
    from app.schemas.ia_assistente import AssistirRequest
    pedido = AssistirRequest(tipo="rascunho_sessao")
    with resolve_campaign_session(TEST_CAMPAIGN_SLUG) as session:
        session.add(Sessao(numero=1, titulo="Ponte"))
        session.commit()
        reconstruir(session)
        session.commit()
        assert coletar_registros(session, 1, pedido, None)
        session.connection().execute(text("UPDATE indice_ia_estado SET estado='indisponivel' WHERE id=1"))
        with pytest.raises(RuntimeError):
            compor_contexto(session, 1, pedido, None)
        session.rollback()
        monkeypatch.setattr(indice_ia, "consultar", lambda *args: (_ for _ in ()).throw(RuntimeError("falha")))
        with pytest.raises(RuntimeError):
            compor_contexto(session, 1, pedido, None)


def test_orcamento_custo_linear_e_coletores_preservados(data_root, monkeypatch):
    from app.services import contexto_ia
    from app.schemas.ia_assistente import AssistirRequest
    from app.services.ia_provider import ItemContextoIa
    with resolve_campaign_session(TEST_CAMPAIGN_SLUG) as session:
        session.add(Sessao(numero=1, titulo="Ponte", resumo="Travessia"))
        session.commit()
        pedido = AssistirRequest(tipo="rascunho_sessao", instrucao="ponte")
        antigos = contexto_ia.coletar_registros(session, 1, pedido, None)
        fios, sessoes = contexto_ia.coletar_fios(session, 1)
        assert any(r.tipo == "sessao" for r in antigos)
        assert len(sessoes) == 1 and any(r.tipo == "sessao" for r in fios)
        registros, _ = contexto_ia.compor_contexto(session, 1, pedido, None)
        assert any(r.tipo == "sessao" for r in registros)
    calls = 0
    original = contexto_ia.montar_contexto
    def counted(*args, **kwargs):
        nonlocal calls
        calls += 1
        return original(*args, **kwargs)
    monkeypatch.setattr(contexto_ia, "montar_contexto", counted)
    itens = [ItemContextoIa(1, "trecho", i, f"Trecho {i}") for i in range(500)]
    contexto_ia._orcamento("prompt", itens, 1)
    assert calls <= len(itens) + 3


def test_rebuild_update_delete_and_rollback(data_root):
    with resolve_campaign_session(TEST_CAMPAIGN_SLUG) as session:
        npc = NPC(nome="Érica", descricao="emboscadas na ponte", notas_mecanicas="segredo mecânico")
        session.add(npc)
        session.commit()
        reconstruir(session)
        session.commit()
        assert estado(session)["registros"] >= 1
        assert len(consultar(session, 1, "", "emboscada")) == 1
        assert not consultar(session, 1, "", "mecânico")
        npc.descricao = "Dragão azul"
        session.add(npc)
        session.commit()
        assert not consultar(session, 1, "", "emboscada")
        assert len(consultar(session, 1, "", "dragao")) == 1
        npc.descricao = "Sombra verde"
        session.add(npc)
        session.flush()
        session.rollback()
    with resolve_campaign_session(TEST_CAMPAIGN_SLUG) as session:
        assert not consultar(session, 1, "", "sombra")
        assert len(consultar(session, 1, "", "dragao")) == 1
        npc = session.exec(select(NPC).where(NPC.nome == "Érica")).one()
        session.delete(npc)
        session.commit()
        assert not consultar(session, 1, "", "dragao")


def test_legacy_tables_and_hostile_terms(data_root):
    with resolve_campaign_session(TEST_CAMPAIGN_SLUG) as session:
        conn = session.connection()
        conn.execute(text("DROP TABLE IF EXISTS indice_ia"))
        conn.execute(text("DROP TABLE IF EXISTS indice_ia_estado"))
        session.commit()
        assert estado(session)["estado"] == "ausente"
        session.add(Sessao(numero=91, titulo="Ponte", resumo="Emboscadas antigas"))
        session.commit()
        reconstruir(session)
        reconstruir(session)
        session.commit()
        assert len(consultar(session, 1, '', '" OR NEAR( * emboscada')) == 1
        assert all('"' not in t for t in extrair_termos('', '" OR NEAR( *'))


def test_contexto_composition_and_fallback(data_root):
    from app.services.contexto_ia import compor_contexto, coletar_registros, _orcamento, _tamanho
    from app.schemas.ia_assistente import AssistirRequest
    from app.services.ia_provider import ItemContextoIa, montar_contexto
    from app.config import settings
    with resolve_campaign_session(TEST_CAMPAIGN_SLUG) as session:
        for n in range(1, 121):
            session.add(Sessao(numero=n, titulo=f"Capítulo {n}", resumo="A trilha continua" if n != 1 else "A relíquia de prata reapareceu"))
        session.add(NPC(nome="Oráculo", descricao="guardião", visivel_para_todos=False))
        session.commit()
        pedido = AssistirRequest(tipo="rascunho_sessao", instrucao="relíquia")
        registros, count = compor_contexto(session, 1, pedido, None)
        assert count >= 1
        assert any("relíquia" in r.texto for r in registros if r.tipo == "trecho")
        assert any(r.tipo == "catalogo_oculto" for r in registros)
        assert any(r.tipo == "catalogo" for r in registros)
        assert any(r.tipo == "sessao" and r.registro_id == 120 for r in registros)
        final = _orcamento("prompt", [ItemContextoIa(1, "texto_atual", 0, ""), ItemContextoIa(1, "instrucao_mestre", 0, "relíquia")] + registros, 1)
        assert _tamanho("prompt", final, 1) <= settings.ia_assistente_contexto_max_chars
        assert any(x.get("oculto") for x in montar_contexto(1, final, incluir_ocultos=True))
        assert coletar_registros(session, 1, pedido, None)


def test_listener_failure_marks_stale_without_blocking(data_root, monkeypatch):
    from app.services import indice_ia
    with resolve_campaign_session(TEST_CAMPAIGN_SLUG) as session:
        reconstruir(session)
        session.commit()
        original = indice_ia.indexar_registro
        def fail(conn, obj):
            raise RuntimeError("simulated")
        monkeypatch.setattr(indice_ia, "indexar_registro", fail)
        session.add(NPC(nome="Falha controlada"))
        session.commit()
        assert estado(session)["estado"] == "desatualizado"
        monkeypatch.setattr(indice_ia, "indexar_registro", original)
        reconstruir(session)
        session.commit()
        assert estado(session)["estado"] == "ok"


def test_migration_013_creates_and_drops_index(data_root):
    from alembic import command
    from app.campaign_db import _alembic_config, get_campaign_engine, get_control_engine
    from app.models.campanha import Campanha
    from sqlmodel import Session
    with Session(get_control_engine()) as control:
        camp = control.exec(select(Campanha).where(Campanha.slug == TEST_CAMPAIGN_SLUG)).one()
        engine = get_campaign_engine(camp.caminho.split("/")[-1], camp.caminho)
    cfg = _alembic_config("campaign", str(engine.url))
    command.downgrade(cfg, "012_fio_narrativo")
    with engine.connect() as conn:
        assert not conn.execute(text("SELECT 1 FROM sqlite_master WHERE name='indice_ia'")).first()
    command.upgrade(cfg, "head")
    with engine.connect() as conn:
        assert conn.execute(text("SELECT 1 FROM sqlite_master WHERE name='indice_ia'")).first()
        assert conn.execute(text("SELECT 1 FROM sqlite_master WHERE name='indice_ia_estado'")).first()
