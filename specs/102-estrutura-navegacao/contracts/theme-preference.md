# Contract: Theme preference

**Feature**: `102-estrutura-navegacao`

## Storage

| Key | Values | Default |
|-----|--------|---------|
| `codex.theme` | `auto`, `light`, `dark` | `auto` |

## Apply

| Preference | `html[data-theme]` |
|------------|-------------------|
| `light` | `light` |
| `dark` | `dark` |
| `auto` | `dark` se `prefers-color-scheme: dark`, senão `light`; actualiza em `change` do media query |

## FOUC

`index.html` inline script: ler `codex.theme` antes do paint; se `light`/`dark` forçar; se `auto`/ausente/inválido → media query (comportamento UX-1).

## Menu

User menu expõe três opções Auto / Claro / Escuro (i18n). Escolha imediata + persistência. Reload mantém Claro/Escuro.

## Styleguide

Preview scoped `.styleguide-preview[data-theme]` NÃO altera a preferência global.
