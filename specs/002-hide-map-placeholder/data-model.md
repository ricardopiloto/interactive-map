# Data Model: 002-hide-map-placeholder

## Overview

Sem alterações em entidades persistidas (SQLite). A feature é **estado de UI** no cliente.

## UI state (efêmero)

| Campo | Tipo | Default | Notas |
|-------|------|---------|-------|
| mapFailed | boolean | `false` | `true` após `img.onError`; `false` após `onLoad` ou ao trocar `mapUrl` |
| mapUrl | string (prop) | `/uploads/map/campaign-map.webp` (ou env) | Inalterado |

## Transitions

```text
[mount / mapUrl change] → mapFailed=false → img loading
        ├─ onLoad  → mapFailed=false → mostrar imagem; ocultar placeholder
        └─ onError → mapFailed=true  → ocultar/ignorar imagem; mostrar placeholder
```

## Persistence

Nenhuma. Upload do mapa e path canônico `campaign-map.*` permanecem como na feature 001.
