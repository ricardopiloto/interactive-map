# Contract: Edit mode

**Feature**: `102-estrutura-navegacao`

## Visibility

| Condition | UI |
|-----------|-----|
| Anónimo ou autenticado sem membership na campanha | Controlo **ausente** |
| Autenticado + membro (095 `require_membro`) | Um toggle «Modo edição» no **topo** |

## Behaviour

| Event | `enabled` |
|-------|-----------|
| Enter campaign / change slug | `false` |
| Toggle on/off | flip (only if visible) |
| Navigate Mapa ↔ Relações | unchanged |
| Leave `/c/:slug` | `false` |
| Toggle off | MUST NOT call logout |

## Session vs edit mode

- **Sair** (menu): encerra sessão 095; `canEdit` → false; controlo desaparece.
- **Modo edição off**: sessão mantém-se; UI deixa de expor acções de mestre ligadas a `isGm`/`isEditMode` (comportamento existente das páginas).

## Persistence

Optional `sessionStorage` key `codex.editMode.<slug>` = `"1"` | `"0"` within the same tab; cleared when slug changes. MUST NOT use `localStorage` for edit mode.

## Labels

- Estado sempre legível (texto e/ou `aria-pressed`).
- Copy i18n: deixar de apresentar «Modo GM» como indicador duplicado no chrome/coluna.
