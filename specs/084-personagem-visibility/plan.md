# Implementation Plan: Visibilidade de Personagem (GM)

**Branch**: `084-personagem-visibility` | **Date**: 2026-08-13 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/084-personagem-visibility/spec.md`

**Release**: Codex **0.17.0** (minor — nova capacidade de produto: ocultar personagem + conexões aos jogadores)

## Summary

Adicionar ao personagem o atributo **visível para todos** (default `true`). Em APIs públicas, filtrar personagens ocultos e quaisquer vínculos em que participem; filtrar também `npc_ids` em locais e listagens `/api/npcs`. Em modo GM, listar tudo; formulário com checkbox «Visível para todos»; distintivo no nó do grafo e indicação no formulário. Regras existentes de vínculo (`publico` / conhecido) mantêm-se e combinam-se (AND) com a visibilidade dos extremos.

## Technical Context

**Language/Version**: Python 3.12 / FastAPI / SQLModel; TypeScript / React 19 / Vite 8  
**Primary Dependencies**: modelo `NPC` (`npc` table); routers `public/personagens`, `public/vinculos`, `public/npcs`, `public/locais`; admin personagens; `PersonagemFormDialog`; `GraphStage`; i18n `relacoes`  
**Storage**: SQLite — coluna nova + `_migrate_sqlite()` (padrão do projecto; sem Alembic)  
**Testing**: Manual quickstart; `npm run build`; smoke API public vs admin  
**Target Platform**: Web Codex (Relações + Mapa)  
**Project Type**: Full-stack (backend filter + frontend GM UI)  
**Performance Goals**: Listagens públicas sem regressão perceptível; SC-002 &lt;3 s após refresh  
**Constraints**: Clarifications 2026-08-13 (3/3); não alterar modelo `publico`/`conhecido` do vínculo; hub fora de âmbito  
**Scale/Scope**: ~1 coluna + schemas/routers + form/graph/i18n + versão 0.17.0  

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- Spec clarified (3/3): **PASS**
- Segredo filtrado no **servidor** (não só UI): **PASS** (obrigatório para FR-003/004/008)
- Combina com regras de vínculo existentes sem as reescrever: **PASS**
- Default / migração = visível (SC-003): **PASS**
- Hub fora de âmbito: **PASS**

**Post-Phase 1**: Unchanged. Contratos API + UI documentados; migração SQLite in-place.

## Project Structure

### Documentation (this feature)

```text
specs/084-personagem-visibility/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── api-personagem-visibility.md
│   └── ui-personagem-visibility.md
└── tasks.md             # /speckit-tasks
```

### Source Code (repository root)

```text
backend/app/
├── models/npc.py                 # campo visivel_para_todos
├── database.py                   # ALTER TABLE migrate default 1
├── schemas/personagem.py         # Create/Update/Read
├── schemas/npc.py                # NPCRead (+ create/update se usados)
├── routers/public/personagens.py # filtrar list/get
├── routers/public/vinculos.py    # player_visible + extremos visíveis
├── routers/public/npcs.py        # filtrar list/get
├── routers/public/locais.py      # filtrar npc_ids no LocalRead público
├── routers/admin/personagens.py  # persistir campo
└── seed.py                       # opcional: default explícito

frontend/src/
├── types/index.ts
├── components/relacoes/PersonagemFormDialog.tsx
├── components/relacoes/GraphStage.tsx          # distintivo nó
├── components/relacoes/RelacoesDetailPanel.tsx # opcional tag se seleccionado
├── pages/RelacoesPage.tsx                     # draft + payload
└── locales/{pt-BR,en}/relacoes.json

PinModal / MapPage: beneficiam do filtro em locais/npcs (sem UI especial)
```

**Structure Decision**: Campo no modelo unificado `NPC`; filtragem server-side em todos os routers públicos que expõem personagem; UI só no fluxo GM de Relações (+ badge no grafo).

## Complexity Tracking

> None.
