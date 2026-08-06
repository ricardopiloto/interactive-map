# UI Contract: Clean Calcular Rota Panel

**Feature**: `055-clean-route-planner`  
**Date**: 2026-08-05  
**Related**: [research.md](../research.md), [spec.md](../spec.md)

## Layout order (required)

1. Header (title + close)  
2. De  
3. Para  
4. **Calcular**  
5. Error (conditional)  
6. **Opções de viagem** (collapsible)  
7. Results list  

## Options block

### Collapsed

- Header control: button labeled **Opções de viagem** (chevron or equivalent showing collapsed/expanded).
- If non-default summary fragments exist: second line under label, muted, joined with ` · ` (research §2).
- If all defaults: **no** summary line.

### Expanded

- Same header (expanded state).
- Body contains, in sensible order:
  - Transporte (Pago / Próprio)
  - Ritmo (Normal / Intenso + muted h/dia hint)
  - Ordenar por (Mais rápida / Mais barata)
  - Preferência de via (Sem preferência / Por rio / Por estrada)
  - Velocidade desejada — only if Próprio

### Behaviors preserved

- Auto-recalc on modo / ordenação / preferência (existing).
- On panel open: modo → pago, preferência → nenhuma, velocidade draft → 4, **optionsOpen → false**.
- Values persist while panel stays open even if user collapses again.

## Results

- Title band + single meta line:  
  `{mi} mi · {tempo} · Dentro {bp} · Fora {bp}`

## Non-goals

- No API changes.
- No removal of controls.
- No map/digitizer changes.

## Acceptance mapping

| Spec | UI |
|------|-----|
| FR-001/002 | Order + collapse under Calcular |
| FR-003/003a | Toggle + non-default summary |
| FR-004 | All controls still present when expanded |
| FR-005 | Compact meta line |
| FR-006 | Shorter ritmo/transporte labels |
| FR-007 | optionsOpen false on open |
| SC-006 | Summary only when fragments non-empty |
