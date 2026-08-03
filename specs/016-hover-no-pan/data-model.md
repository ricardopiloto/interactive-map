# Data Model: 016-hover-no-pan

Nenhuma alteração de persistência, schemas ou APIs.

## Estado de UI (sessão) — separação estrita

| Estado | Disparado por | Efeito permitido |
|--------|---------------|------------------|
| `hoveredLocalId` | `onMouseEnter` / `Leave` no menu (Locais) | Classe CSS no pin (+ cartão); **não** pan/zoom da vista |
| `focusRequest` | Clique menu / clique pin (jogador) | `zoomToElement` pan+zoom |
| `selectedLocalId` | Clique | Seleção + modal |

## Invariantes

- Mudança de `hoveredLocalId` MUST NOT causar alteração de pan/zoom da vista.
- `focusRequest` só muda em gestos de clique (ou limpeza pós-consumo, se adotada).
- Destaque local (scale/glow) do pin é independente da transform da vista.

## Transições

1. Hover local X → `hoveredLocalId = X` → pin X `--hovered`; vista inalterada
2. Leave → `hoveredLocalId = null`; vista inalterada
3. Clique → `focusRequest` novo nonce → vista anima; hover continua só visual
