# Contract: Wizard UI flow — `/painel/novo`

## Route

| Path | Auth | Element |
|------|------|---------|
| `/painel/novo` | Required (`authApi.me`; else `/login?next=/painel/novo`) | `NovoCodexPage` |

## Steps (order fixed)

| Index | Id | Primary controls |
|-------|-----|------------------|
| 0 | identity | nome, slug (auto + editable), immutable hint, Continuar / Cancelar→`/painel` |
| 1 | system | género cards (live `data-genre`), sistema (+ datalist from `GENRES.suggestedSystems`), Continuar / Voltar |
| 2 | visibility | radio/cards `listada` \| `so_link`, Continuar / Voltar |
| 3 | review | read-only summary of draft, Criar / Voltar |
| — | success | after POST OK: Abrir → `/c/:slug`, Ir painel → `/painel` |

## Progress indicator

Four labelled steps; current/complete/upcoming states visual (protótipo NovoCodexWizard).

## Painel CTA

`/painel` «Criar novo codex» (`painel.createCta`) MUST navigate to `/painel/novo` (not focus inline form).

## Out of scope UI

- Import ZIP remains on Painel only.
- No resumo field in identity step (or display-only discarded).
