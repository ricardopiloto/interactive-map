# Data Model: 012-menu-center-pin

Nenhuma alteração de persistência, schemas ou APIs.

## Estado de UI (sessão)

### Pedido de foco no mapa

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `localId` | `number` | Local cujo pin deve ser centrado |
| `nonce` | `number` (ou timestamp) | Garante re-disparo ao clicar o mesmo local de novo |

Consumido por `CampaignMap` (effect / controller interno) → `zoomToElement` → descartado após aplicar (ou mantido só como último pedido).

### Constantes de vista

| Nome | Valor proposto | Notas |
|------|----------------|-------|
| `FOCUS_SCALE` | `2` | Entre `minScale` 0.5 e `maxScale` 4 |
| `FOCUS_ANIM_MS` | `400` | Animação curta |

### Entidades existentes (inalteradas)

- **Local**: `id`, `x`, `y` (0–1) — posição do pin no stage
- **selectedLocalId**: seleção/destaque/modal — continua independente do transform, mas menu seta ambos

## Transições

1. Clique menu em local X → `selectedLocalId = X` (+ modal jogador) → `focusRequest = { X, nonce++ }`
2. `CampaignMap` observa `focusRequest` → `zoomToElement(#map-pin-X, FOCUS_SCALE, …)`
3. Clique pin no mapa → só `selectedLocalId` (sem novo `focusRequest`)
4. Hover menu → só `hoveredLocalId`
5. Placement GM ativo → sem seleção e sem foco

## Invariantes

- Hover nunca altera pan/zoom por esta feature.
- Mesmo `FOCUS_SCALE` em todo foco pelo menu.
