---

description: "Task list template for feature implementation"
---

# Tasks: Assistente de criação de campanha

**Input**: Design documents from `/specs/120-assistente-criacao-campanha/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/wizard-flow.md](./contracts/wizard-flow.md), [contracts/create-api.md](./contracts/create-api.md)

**Tests**: UI-only polish (Constitution II) — sem endpoint novo, sem migração, sem rota de campanha nova. Tests formais NÃO são obrigatórios; a validação é o `quickstart.md` (Fase Polish, abaixo).

**Organization**: Tarefas agrupadas por user story (todas Priority P1 no spec.md, mas sequenciais na prática — US2 e US3 dependem da rota/POST que a US1 cria; ver Dependencies).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Pode rodar em paralelo (arquivo diferente, sem dependência de tarefa incompleta)
- **[Story]**: US1, US2 ou US3 (mapeadas do spec.md)
- Caminhos de arquivo exatos em cada descrição

## Path Conventions

Projeto web existente — `frontend/src/` (produção). `frontend-next/` é só referência visual, não recebe nenhuma tarefa aqui.

---

## Phase 1: Setup

**Purpose**: Rota nova e esqueleto da página, sem lógica ainda.

- [X] T001 Adicionar rota `/painel/novo` em `frontend/src/App.tsx` (import de `NovoCodexPage`, `<Route path="/painel/novo" element={<NovoCodexPage />} />` perto da rota `/painel` existente, linha ~76)
- [X] T002 [P] Criar esqueleto de `frontend/src/pages/NovoCodexPage.tsx` (componente vazio, guarda de auth via `authApi.me()` no mount — falha ou não-autenticado → `navigate('/login?next=/painel/novo')`, sem renderizar o assistente até `ready`)
- [X] T003 [P] Criar `frontend/src/pages/NovoCodexPage.css` vazio, importado por `NovoCodexPage.tsx`

**Checkpoint**: `/painel/novo` abre, redireciona pra login se não autenticado, renderiza vazio se autenticado.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Peças que as três user stories usam — bloqueia até estar pronto.

**⚠️ CRITICAL**: Nenhuma user story começa antes desta fase terminar.

- [X] T004 [P] Criar util compartilhado `frontend/src/utils/slugify.ts` — minúsculas, remove diacríticos (NFD strip), troca `[^a-z0-9]+` por `-`, apara hífens nas pontas (mesma convenção do protótipo, `frontend-next/src/pages/NovoCodexWizard.tsx`)
- [X] T005 Implementar o estado do rascunho (`WizardDraft`: `nome`, `slug`, `slugTouched`, `sistema`, `genero` default `fantasia`, `visibilidade` default `listada`, `step` 0–3, `busy`, `error`, `created`) em `frontend/src/pages/NovoCodexPage.tsx` (depende de T002, T004)
- [X] T006 Implementar o indicador de progresso de 4 passos (Identidade / Sistema e género / Visibilidade / Revisão — estados atual/concluído/futuro) em `frontend/src/pages/NovoCodexPage.tsx` + `frontend/src/pages/NovoCodexPage.css`, referência visual `frontend-next/src/pages/NovoCodexWizard.tsx` e `.css`

**Checkpoint**: Estado e indicador de passos prontos — as user stories a seguir só preenchem o conteúdo de cada passo.

---

## Phase 3: User Story 1 - Assistente em `/painel/novo` (Priority: P1) 🎯 MVP

**Goal**: os 4 passos completos, pré-visualização ao vivo do gênero, criação via API existente, ecrã de sucesso.

**Independent Test**: autenticado, abrir `/painel/novo`, percorrer os 4 passos, criar, ver sucesso, abrir campanha e voltar ao painel — comparar com `NovoCodexWizard.tsx` passo a passo.

### Implementation for User Story 1

- [X] T007 [US1] Passo 0 "Identidade" em `frontend/src/pages/NovoCodexPage.tsx`: campos nome/slug; `slug` auto-preenchido por `slugify(nome)` enquanto `slugTouched === false`; editar o slug marca `slugTouched`; aviso de imutabilidade abaixo do campo; "Continuar" habilitado só com `nome.trim().length > 1 && slug.trim().length > 1`; "Cancelar" volta pra `/painel` sem criar nada (depende de T005)
- [X] T008 [US1] Passo 1 "Sistema e género" em `frontend/src/pages/NovoCodexPage.tsx`: grade de cards de gênero (usa `GENRES` de `frontend/src/theme/genres.ts`, swatch + label); selecionar um card chama `applyCampaignGenre(genero)` (`frontend/src/theme/campaignGenre.ts`) pra re-skinar a tela do assistente ao vivo; campo `sistema` com `<datalist>` a partir de `GENRES.find(g => g.id === genero).suggestedSystems`; "Continuar" exige `sistema.trim().length > 1` (depende de T007)
- [X] T009 [US1] Passo 2 "Visibilidade" em `frontend/src/pages/NovoCodexPage.tsx`: seletor `listada` (default) vs `so_link`; "Continuar" sempre habilitado (depende de T008)
- [X] T010 [US1] Passo 3 "Revisão" em `frontend/src/pages/NovoCodexPage.tsx`: resumo somente-leitura do rascunho; botão "Criar" chama `campanhasApi.criar({ nome, slug, sistema, genero, visibilidade })` (sem `resumo` — API não aceita), `busy` durante a chamada, erro da API mapeado pra mensagem i18n sem avançar pro sucesso (depende de T009)
- [X] T011 [US1] Ecrã de sucesso em `frontend/src/pages/NovoCodexPage.tsx`: ao POST OK, `created = { slug, nome }` (usar o `slug` da **resposta** da API, não o do rascunho); botões "Abrir campanha" (`Link to={`/c/${created.slug}`}`) e "Ir para o painel" (`Link to="/painel"`) (depende de T010)
- [X] T012 [US1] Limpar `data-genre` ao sair do assistente em `frontend/src/pages/NovoCodexPage.tsx`: `clearCampaignGenre()` (ou restaurar o valor anterior) no unmount, pra não vazar o tema de pré-visualização pro resto do app (depende de T008)
- [X] T013 [P] [US1] Chaves de i18n do assistente (rótulos dos 4 passos, hints, aviso de slug imutável, dica de pré-visualização de gênero, textos de visibilidade, resumo da revisão, sucesso, botões) em `frontend/src/locales/pt-BR/comum.json` e `frontend/src/locales/en/comum.json`, sob `painel.wizard.*` — reaproveitar `painel.genre_*` já existentes pros rótulos de gênero, não duplicar
- [X] T014 [US1] Estilo de `frontend/src/pages/NovoCodexPage.css` batendo com `frontend-next/src/pages/NovoCodexWizard.css` (cartão centrado, grade de gênero 2×2, campos e botões em pílula via tokens) (depende de T006–T011)

**Checkpoint**: `/painel/novo` funciona ponta a ponta, sozinho — MVP entregável aqui.

---

## Phase 4: User Story 2 - Entrada a partir do Painel (Priority: P1)

**Goal**: o CTA do Painel leva pro assistente; o formulário embutido deixa de ser o caminho principal.

**Independent Test**: em `/painel`, clicar "Criar novo codex" → URL vira `/painel/novo`; cancelar no passo 1 volta pro painel.

### Implementation for User Story 2

- [X] T015 [US2] Trocar o botão "Criar novo codex" (`painel.createCta`, `frontend/src/pages/PainelPage.tsx` ~linha 208) de abrir/focar o formulário inline pra `<Link to="/painel/novo">` (ou `navigate`) (depende de: Phase 3 completa — precisa da rota existir de verdade)
- [X] T016 [US2] Remover o formulário de criação embutido de `frontend/src/pages/PainelPage.tsx`: fieldset `painel-page__create`/`painel-page__genres` (~linhas 307–337), handler `onCreate` (~linha 85) e o estado `nome`/`slug`/`sistema`/`genero`/`visibilidade` que só ele usava (depende de T015)
- [X] T017 [P] [US2] Remover do `frontend/src/pages/PainelPage.css` as classes que só serviam ao formulário inline removido (`.painel-page__create`, `.painel-page__genres` e afins), mantendo intactos os estilos de listagem/cota/import (depende de T016)

**Checkpoint**: Painel não tem mais formulário de criação embutido; tudo passa pelo assistente.

---

## Phase 5: User Story 3 - Campanha real nas listagens (Priority: P1)

**Goal**: confirmar que a campanha criada pelo assistente aparece de verdade em `/painel` e `/explorar`, sem regressão — o contrato de API não mudou, então o "trabalho" aqui é garantir que o assistente usa a resposta real da API, não o rascunho local.

**Independent Test**: criar listada → aparece em painel e explorar; criar só por link → aparece só no painel.

### Implementation for User Story 3

- [X] T018 [US3] Revisar `frontend/src/pages/NovoCodexPage.tsx`: confirmar que nenhuma tela do assistente (inclusive o sucesso, T011) lê de `campanhasApi.catalogo()`/`minhas()` com cache otimista — as listagens devem vir da chamada real dessas telas quando o mestre navegar até elas, não de um estado local do assistente (depende de T011; sem código novo esperado se T011 já usa a resposta da API corretamente — esta tarefa é a verificação explícita do critério-chave SC-002)

**Checkpoint**: as três user stories funcionam juntas, ponta a ponta.

---

## Phase Final: Polish & Cross-Cutting Concerns

**Purpose**: validação manual (quickstart) e conferência visual — sem código novo de produto.

- [X] T019 [P] Rodar `cd frontend && npx tsc --noEmit` — zero erro de tipo
- [ ] T020 Executar `quickstart.md` cenário A (happy path, listada): login → Painel → Criar → 4 passos → sucesso → Abrir → `/c/:slug`; confirmar campanha em `/painel` e `/explorar`
- [ ] T021 Executar `quickstart.md` cenário B (só por link): mesma sequência com visibilidade "só por link"; confirmar que aparece em `/painel` mas **não** no catálogo público de `/explorar`
- [ ] T022 Executar `quickstart.md` cenário C (cancelar / não-autenticado): cancelar no passo 1 volta pro painel sem criar; sessão limpa + `/painel/novo` redireciona pro login com `next=/painel/novo`
- [ ] T023 Executar `quickstart.md` cenário D (erros): slug já usado mostra erro sem sucesso falso; falha de rede no POST mantém no assistente com erro
- [ ] T024 [P] Capturas de cada passo (0–3 + sucesso), claro/escuro, pelo menos 2 gêneros — lado a lado com `frontend-next/src/pages/NovoCodexWizard.tsx`, validando SC-001 e SC-004

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: sem dependências — pode começar já
- **Foundational (Phase 2)**: depende do Setup — bloqueia as três user stories
- **US1 (Phase 3)**: depende só do Foundational — é o MVP, pode ir a produção sozinha
- **US2 (Phase 4)**: depende da **US1 estar completa** (o CTA precisa de uma rota `/painel/novo` funcional pra apontar) — não é independente de verdade, apesar de marcada P1 no spec.md
- **US3 (Phase 5)**: depende da **US1 estar completa** (precisa do POST e do ecrã de sucesso existirem pra verificar a resposta real da API)
- **Polish (Final)**: depende de US1 + US2 + US3

### Parallel Opportunities

- T002 e T003 (Setup) em paralelo
- T004 (slugify) em paralelo com T002/T003
- T013 (i18n) em paralelo com T007–T012 (arquivos diferentes)
- T017 (CSS do Painel) em paralelo, depois de T016
- T019 e T024 (Polish) em paralelo com T020–T023

---

## Implementation Strategy

### MVP primeiro (User Story 1 sozinha)

1. Phase 1 (Setup) → Phase 2 (Foundational) → Phase 3 (US1)
2. **Parar e validar**: `/painel/novo` funciona sozinho, mesmo com o Painel ainda tendo o formulário antigo lado a lado
3. Só depois: Phase 4 (US2, troca o CTA e remove o formulário antigo) → Phase 5 (US3, verificação) → Polish

### Entrega incremental

1. Setup + Foundational → base pronta
2. US1 → assistente funcional, ainda convivendo com o formulário antigo do Painel (nada quebra)
3. US2 → formulário antigo sai, CTA aponta pro assistente
4. US3 → confirmação de que nada regrediu nas listagens
5. Polish → `tsc`, quickstart completo, capturas comparativas

---

## Notes

- Todas as três user stories são P1 no spec.md, mas **não são independentes na prática** — US2 e US3 dependem da US1 existir. A ordem acima (US1 → US2 → US3) é a única sequência segura, apesar da prioridade nominal igual.
- Sem tarefa de teste automatizado formal: Constitution II classifica esta feature como "UI de polimento" (sem endpoint novo, sem isolamento, sem migração) — a validação é o quickstart manual (Phase Final).
- `frontend-next/` nunca recebe tarefa — é só referência lida, nunca escrita, nas tarefas acima.
- Commitar depois de cada tarefa ou grupo lógico; parar em cada checkpoint pra validar a story isoladamente antes de seguir.
