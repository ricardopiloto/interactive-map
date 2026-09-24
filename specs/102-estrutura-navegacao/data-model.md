# Data Model: Estrutura e navegação

**Feature**: `102-estrutura-navegacao`  
**Date**: 2026-09-20

Sem alterações de schema SQLite / Alembic. Estado só no cliente.

## ThemePreference

| Field | Type | Rules |
|-------|------|--------|
| value | `auto` \| `light` \| `dark` | Persistido em `localStorage` chave `codex.theme` |
| effective | `light` \| `dark` | Derivado: Auto → `prefers-color-scheme`; senão = value |

**Transitions**: user escolhe no menu → gravar → aplicar `html[data-theme]`. Valor inválido → `auto`.

## EditMode

| Field | Type | Rules |
|-------|------|--------|
| slug | string | Campanha actual (`/c/:slug`) |
| enabled | boolean | Default `false` ao entrar no slug |
| canEdit | boolean | Sessão + membership 095; se false, controlo oculto e `enabled` forçado false |

**Transitions**:
- Enter `/c/:slug` → `enabled = false` (ou ler `sessionStorage` da mesma aba/slug se existir).
- Toggle → flip `enabled` (só se `canEdit`).
- Navigate Mapa ↔ Relações → `enabled` inalterado.
- Leave `/c/:slug` ou change slug → `enabled = false` (limpar storage do slug anterior).

## ChromeView

| Field | Type | Rules |
|-------|------|--------|
| brand | literal `Campaign Codex` | Link → `/` |
| campaignName | string \| null | Texto; só em `/c/:slug` |
| section | `mapa` \| `relacoes` \| null | null fora de campanha |
| narrow | boolean | ~≤800px: bottom nav on, top tabs off |

## Relationships

- `EditMode.slug` ↔ rotas 094.
- `canEdit` ↔ Membro (095); sem entidade nova no FE além de flag derivada.
