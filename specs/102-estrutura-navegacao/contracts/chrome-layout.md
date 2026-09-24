# Contract: Chrome layout

**Feature**: `102-estrutura-navegacao`

## Campaign chrome (`/c/:slug`)

Barra de topo (sempre):

| Slot | Content | Notes |
|------|---------|--------|
| Brand | «Campaign Codex» | `Link` → `/`; mesma string em todos os locales |
| Section tabs | Mapa, Relações | Só viewport **largo**; activa com sublinhado / `aria-current` |
| Campaign name | `nome` da config | Texto; **não** link |
| Edit mode | «Modo edição» | Só se `canEdit`; estado visível; **único** na vista |
| User menu | Entrar\|Sair, idioma, tema | Partilhado com SiteChrome |

Barra inferior (só viewport **estreito**):

| Item | Target |
|------|--------|
| Mapa | `/c/:slug` |
| Relações | `/c/:slug/relacoes` |

MUST NOT: menu, tema ou Modo edição na barra inferior.

## Home / painel

- Marca + user menu (idioma, tema, Entrar/Sair).
- MUST NOT: tabs Mapa/Relações, nome de campanha, Modo edição, bottom nav.

## Uniqueness (SC-002)

Por vista Mapa/Relações:

- Marca produto: exactamente **1** ocorrência visível.
- Controlo edição/GM: **0** (sem `canEdit`) ou **1** (com `canEdit`).
- SideMenu / coluna: sem brand row nem tag «Modo GM».
