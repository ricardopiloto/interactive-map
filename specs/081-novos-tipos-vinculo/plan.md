# Implementation Plan: Novos Tipos de Vínculo (Rede de Relações)

**Branch**: `081-novos-tipos-vinculo` | **Date**: 2026-08-13 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/081-novos-tipos-vinculo/spec.md`

**Release**: Codex **0.16.0** (pós-v2.0.0 / 0.15.0 i18n)

## Summary

Estender o catálogo de tipos de vínculo de **6 para 8** (`adversario`, `vinculo_sangue`) sem novos campos na tabela `vinculo`. Backend alarga o enum; frontend alarga union, estilos, ordem canónica, i18n PT/EN, sugestões de qualificador e o pré-preenchimento de direcção A→B ao **seleccionar** Vínculo de Sangue em modo recíproco. Documentação canónica: `docs/feature-rede-relacoes.md`.

## Technical Context

**Language/Version**: TypeScript / React 19 / Vite 8 (frontend); Python 3.12 / FastAPI / SQLModel (backend)  
**Primary Dependencies**: `VinculoTipo` enum (Python + TS), `vinculoStyles.ts`, `qualificadorSuggestions.ts`, `VinculoFormDialog.tsx`, i18n `relacoes.json`  
**Storage**: SQLite `vinculo.tipo_ab` / `tipo_ba` (`VARCHAR(20)`); sem migração — valores novos cabem (`vinculo_sangue` = 15 chars)  
**Testing**: Quickstart manual; `npm run build`; criar/editar os 2 tipos no GM; filtro/legenda 8 entradas  
**Target Platform**: Web desktop + mobile (mesmos surfaces da Rede)  
**Project Type**: Monorepo — `frontend/` + `backend/` + `docs/feature-rede-relacoes.md`  
**Performance Goals**: Sem impacto — 2 entradas no catálogo; mesmo grafo  
**Constraints**: Clarifications 2026-08-13 (5/5); sem novos campos DB; Lacaio continua qualificador; sem mecânicas de sistema  
**Scale/Scope**: ~10 ficheiros de código + 2 JSON i18n + 1 doc produto + versão 0.16.0  

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- Spec clarified (5/5): **PASS**
- Sem novos campos / sem migração SQL: **PASS** — só extensão de enum em código
- Lacaio não é tipo: **PASS** — FR-007
- Conteúdo do mestre não traduzido: **PASS** — só labels de catálogo UI (`vinculoTipo.*`)
- Depende de 080 (i18n): **PASS** — 0.15.0 implementada
- Sem mecânicas VtM/geas: **PASS** — taxonomia visual/UI

**Post-Phase 1**: Unchanged. Cores hex fixadas em research; contrato de formulário distingue *seleccionar tipo* vs *abrir diálogo*.

## Project Structure

### Documentation (this feature)

```text
specs/081-novos-tipos-vinculo/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── api-vinculo-tipo.md
│   ├── ui-vinculo-catalog.md
│   └── ui-vinculo-form.md
└── tasks.md             # /speckit-tasks
```

### Source Code (repository root)

```text
backend/app/models/vinculo.py          # VinculoTipo + 2 valores
frontend/src/types/index.ts           # union VinculoTipo
frontend/src/components/relacoes/
├── vinculoStyles.ts                  # VINCULO_STYLES + VINCULO_TIPOS (ordem canónica)
├── qualificadorSuggestions.ts        # Lacaio; adversario = inimizade; vinculo_sangue
└── VinculoFormDialog.tsx             # onChange tipo → direcao a_para_b se vinculo_sangue (recíproco)
frontend/src/locales/{pt-BR,en}/relacoes.json   # vinculoTipo.adversario / vinculoTipo.vinculo_sangue
docs/feature-rede-relacoes.md         # §§ 3.1, 6, 6.1, 11
frontend/package.json / backend/pyproject.toml / README.md / CHANGELOG.md   # 0.16.0
```

Surfaces que já iteram `VINCULO_TIPOS` (sem código extra se a ordem/array for a fonte única): `RelacoesSideColumn` (chips + legenda), `VinculoFormDialog` (selects), `RelacoesPage` (filtro inicial). Grafo já usa `vinculoStyle(tipo)` — TypeScript força as 2 chaves novas em `VINCULO_STYLES`.

**Structure Decision**: Catálogo único em `vinculoStyles.ts` (`VINCULO_TIPOS` + `VINCULO_STYLES`); enum Python espelha os IDs; labels só em i18n.

## Complexity Tracking

> None.
