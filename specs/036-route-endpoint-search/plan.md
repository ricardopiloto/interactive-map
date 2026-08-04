# Implementation Plan: Busca De/Para no Calcular Rota

**Branch**: `036-route-endpoint-search` | **Date**: 2026-08-03 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/036-route-endpoint-search/spec.md`

## Summary

Substituir os `<select>` nativos de **De** e **Para** no painel **Calcular rota** por comboboxes: o utilizador digita, vê sugestões filtradas pelo rótulo (nome do nó / local / `Nó {id}`), escolhe um item e calcula como hoje. Filtro local, case- e accent-insensitive, trim; reeditar limpa a seleção; ambos os lados listam todos os nós (De ≠ Para só no Calcular). Sem API nova e sem alterar o planeador de rotas.

## Technical Context

**Language/Version**: TypeScript / React 19 (frontend)

**Primary Dependencies**: React; `RoutePlannerPanel.tsx` / `RoutePlanner.css`; labels via `waypointOptionLabel` existente

**Storage**: N/A (sem migration; sem novos campos)

**Testing**: Validação manual via [quickstart.md](./quickstart.md)

**Target Platform**: Browsers modernos (desktop e móvel)

**Project Type**: Web application (UX do planeador de rotas)

**Performance Goals**: Filtragem instantânea sobre a lista de waypoints já em memória (tipicamente dezenas–centenas)

**Constraints**:
- Combobox em De e Para (FR-001–005, clarifications)
- Sem endpoint de pesquisa (assumptions)
- Sem omitir o extremo oposto na lista (FR-010)
- Sem regressão no cálculo / ritmos / custos / resultados (FR-007)
- Sem novas dependências npm salvo justificação forte (YAGNI)

**Scale/Scope**: `frontend/src/components/routes/` (+ helper de normalização de texto se extraído); não tocar backend, digitizer, nem mapa

## Constitution Check

| Gate | Status |
|------|--------|
| Escopo UI local no painel existente | PASS |
| Sem alteração de persistência / API de rotas | PASS |
| Clarifications bloqueantes já fechadas no spec | PASS |
| Complexidade mínima (sem lib de combobox se custom bastar) | PASS |

**Post-design re-check**: PASS — UI contract + data-model de estado de UI; sem contratos HTTP.

## Project Structure

### Documentation (this feature)

```text
specs/036-route-endpoint-search/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── ui-route-endpoint-combobox.md
└── tasks.md
```

### Source Code

```text
frontend/src/components/routes/
├── RoutePlannerPanel.tsx   # De/Para: combobox; estado query + selectedId
├── RoutePlanner.css        # estilos do combobox / lista de sugestões
├── WaypointCombobox.tsx    # (opcional) controlo reutilizável De/Para
└── textMatch.ts            # (opcional) normalize + includes accent-fold
```

**Structure Decision**: Frontend-only no módulo `routes`. Extrair `WaypointCombobox` + helper de match se o painel ficar denso; caso contrário, inline no painel com CSS partilhado. Backend intacto.

## Complexity Tracking

Sem violações. Combobox custom leve preferido a nova dependência.
