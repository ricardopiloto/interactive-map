from __future__ import annotations

from sqlmodel import Session

from app.campaign_db import get_control_engine
from app.cli import _create_campanha
from app.models.campanha import Campanha
from sqlmodel import select
from tests.conftest import TEST_CAMPAIGN_SLUG


def test_catalogo_includes_listada_omits_so_link_and_inactive(client_anon, data_root) -> None:
    _create_campanha(slug="listada-um", nome="Listada", sistema="wfrp4e", visibilidade="listada")
    _create_campanha(slug="secreta", nome="Secreta", sistema="wod", visibilidade="so_link")
    _create_campanha(slug="morta", nome="Morta", sistema="wfrp4e", visibilidade="listada")
    with Session(get_control_engine()) as session:
        row = session.exec(select(Campanha).where(Campanha.slug == "morta")).first()
        assert row
        row.activa = False
        session.add(row)
        session.commit()

    r = client_anon.get("/api/campanhas/catalogo")
    assert r.status_code == 200
    items = r.json()["campanhas"]
    slugs = {c["slug"] for c in items}
    assert "listada-um" in slugs
    assert TEST_CAMPAIGN_SLUG in slugs  # fixture default listada
    assert "secreta" not in slugs
    assert "morta" not in slugs
    for c in items:
        assert set(c.keys()) == {"slug", "nome", "sistema", "genero", "capa_url"}
        assert c["genero"] in {"fantasia", "gotico", "scifi", "urbano"}
