# Research: 025-route-type-title

## 1. Formatação do título base

**Decision**: Mapear `tipos[]` → rótulos PT com primeira letra maiúscula (`rio`→`Rio`, `estrada`→`Estrada`, `trilha`→`Trilha`). Vários tipos: juntar com `", "` (ex.: `Estrada, rio` — primeiro capitalizado, demais minúsculos após vírgula, ou capitalizar cada um; preferir **capitalizar cada segmento**: `Estrada, Rio`). Lista vazia → `"Rota"`.

**Rationale**: Spec FR-002/003; legibilidade.

**Alternatives considered**: Só o primeiro tipo em mistos — rejeitado (FR-003 pede todos).

## 2. Desambiguação

**Decision**: Calcular título base por rota; percorrer a lista na ordem já ordenada (mais rápida primeiro); manter contagem por título base; 1.ª ocorrência sem sufixo; 2.ª+ → ` ${base} (${n})`.

**Rationale**: Clarificação B; SC-004.

**Alternatives considered**: Sempre numerar — rejeitado; títulos iguais sem sufixo — rejeitado.

## 3. Linha secundária e “mais rápida”

**Decision**: Remover `<span className="route-planner__tipos">…</span>`. Título: `{title}{i === 0 ? ' · mais rápida' : ''}` (ou equivalente).

**Rationale**: Clarificação A; FR-004.

## 4. Backend

**Decision**: Nenhuma mudança; `tipos` já vem no `RoutePlanItem`.

**Rationale**: FR-005 / Assumptions.
