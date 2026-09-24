# Hub — índice de campanhas (histórico, spec 078)

Página estática que listava instâncias Codex a partir de `campanhas.json`. **Já não é o procedimento corrente.** Campanhas novas e o corte WFRP/WoD usam o Campaign Codex: [`docs/runbook-corte-campaign-codex.md`](../docs/runbook-corte-campaign-codex.md).

`scripts/nova-campanha.sh` está aposentado (recusa criar pastas).

Os ficheiros abaixo permanecem no git só como arquivo.

## Ficheiros

| Ficheiro | Uso |
|---|---|
| `index.html` | Shell da página |
| `app.js` | Carrega e renderiza o catálogo |
| `styles.css` | Estilos do hub |
| `campanhas.json` | Lista de campanhas (editar à mão após scaffold) |
| `Caddyfile.example` | Exemplo de proxy para o hub |
| `capas/` | Imagens de capa opcionais |

## Uso (histórico)

1. Isto **não** é o caminho para campanhas novas.
2. Campaign Codex: uma instância, home `/`, mesas `/c/<slug>`.
3. Não editar `campanhas.json` como procedimento actual.

O hub **não** está coberto pela i18n da app (permanece PT).
