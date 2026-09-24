---

description: "Task list template for feature implementation"
---

# Tasks: Corrigir travamento ao entrar numa campanha vindo de fora

**Input**: Design documents from `/specs/131-corrida-slug-campanha/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [contracts/list-waypoints.md](./contracts/list-waypoints.md)

**Tests**: Correção de UI/carregamento (Constitution II) — validação por `quickstart.md` é suficiente; nenhum teste automatizado é obrigatório.

**Organization**: Uma única user story (P1) — bug com causa raiz já confirmada, sem paralelismo real entre as tarefas (cada uma depende da anterior).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Pode rodar em paralelo (arquivo diferente, sem dependência de tarefa incompleta)
- **[Story]**: US1 (única história desta feature)

## Path Conventions

`frontend/src/` — produção.

---

## Phase 1: Foundational — encadear `slug?` opcional em `campaignApi`

**Purpose**: `campaignApiPrefix(slug?)` já aceita o parâmetro; falta repassá-lo pelos dois pontos intermediários antes que `MapPage` possa usá-lo.

- [X] T001 Adicionar segundo parâmetro opcional `slug?: string` ao helper `p()` em `frontend/src/api/campaign.ts`, repassando pra `campaignApiPrefix(slug)` (mudança aditiva — `p(path)` sem segundo argumento continua funcionando exatamente como hoje)
- [X] T002 Adicionar segundo parâmetro opcional `slug?: string` a `campaignApi.listWaypoints` em `frontend/src/api/campaign.ts`, repassando pra `p('/waypoints', slug)` (depende de T001; mudança aditiva — chamadas existentes sem o segundo argumento continuam idênticas)

**Checkpoint**: `campaignApi.listWaypoints(linkedOnly?, slug?)` pronto pra ser usado com slug explícito; nenhum call site existente quebra.

---

## Phase 2: User Story 1 - Entrar numa campanha vindo de fora sem travar (Priority: P1)

**Goal**: `MapPage` para de depender só do estado de módulo pra essa chamada específica.

**Independent Test**: a partir de `/explorar`, abrir uma campanha e confirmar que o Mapa carrega sem `CAMPAIGN_SLUG_REQUIRED` no console.

### Implementation for User Story 1

- [X] T003 [US1] Em `frontend/src/pages/MapPage.tsx`, no efeito de montagem que chama `campaignApi.listWaypoints(false)` (linhas ~167-169), passar o `slug` já obtido via `useParams<{ slug: string }>()` no topo do componente: `campaignApi.listWaypoints(false, slug)` (depende de T002)

**Checkpoint**: causa raiz corrigida — o call site que lançava `CAMPAIGN_SLUG_REQUIRED` numa montagem vinda de fora agora resolve o slug sem depender da ordem de efeitos entre `CampaignShell` e `MapPage`.

---

## Phase Final: Polish & Validação

- [X] T004 [P] Rodar `cd frontend && npx tsc --noEmit` — confirma que a assinatura nova não quebra nenhum call site existente de `listWaypoints`
- [X] T005 Executar os cenários A–D do `quickstart.md` (Explorar → campanha, Painel → campanha, link direto, regressão de navegação interna)

---

## Dependencies & Execution Order

T001 → T002 → T003 → (T004, T005 em paralelo, depois de T003)

## Notes

- Sem tarefa de teste automatizado formal — Constitution II classifica esta feature como correção de UI/carregamento, não como rota de auth/permissão/migração; a validação é o quickstart manual.
- Escopo intencionalmente pequeno: não inclui `ErrorBoundary` (item separado, ver `BKLG-019`) nem auditoria de outros call sites de `campaignApi` que também dependem do estado de módulo.
