"""Keep the host Caddy snippets aligned with production SPA routes."""
import fnmatch
import re
from pathlib import Path

import pytest

ROOT = Path(__file__).resolve().parents[2]
FILES = [
    "deploy/Caddyfile",
    "deploy/snippets/caddy.site.tpl",
    "frontend-v2/src/main.tsx",
    "frontend-v2/src/routes/campaignRoutes.tsx",
]


def matcher(source: str, name: str) -> set[str]:
    found = re.search(rf"(?m)^\s*@{name}\s+path\s+([^\n#]+)", source)
    assert found, f"@{name} matcher missing"
    return set(found.group(1).split())


def covered(route: str, patterns: set[str]) -> bool:
    example = re.sub(r":[^/]+", "example", route)
    return any(fnmatch.fnmatchcase(example, p) or (p.endswith("/*") and example == p[:-2]) for p in patterns)


def test_caddy_snippets_cover_routes():
    if any(not (ROOT / name).exists() for name in FILES):
        pytest.skip("Caddy or frontend files unavailable in this build context")
    caddy, template, main, campaigns = [(ROOT / name).read_text() for name in FILES]
    patterns = matcher(caddy, "spa")
    assert patterns == matcher(template, "spa"), "@spa matchers differ between snippets"
    routes = set(re.findall(r'<Route\s+path="(/[^\"]+|\*)"', main)) - {"/__styleguide", "*"}
    assert all(covered(route, patterns) for route in routes), sorted(route for route in routes if not covered(route, patterns))
    campaign_routes = set(re.findall(r'<Route[^>]*path="(/c/[^\"]+)"', campaigns))
    campaign_routes.update({"/c/:id/:slug/mapa", "/c/:id/:slug/relacoes", "/c/:slug/itens"})
    assert campaign_routes
    assert all(covered(route, patterns) for route in campaign_routes)
    assert all(covered(path, patterns) for path in ("/assets/index.js", "/favicon.svg", "/favicon.ico", "/robots.txt"))
    assert not covered("/__styleguide", patterns)
    for source in (caddy, template):
        private = matcher(source, "privadas")
        assert all(covered(path, private) for path in ("/painel", "/admin", "/login", "/registo", "/esqueci-senha", "/conta", "/convite/x", "/reset/x"))
        assert re.search(r"handle\s+/sitemap\.xml\s*\{\s*reverse_proxy\s+(?:api:8000|127\.0\.0\.1:__PORTA_API__)", source)
        assert re.search(r'header\s+/api/\*\s+X-Robots-Tag\s+"noindex"', source)
