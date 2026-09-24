---

description: "Task list template for feature implementation"
---

# Tasks: Filtro de tipo de vínculo no painel de detalhe (Relações)

**Input**: Design documents from `/specs/133-filtro-vinculos-detalhe/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md)

**Tests**: UI de polimento (Constitution II) — validação por `quickstart.md`, sem teste automatizado obrigatório.

**Organization**: 2 user stories P1 — US1 (o filtro em si) e US2 (independência do filtro do grafo) são satisfeitas juntas pela mesma implementação; tratadas como uma sequência única de tarefas.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Pode rodar em paralelo (arquivo diferente, sem dependência de tarefa incompleta)
- **[Story]**: US1 ou US2

## Path Conventions

`frontend/src/` — produção.

---

## Phase 1: Foundational — remonta ao trocar de personagem

**Purpose**: pré-requisito pra FR-004 (US1) sem precisar de lógica extra depois.

- [X] T001 Em `frontend/src/pages/RelacoesPage.tsx`, no call site de `PersonagemDetailBody` (linha ~578), adicionar `key={personagem.id}` — força remontagem ao trocar de pessoa selecionada, pra um `useState` local de filtro nascer sempre limpo

**Checkpoint**: trocar de personagem já reseta qualquer estado local futuro de `PersonagemDetailBody`, sem código adicional.

---

## Phase 2: User Story 1 - Filtrar os vínculos de um personagem por tipo (Priority: P1)

**Goal**: filtro funcional, local ao painel de detalhe.

**Independent Test**: selecionar personagem com vínculos de tipos diferentes, filtrar por um tipo, confirmar que só esses aparecem.

### Implementation for User Story 1

- [X] T002 [US1] Em `PersonagemDetailBody` (`RelacoesPage.tsx`), adicionar estado local `const [activeDetailTipos, setActiveDetailTipos] = useState<Set<VinculoTipo>>(new Set(VINCULO_TIPOS))` (depende de T001)
- [X] T003 [US1] Adicionar função auxiliar que decide se um vínculo passa no filtro: visível se `myTipo` (perspectiva do personagem) **ou** o tipo do outro sentido estiver em `activeDetailTipos` (lógica de duas-vias, ver `research.md` Decisão 2) (depende de T002)
- [X] T004 [US1] Filtrar `sortedVinculos` pela função de T003 antes do `.map()` que renderiza as linhas; a contagem exibida (`detail.vinculosCount`) passa a usar o tamanho da lista **filtrada** (depende de T003)
- [X] T005 [US1] Renderizar o controle de filtro (chips reaproveitando `VINCULO_TIPOS`/`getVinculoTipoLabel`/`vinculoStyle`, mesmo padrão visual dos chips do filtro do grafo geral) no topo do painel de detalhe, alternando presença/ausência de cada tipo em `activeDetailTipos` no clique (depende de T002)

**Checkpoint**: filtro funciona, isolado dentro do painel de detalhe.

---

## Phase 3: User Story 2 - Filtro do painel é independente do filtro do grafo geral (Priority: P1)

**Goal**: garantir zero leitura/escrita cruzada com `activeTipos`.

**Independent Test**: filtrar o grafo geral por um tipo, selecionar alguém com vínculos de outros tipos, confirmar que o painel de detalhe mostra todos.

### Implementation for User Story 2

- [X] T006 [US2] Revisão de código: confirmar que `activeDetailTipos` (T002) não lê nem escreve `activeTipos` (o estado do filtro do grafo geral, em `RelacoesPage`) em nenhum ponto — são dois `useState` completamente separados, em componentes diferentes (depende de T005)

**Checkpoint**: as duas histórias funcionam juntas — filtro útil e sem interferência com o filtro do grafo.

---

## Phase Final: Polish & Validação

- [X] T007 [P] Rodar `cd frontend && npx tsc --noEmit`
- [X] T008 Executar os 5 cenários (A–E) do `quickstart.md`

---

## Dependencies & Execution Order

T001 → T002 → T003 → T004 → T005 → T006 (validação) → T007/T008 (Polish, paralelo).

## Notes

- Rótulo do controle de filtro reaproveita a chave `column.tiposVinculo` ("Tipos de vínculo") já existente — os dois filtros (grafo geral e painel de detalhe) nunca aparecem na tela ao mesmo tempo (um mostra quando nada está selecionado, o outro só quando algo está), então reaproveitar o mesmo texto não causa confusão visual. Nenhuma chave de i18n nova necessária.
- `ErrorBoundary`, unificação com o filtro do grafo, e persistência entre sessões ficam fora do escopo (ver Assumptions em `spec.md`).
