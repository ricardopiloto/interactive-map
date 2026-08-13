# Hub — índice de campanhas

Página estática que lista instâncias Codex a partir de `campanhas.json` (fetch em runtime, sem rebuild).

## Ficheiros

| Ficheiro | Uso |
|---|---|
| `index.html` | Shell da página |
| `app.js` | Carrega e renderiza o catálogo |
| `styles.css` | Estilos do hub |
| `campanhas.json` | Lista de campanhas (editar à mão após scaffold) |
| `Caddyfile.example` | Exemplo de proxy para o hub |
| `capas/` | Imagens de capa opcionais |

## Uso

1. Servir esta pasta como site estático (Caddy, nginx, etc.).
2. Após `./scripts/nova-campanha.sh`, colar a entrada gerada em `campanhas.json`.
3. Refrescar o browser — o hub lê o JSON em runtime.

O hub **não** está coberto pela i18n da app (permanece PT). Detalhes de deploy: [`docs/runbook-instancias.md`](../docs/runbook-instancias.md).
