# Contract: UI — Módulos na ficha de personagem

**Feature**: `077-sistema-modulos`

## Data source

- `GET /api/config` → `modulos_ativos`, `sistema`
- Personagem draft includes `extensoes_mecanica` when module active

## Registry

```ts
IMPLEMENTED_MODULES = ['fadiga']
componentesPorModulo.fadiga → FadigaWidget
```

## Render rules

| Condition | Player UI | GM UI |
|-----------|-----------|-------|
| Module active + implemented | Show widget | Show widget |
| Module active + **not** implemented | Hide | Discrete banner: módulo activo mas indisponível |
| Module inactive | Hide | Hide |

## FadigaWidget (v2 launch)

- Numeric input or stepper for `extensoes_mecanica.fadiga` (0–6)
- Label: "Fadiga" (i18n deferred to 080 — hardcode PT for now)
- Only mounted when `"fadiga" ∈ modulos_ativos`

## Landing (App shell)

| `has_map_image` | `/` route |
|-----------------|-----------|
| `true` | `MapPage` (unchanged) |
| `false` | Redirect to `/relacoes` |

Nav links Mapa / Relações always available.

## Out of scope (unchanged UI)

- Route planner fatigue colours (062–063)
- Vínculos, mapa pins, rotas digitizer
