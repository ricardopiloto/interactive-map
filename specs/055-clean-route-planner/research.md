# Research: Clean Calcular Rota Panel

**Feature**: `055-clean-route-planner` | **Date**: 2026-08-05

## 1. Collapse control pattern

**Decision**: Controlled React state `optionsOpen: boolean` (default `false`). Toggle via a header **button** with `aria-expanded` / `aria-controls`. Reset `optionsOpen` to `false` whenever the panel opens (`open` edge, same effect that resets modo/preferência).

**Rationale**: Full control over header content (title + optional summary line); matches FR-007 reopen → collapsed. Avoids fighting native `<details>` for custom summary layout.

**Alternatives considered**:
- Native `<details>`/`<summary>` — good a11y baseline but awkward for dynamic summary + forced collapse on open
- Always-visible compact segmented controls — rejected by clarify (progressive disclosure locked)

## 2. Non-default summary microcopy

**Decision**: Opening defaults for summary comparison:

| Control | Default |
|---------|---------|
| `modo` | `pago` |
| `ritmo` | `normal` |
| `ordenacao` | `mais_rapida` |
| `preferenciaVia` | `nenhuma` |
| `velocidade` | only relevant when `modo === 'proprio'`; default draft `'4'` |

When collapsed, build an array of short labels for deviations, joined with ` · `:

| Deviation | Summary fragment |
|-----------|------------------|
| `proprio` | `Próprio` (+ ` · {n} mi/h` if velocidade ≠ `4`) |
| `intenso` | `Intenso` |
| `mais_barata` | `Mais barata` |
| `rio` / `estrada` | `Por rio` / `Por estrada` |

If the array is empty → render **no** summary line (only “Opções de viagem”).

**Rationale**: Clarification Q2; short Portuguese labels; speed only when próprio and non-default mph.

**Alternatives considered**: Always-full summary — rejected in clarify; English keys — rejected.

## 3. Vertical order

**Decision**: JSX order: title → De → Para → Calcular → error → options block → results list (empty state hints stay after list / as today).

**Rationale**: Clarification Q1.

## 4. Label shortening (US3)

**Decision**:

- Ritmo options: `Normal` / `Intenso`; show `6 h/dia` / `8 h/dia` as muted helper text under the field or `title`/`aria-description` — prefer one muted line under the ritmo control when options expanded.
- Transporte: `Pago` / `Próprio` (legend remains “Transporte”).
- Preferência / ordenação: keep current short labels.

**Rationale**: FR-006 without losing meaning.

## 5. Compact result rows

**Decision**: Each item: **title** (existing routeTitles + first badge) + **one meta line**:  
`{distancia_milhas} mi · {tempo_texto} · Dentro {custo_dentro_bp} · Fora {custo_fora_bp}`  
CSS: title strong; meta single line, smaller/muted, allow wrap only if needed.

**Rationale**: FR-005 / SC-005 intent (two typographic bands).

## 6. Backend

**Decision**: No changes to `route_planner.py`, routes API, or `campaignApi.planRoute` signature.

**Rationale**: FR-010.
