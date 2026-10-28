from xml.etree import ElementTree as ET

from fastapi.testclient import TestClient
from sqlmodel import Session

from app.campaign_db import get_control_engine
from app.config import settings
from app.main import app
from app.models.campanha import Campanha
from app.services import contato
from app.services.sitemap import build_sitemap_xml

NS = {'s': 'http://www.sitemaps.org/schemas/sitemap/0.9'}


def locations(xml: str) -> list[str]:
    root = ET.fromstring(xml)
    assert root.tag == f"{{{NS['s']}}}urlset"
    assert not root.findall('.//s:lastmod', NS)
    return [node.text for node in root.findall('s:url/s:loc', NS)]


def campaign(slug: str, *, indexavel=True, activa=True, visibilidade='listada', mapa='') -> Campanha:
    return Campanha(slug=slug, nome=slug, sistema='wfrp4e', caminho=slug,
                    indexavel=indexavel, activa=activa, visibilidade=visibilidade, mapa_arquivo=mapa)


def test_sitemap_selection_escape_and_order(control_session, monkeypatch):
    monkeypatch.setattr(settings, 'public_base_url', 'https://example.org/')
    monkeypatch.setattr(settings, 'contato_email', None)
    rows = [campaign('z & café', mapa=' map.png '), campaign('sem-mapa'),
            campaign('link', visibilidade='so_link'), campaign('inativa', activa=False),
            campaign('sem-escolha', indexavel=False)]
    control_session.add_all(rows)
    control_session.commit()
    ids = {row.slug: row.id for row in rows}
    xml = build_sitemap_xml(control_session)
    urls = locations(xml)
    base = 'https://example.org'
    assert urls[:4] == [base + path for path in ('/', '/explorar', '/termos', '/privacidade')]
    assert all('/contato' not in url for url in urls)
    expected = [f"{base}/c/{ids['z & café']}/z%20%26%20caf%C3%A9/{page}"
                for page in ('relacoes', 'sessoes', 'linha-do-tempo', 'itens', 'mapa')]
    expected += [f"{base}/c/{ids['sem-mapa']}/sem-mapa/{page}"
                 for page in ('relacoes', 'sessoes', 'linha-do-tempo', 'itens')]
    assert urls[4:] == expected
    assert '&amp;' not in xml
    for excluded in ('/registo', '/login', '/painel', '/admin', '/conta', '/convite/',
                     '/reset/', '/rota', '/ferramentas', '/fios', '/link/', '/inativa/', '/sem-escolha/'):
        assert excluded not in '\n'.join(urls)


def test_sitemap_contact_and_base_without_trailing_slash(control_session, monkeypatch):
    monkeypatch.setattr(settings, 'public_base_url', 'https://example.org')
    monkeypatch.setattr(settings, 'contato_email', 'invalid')
    monkeypatch.setattr(contato, 'get_email_sender', lambda: object())
    assert 'https://example.org/contato' not in locations(build_sitemap_xml(control_session))
    monkeypatch.setattr(settings, 'contato_email', 'operator@example.org')
    assert 'https://example.org/contato' in locations(build_sitemap_xml(control_session))
    monkeypatch.setattr(contato, 'get_email_sender', lambda: None)
    assert 'https://example.org/contato' not in locations(build_sitemap_xml(control_session))


def test_sitemap_route(data_root, monkeypatch):
    monkeypatch.setattr(settings, 'contato_email', None)
    with Session(get_control_engine()) as session:
        session.add_all([campaign('autorizada'), campaign('nao-autorizada', indexavel=False)])
        session.commit()
    with TestClient(app) as client:
        response = client.get('/sitemap.xml')
        assert response.status_code == 200
        assert response.headers['content-type'].startswith('application/xml')
        assert response.headers['cache-control'] == 'public, max-age=3600'
        urls = locations(response.text)
        assert any('/autorizada/relacoes' in url for url in urls)
        assert not any('nao-autorizada' in url for url in urls)
        assert client.get('/api/sitemap.xml').status_code == 404
