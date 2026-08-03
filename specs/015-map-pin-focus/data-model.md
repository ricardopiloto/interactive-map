# Data Model: 015-map-pin-focus

Nenhuma alteração de persistência, schemas ou APIs.

## Estado de UI (sessão) — reutilizado de 012

### Pedido de foco (`focusRequest`)

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `localId` | `number` | Pin a centrar |
| `nonce` | `number` | Novo a cada clique (menu ou mapa) para re-disparar |

### Constantes (inalteradas)

| Nome | Valor | Notas |
|------|-------|-------|
| `FOCUS_SCALE` | `2` | Zoom moderado fixo |
| `FOCUS_ANIM_MS` | `400` | Animação curta |

## Transições

1. Jogador clica pin no mapa → `selectedLocalId = id` (+ modal) → `focusRequest = { id, nonce++ }`
2. `PinFocusController` → `zoomToElement(#map-pin-id, FOCUS_SCALE, …)`
3. Clique de novo no mesmo pin → novo nonce → reanima foco
4. Menu → mesmo `focusRequest` (já existente)
5. GM clica pin → só seleção (sem `focusRequest` desta feature)
6. Hover menu → só `hoveredLocalId`

## Invariantes

- Foco por clique no mapa só em modo jogador.
- Mesmo `FOCUS_SCALE` que o menu.
- Hover nunca seta `focusRequest`.
