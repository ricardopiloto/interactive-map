# Research: Rede de Relações

## 1. Families + stroke

**Decision**: Map RFC §5 into `VINCULO_STYLES`: `family`, `color` (CSS var), `width`, `pattern` (`solid`|`dotted`|`dashed`|`double`|`dashShort`).

## 2. Tokens

**Decision**: `--vinculo-afinidad`, `--vinculo-laco`, `--vinculo-hostil`, `--vinculo-neutro` dark/light from RFC; deprecate per-tipo vars (aliases OK).

## 3. Curves

**Decision**: Quadratic SVG path with control point offset perpendicular to chord (~12–18px); same for dual lines (offset ±).

## 4. Labels

**Decision**: Remove/ignore `sempre` mode for edge labels; show on focus highlight or hover only.

## 5. Keyboard

**Decision**: Nodes `tabIndex={0}`, `role="button"`, Enter/Space select; Tab order = visible node list order.
