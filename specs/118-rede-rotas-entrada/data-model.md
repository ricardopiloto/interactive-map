# Data model: Rede de rotas — entrada e casca (118)

**Feature**: `118-rede-rotas-entrada`  
**Scope**: UI state only — **no** schema / API / entity persistence changes.

## Entities (client UI)

### Entrada Rede de rotas

| Attribute | Notes |
|-----------|--------|
| Visibility | True iff Modo edição activo (GM / `useEditMode` enabled) na página Rota |
| Label | Existing i18n `mapPage.routeNetwork` |
| Action | Opens digitizer overlay (`digitizerOpen = true`) |

### Digitalizador overlay (RotaPage)

| Attribute | Notes |
|-----------|--------|
| `digitizerOpen` | Local boolean on `RotaPage`; default `false` |
| Close | Existing `onClose` → `digitizerOpen = false`; returns to planner + map |
| Instance | Same `RouteDigitizerView` component as pre-feature (moved call site) |

### Menu ferramentas GM (Mapa)

| Attribute | Notes |
|-----------|--------|
| Route-network item | **Removed** |
| Other items | Unchanged (NPC, arco, grupo, …) |
| Menu container | Remains while other items exist |

## Unchanged domain data

Waypoints, segments (incl. intermediate points), map scale miles, locais linkage — same models and APIs as today. This feature does not introduce fields or transitions on those entities.

## State transitions

```text
Rota (edit mode)
  └─ [click Rede de rotas] → digitizerOpen=true → RouteDigitizerView fullscreen
       └─ [Sair / onClose] → digitizerOpen=false → Rota planner visible

Mapa (edit mode)
  └─ GM menu → (no transition to digitizer)
```
