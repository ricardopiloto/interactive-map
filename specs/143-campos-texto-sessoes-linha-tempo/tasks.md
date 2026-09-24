# Tasks: Campos de texto padronizados em Sessões e Linha do Tempo

**Input**: Design documents from `specs/143-campos-texto-sessoes-linha-tempo/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [quickstart.md](./quickstart.md)

**Tests**: A spec é polimento visual; não foram solicitados testes automatizados. A validação é visual/manual e de build conforme `quickstart.md`.

**Organization**: Foundation extrai o estilo de referência e prepara o editor Markdown; cada história aplica o estilo aos campos de uma tela.

## Phase 1: Setup

**Purpose**: O frontend e os componentes compartilhados já existem; não há inicialização nem dependências a adicionar.

**Tasks**: Nenhuma.

---

## Phase 2: Foundational

**Purpose**: Definir uma única fonte visual fiel aos campos de texto usados na criação de Novo Codex e permitir aplicá-la ao textarea Markdown sem alterar outros usos.

- [X] T001 [P] Em `frontend/src/components/ui/ui.css`, criar uma variante de campo com altura mínima de 44 px, padding de 10 px por 12 px, borda sutil, raio médio, fundo de superfície secundária, tipografia herdada e outline de foco de 2 px com deslocamento de 2 px; aplicar a variante aos campos de texto da criação de Novo Codex em `frontend/src/pages/NovoCodexPage.tsx` e remover a regra local duplicada de `frontend/src/pages/NovoCodexPage.css`, sem mudança visual no wizard.
- [X] T002 [P] Em `frontend/src/components/forms/MarkdownField.tsx`, aceitar uma classe visual opcional e aplicá-la somente ao `Textarea` da aba de escrita, mantendo por padrão os estilos e comportamento atuais dos demais formulários.

**Checkpoint**: Novo Codex usa a variante compartilhada sem mudança de aparência; MarkdownField permite aplicar a variante apenas onde solicitado.

---

## Phase 3: User Story 1 - Preencher campos de texto de uma Sessão (Priority: P1) 🎯 MVP

**Goal**: Aplicar o modelo visual de Novo Codex a título, rótulo de data e resumo Markdown no formulário de Sessões, preservando criação/edição.

**Independent Test**: Abrir criação e edição de Sessão; comparar título, rótulo e área de escrita do resumo com Novo Codex em estados normal/foco e prévia; salvar e confirmar que valores continuam corretos.

### Implementation for User Story 1

- [X] T003 [P] [US1] Em `frontend/src/pages/SessoesPage.tsx`, aplicar a variante compartilhada aos campos de título e rótulo de data e passar a classe visual de Novo Codex ao `MarkdownField` de resumo; manter labels, handlers, validação, payload, abas e prévia existentes.

**Checkpoint**: Campos textuais de Sessões correspondem visualmente aos campos de Novo Codex sem mudar dados ou comportamento.

---

## Phase 4: User Story 2 - Preencher campos de texto de um evento da Linha do Tempo (Priority: P1)

**Goal**: Aplicar o modelo visual de Novo Codex a título, rótulo de era e descrição Markdown no formulário de evento.

**Independent Test**: Abrir criação e edição de Evento; comparar título, era e área de escrita da descrição com Novo Codex em estados normal/foco e prévia; salvar e confirmar que os valores permanecem corretos.

### Implementation for User Story 2

- [X] T004 [P] [US2] Em `frontend/src/pages/LinhaTempoPage.tsx`, aplicar a variante compartilhada aos campos de título e rótulo de era e passar a classe visual de Novo Codex ao `MarkdownField` da descrição; manter labels, handlers, validação, payload, abas e prévia existentes.

**Checkpoint**: Campos textuais da Linha do Tempo correspondem visualmente aos campos de Novo Codex sem mudar dados ou comportamento.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Confirmar paridade visual de ambos os formulários e ausência de regressões nos demais controles.

- [X] T005 Percorrer `specs/143-campos-texto-sessoes-linha-tempo/quickstart.md`, cobrindo criação/edição, comparação lado a lado com Novo Codex, temas claro/escuro, viewport estreita, Markdown e controles excluídos; executar `npm run build` em `frontend/`. `npm run build` confirmado limpo (tsc + vite, só aviso de tamanho de chunk). Passeio visual/interativo (login de mestre) não executado ao vivo nesta verificação — confirmado por revisão de código: `ui-input--new-codex` (44px, padding 10/12px, borda sutil, raio médio, fundo `--color-surface-2`, outline de foco 2px/2px) aplicada consistentemente em `NovoCodexPage.tsx`, `SessoesPage.tsx` e `LinhaTempoPage.tsx`; `MarkdownField`'s `controlClassName` corretamente repassado nos três lugares.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Sem tarefas; a infraestrutura existente é suficiente.
- **Foundational (Phase 2)**: T001 e T002 podem ocorrer em paralelo; ambas devem terminar antes das histórias.
- **User Stories (Phase 3–4)**: US1 e US2 podem ser implementadas em paralelo após a Foundation, pois alteram páginas distintas.
- **Polish (Phase 5)**: T005 depende de T003 e T004.

### User Story Dependencies

- **US1 (P1)**: Independente após T001 e T002; entrega a padronização do formulário de Sessões.
- **US2 (P1)**: Independente após T001 e T002; entrega a padronização do formulário da Linha do Tempo.

### Parallel Opportunities

- T001 e T002 alteram arquivos separados e podem ser executadas em paralelo.
- T003 e T004 alteram páginas separadas e podem ser executadas em paralelo após a Foundation.

## Parallel Example: Foundation

```text
Task T001: extrair estilo dos campos de Novo Codex em ui.css e migrar NovoCodexPage
Task T002: adicionar classe visual opcional ao textarea do MarkdownField
```

## Parallel Example: User Stories 1 and 2

```text
Task T003: aplicar o estilo de Novo Codex ao formulário em frontend/src/pages/SessoesPage.tsx
Task T004: aplicar o estilo de Novo Codex ao formulário em frontend/src/pages/LinhaTempoPage.tsx
```

## Implementation Strategy

### MVP First

1. Completar T001 e T002 para preparar o estilo reutilizável e o editor Markdown.
2. Completar T003 para entregar o formulário de Sessões alinhado ao modelo Novo Codex.
3. Validar a US1 com o roteiro manual em `quickstart.md`.

### Incremental Delivery

1. Implementar Foundation para centralizar o modelo de campo de Novo Codex.
2. Aplicar a variante à US1 e à US2, em qualquer ordem ou em paralelo.
3. Executar T005 para comparar os três formulários e verificar build.

## Notes

- `[P]` indica tarefas em arquivos distintos sem dependência entre si; tarefas de histórias usam `[US1]` e `[US2]`.
- Nenhuma alteração em APIs, dados, backend, copy ou validação é prevista.
- A prévia Markdown, campos numéricos, seletores, checkboxes e layout externo permanecem fora do escopo.
- T005: `npm run build` passou; a conferência visual em navegador permanece pendente porque não há navegador disponível nesta sessão.
