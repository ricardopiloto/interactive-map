# Contract: Chrome layout (114)

**Feature**: `114-cabecalho-navegacao`  
**Supersedes (chrome only)**: aspects of [102 chrome-layout](../../102-estrutura-navegacao/contracts/chrome-layout.md) for `/c/:slug/*`

## Desktop header (`/c/:slug…`)

Height ~56px; three zones:

| Zone | Content | Behaviour |
|------|---------|-----------|
| **Left** | Brand «Campaign Codex» + separator + **campaign switcher** | Brand → `/`. Switcher shows real campaign name; menu: «Minhas campanhas» → `/painel`, «Descobrir outras» → `/` |
| **Center** | Tabs: Mapa, Relações, **Rota**, Sessões | Centred; active = accent + bottom underline; icons allowed |
| **Right** | Edit Mode (if `canEdit`), Theme (Auto/Claro/Escuro), UserMenu | Edit Mode: pill / filled when on; Theme: three-way preference; UserMenu: auth + language (theme not duplicated if moved out) |

MUST NOT: campaign name as inert text after nav; Edit Mode as ghost text-only button when on.

## Narrow viewport

| Rule | Detail |
|------|--------|
| Top tabs | Hidden |
| Brand (+ sep) | Hidden (campaign name remains via switcher) |
| Bottom bar | Fixed; items = same tabs as desktop (Map omitted if `!showMapNav`) |
| Edit / theme / user | Stay in header right (not in bottom bar) |

## Uniqueness

Per campaign view:

- Product brand visible: **1** (desktop) or **0** in top bar on narrow (bottom has no brand).
- Edit Mode control: **0** or **1** according to `canEdit`.
- Theme three-way: **1** visible control in header right on campaign chrome.

## Home / Painel

Unchanged by this contract except any shared `UserMenu` theme extraction must keep theme reachable there too (or equivalent).
