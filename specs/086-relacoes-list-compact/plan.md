# Implementation Plan: Lista na coluna, hover no palco e anéis mais compactos

**Branch**: `086-relacoes-list-compact` | **Date**: 2026-08-14 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/086-relacoes-list-compact/spec.md`

**Release**: Codex **0.18.0** (minor — lista de personagens, preview de hover, folga compacta no anel de foco)

## Summary

Na Rede de Relações: (1) lista com scroll de todos os personagens visíveis (PJ+NPC) na coluna, abaixo dos chips de tipo — clique = disco; (2) anel interior do foco mais junto só quando há **>6** conexões directas visíveis (folga 240→160); (3) hover na lista destaca no palco o disco e as linhas directas visíveis, sem seleccionar. Sem backend. Ver [research.md](./research.md).

## Technical Context

**Language/Version**: TypeScript / React 19 / Vite 8 (frontend)  
**Primary Dependencies**: `RelacoesSideColumn`, `RelacoesPage`, `GraphStage`, `graphLayout.ts`; i18n `relacoes.json`; precedente hover `hoveredLocalId` / `onLocalHover`  
**Storage**: N/A — `hoveredId` e folga compacta são sessão no cliente  
**Testing**: Quickstart manual (`/relacoes`); `npm run build` (`tsc -b`)  
**Target Platform**: Web Codex — aba Relações  
**Project Type**: Frontend UX + doc de produto  
**Performance Goals**: Hover e clique na lista sem rearranjar anéis no hover; compactação só recalcula o layout de foco já existente  
**Constraints**: Clarifications 2026-08-14 (lista = PJ+NPC; compactar só anel interior do foco). Hover ≠ clique. Visibilidade inalterada.  
**Scale/Scope**: coluna + palco + `graphLayout`; manuais + CHANGELOG 0.18.0  

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- Spec clarified (Q1/Q2) + hover com defaults testáveis: **PASS**
- Sem migração / sem API nova: **PASS**
- Visibilidade (oculto / vínculo secreto) inalterada: **PASS** — lista e preview consomem o mesmo conjunto do palco
- Compactação limitada ao anel interior do foco com `count > 6`: **PASS** — FR-008
- Hover não selecciona nem muda layout: **PASS** — FR-011
- Sem mecânicas de sistema: **PASS**

**Post-Phase 1**: Unchanged. Folga compacta fixada em research (factor ⅔, min 120 → 160 com default 240). Contrato UI cobre ordem da coluna, preview e `computeFocusLayout(innerSpacing)`. Quickstart cobre lista, busca, Isolar, 4/6/8 conexões, hover e build.

## Project Structure

### Documentation (this feature)

```text
specs/086-relacoes-list-compact/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── ui-relacoes-list-compact.md
└── tasks.md             # /speckit-tasks
```

### Source Code (repository root)

```text
frontend/src/components/relacoes/RelacoesSideColumn.tsx
frontend/src/components/relacoes/RelacoesSideColumn.css
frontend/src/pages/RelacoesPage.tsx
frontend/src/components/relacoes/GraphStage.tsx
frontend/src/components/relacoes/GraphStage.css
frontend/src/components/relacoes/graphLayout.ts
frontend/src/locales/pt-BR/relacoes.json
frontend/src/locales/en/relacoes.json
docs/manual-relacoes.md
CHANGELOG.md / README.md / frontend/package.json
backend/pyproject.toml / specs/v2/README.md          # 0.18.0
```

**Structure Decision**: Só frontend da Rede + manual. `graphLayout.ts` ganha constantes e `innerSpacing` no layout de foco. Backend não entra.

## Complexity Tracking

> None.
