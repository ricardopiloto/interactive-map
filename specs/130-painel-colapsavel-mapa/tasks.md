---

description: "Task list template for feature implementation"
---

# Tasks: MapSidePanel colapsável no desktop

**Input**: Design documents from `/specs/130-painel-colapsavel-mapa/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md)

**Tests**: UI de polimento (Constitution II) — validação por `quickstart.md`, sem teste automatizado obrigatório.

**Organization**: 3 user stories — US1 e US2 são P1, US3 é P2 (consistência, decorre de US1+US2 bem feitas nas três telas, não é código novo à parte).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Pode rodar em paralelo (arquivo diferente, sem dependência de tarefa incompleta)
- **[Story]**: US1, US2 ou US3

## Path Conventions

`frontend/src/` — produção.

---

## Phase 1: Foundational — regra de desktop em `MapSidePanel.css`

**Purpose**: sem isso, nenhuma mudança de estado JS tem efeito visual — é a peça que falta de verdade (ver `research.md`, Decisão 1).

**⚠️ CRITICAL**: bloqueia as três user stories.

- [X] T001 Em `frontend/src/components/map/MapSidePanel.css`, dentro de `@media (min-width: 861px)`: adicionar `.map-panel[data-expanded='false']` (largura reduzida, mostrando só a altura/área do `.map-panel__head`) e ajustar `.map-panel[data-expanded='true']` (ou o seletor base) pra manter a largura atual de 372px

**Checkpoint**: alternar `data-expanded` manualmente (ex. DevTools) já muda o layout visível no desktop.

---

## Phase 2: User Story 1 - Ver mais mapa quando não está buscando nem com nada selecionado (Priority: P1)

**Goal**: as três telas nascem colapsadas.

**Independent Test**: abrir cada uma das três telas sem clicar em nada; painel aparece pequeno nas três.

### Implementation for User Story 1

- [X] T002 [P] [US1] Confirmar que `MapPage.tsx` (`useState(false)`, linha ~60) já nasce colapsado — sem mudança de código, só validar visualmente após T001 (depende de T001)
- [X] T003 [P] [US1] Confirmar que `RelacoesPage.tsx` (`useState(false)`, linha ~91) já nasce colapsado — mesma validação (depende de T001)
- [X] T004 [US1] Em `frontend/src/pages/RotaPage.tsx`, trocar `useState(true)` por `useState(false)` (linha ~40) — mudança deliberada de comportamento (FR-006), documentar no commit que não é regressão (depende de T001)

**Checkpoint**: as três telas nascem colapsadas.

---

## Phase 3: User Story 2 - O painel expande sozinho quando vira o foco da ação (Priority: P1)

**Goal**: expandir por foco/seleção (já parcialmente existente) + colapsar de volta quando a ação termina (não existe ainda, ver `research.md` Decisão 2).

**Independent Test**: focar a busca expande; selecionar sem tocar na busca também expande; blur sem seleção colapsa; deselecionar colapsa; seleção ativa não colapsa no blur.

### Implementation for User Story 2

- [X] T005 [US2] Em `frontend/src/pages/MapPage.tsx`: adicionar estado `searchFocused` (`onFocus`/`onBlur` no campo de busca, linha ~400), e um efeito `useEffect` que chama `setExpanded(false)` quando `!searchFocused && selectedLocalId == null` (nome exato da variável de seleção a confirmar no componente) (depende de T004)
- [X] T006 [US2] Em `frontend/src/pages/RelacoesPage.tsx`: mesmo padrão — `searchFocused` no campo de busca (linha ~452) + efeito ligado a `!searchFocused && selectedId == null` (depende de T005)
- [X] T007 [US2] Em `frontend/src/pages/RotaPage.tsx`: identificar o equivalente de "foco expande" nos campos do formulário De/Para dentro de `RoutePlannerPanel`/`renderShell` (hoje só `onSelectIndex`/`onPlanChange` chamam `setExpanded(true)`; foco de campo ainda não) e adicionar o efeito de auto-colapsar equivalente, usando `plan`/`selectedIndex` como sinal de "algo selecionado" (depende de T006)

**Checkpoint**: painel expande e volta a colapsar corretamente nas três telas, sem fechar enquanto algo estiver selecionado.

---

## Phase 4: User Story 3 - Comportamento idêntico nas três telas (Priority: P2)

**Goal**: validar que não há divergência entre as três, além da mudança de default já prevista pra Rota.

**Independent Test**: repetir os testes de US1/US2 nas três telas e comparar.

### Implementation for User Story 3

- [X] T008 [US3] Validação manual comparativa das três telas (não é tarefa de código — se T001-T007 forem feitas de forma consistente, esta história é satisfeita por construção; usar como checklist de revisão antes de fechar a feature) (depende de T007)

---

## Phase Final: Polish & Validação

- [X] T009 [P] Rodar `cd frontend && npx tsc --noEmit`
- [X] T010 Executar os 6 cenários (A–F) do `quickstart.md`

---

## Dependencies & Execution Order

T001 (Foundational) → T002/T003/T004 (US1) → T005 → T006 → T007 (US2, sequencial por tocar em padrões parecidos em arquivos diferentes, mas cada um valida o anterior) → T008 (US3, validação) → T009/T010 (Polish, paralelo).

## Notes

- T002/T003 não geram diff de código — são checagens; se a validação revelar que o comportamento não é o esperado mesmo após T001, viram tarefas de correção pontual, não fazem parte do plano original.
- `ErrorBoundary`, ordem com `BKLG-016` (unificação Mapa+Rota) e persistência entre sessões ficam fora do escopo (ver Assumptions em `spec.md`).
