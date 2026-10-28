from urllib.parse import quote
from xml.etree import ElementTree as ET

from sqlmodel import Session, select

from app.config import settings
from app.models.campanha import Campanha
from app.services.campanha_admin import campanha_indexavel
from app.services.contato import contato_disponivel
from app.services.instance_config import tem_imagem_mapa

NAMESPACE = "http://www.sitemaps.org/schemas/sitemap/0.9"
ET.register_namespace("", NAMESPACE)


def campanhas_indexaveis(session: Session) -> list[Campanha]:
    campanhas = session.exec(select(Campanha).order_by(Campanha.id)).all()
    return [campanha for campanha in campanhas if campanha_indexavel(campanha)]


def build_sitemap_xml(session: Session) -> str:
    root = ET.Element(f"{{{NAMESPACE}}}urlset")
    paths = ["/", "/explorar", "/termos", "/privacidade"]
    if contato_disponivel():
        paths.append("/contato")
    for campanha in campanhas_indexaveis(session):
        prefix = f"/c/{campanha.id}/{quote(campanha.slug, safe='')}"
        paths.extend(f"{prefix}/{page}" for page in ("relacoes", "sessoes", "linha-do-tempo", "itens"))
        if tem_imagem_mapa(campanha):
            paths.append(f"{prefix}/mapa")
    base = settings.public_base_url.rstrip("/")
    for path in paths:
        url = ET.SubElement(root, f"{{{NAMESPACE}}}url")
        ET.SubElement(url, f"{{{NAMESPACE}}}loc").text = base + path
    return ET.tostring(root, encoding="utf-8", xml_declaration=True).decode("utf-8")
