from app.services.stat_blocks.registry import render_markdown, validar_stat_block
from app.services.stat_blocks.wfrp import FIELDS as WFRP_FIELDS
from app.services.stat_blocks.wod import FIELDS as WOD_FIELDS


def test_wfrp_aceita_payload_e_rejeita_campo_desconhecido():
    payload = {
        "ca": 4,
        "hpr": 12,
        "for": 35,
        "pericias": ["Esquiva", "Briga"],
        "talentos": ["Sorte"],
        "pertences": ["Espada"],
    }
    cleaned = validar_stat_block("wfrp", payload)
    assert cleaned["ca"] == 4
    assert cleaned["pericias"] == ["Esquiva", "Briga"]
    rendered = render_markdown("wfrp4e", cleaned)
    assert "CA" in rendered and "Perícias" in rendered and "Esquiva" in rendered

    try:
        validar_stat_block("wfrp", {"mana": 3})
    except Exception as exc:
        assert exc.status_code == 422
        assert exc.detail["erro"] == "STAT_BLOCK_CAMPO_DESCONHECIDO"
    else:
        raise AssertionError("campo desconhecido deveria falhar")


def test_wod_e_wfrp_tem_campos_diferentes():
    assert {field.nome for field in WFRP_FIELDS} != {field.nome for field in WOD_FIELDS}
    cleaned = validar_stat_block("wod", {"forca": 3, "poderes": ["Dominar"]})
    assert cleaned == {"forca": 3, "poderes": ["Dominar"]}
    rendered = render_markdown("wod", cleaned)
    assert "Força" in rendered and "Dominar" in rendered


def test_tabela_de_caracteristicas_usa_alinhamento_centralizado():
    cleaned = validar_stat_block("wfrp", {"ca": 4, "hpr": 12})
    rendered = render_markdown("wfrp4e", cleaned)
    assert "| CA | HPr |" in rendered
    assert "| :-: | :-: |" in rendered
    assert "| 4 | 12 |" in rendered


def test_sistema_sem_template_rejeita_stat_block():
    assert validar_stat_block("shadow", {}) == {}
    try:
        validar_stat_block("shadow", {"forca": 1})
    except Exception as exc:
        assert exc.detail["erro"] == "STAT_BLOCK_SISTEMA_DESCONHECIDO"
    else:
        raise AssertionError("sistema sem template deveria falhar")
