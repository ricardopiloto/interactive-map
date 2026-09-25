# Tasks: Tema claro e escuro em todos os gêneros

**Input**: Design documents from `/specs/150-tema-claro-escuro-universal/`

**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `quickstart.md`

**Tests**: Incluir E2Es focados porque o plano prevê ampliar a cobertura antes de implementar a mudança transversal de tema. Não executar a suite completa para cada alteração; validar as jornadas de tema afetadas.

**Organization**: Tarefas agrupadas por história para entregar a seleção explícita primeiro e o modo automático em seguida.

## Phase 1: Setup

**Purpose**: Reaproveitar a estrutura existente; frontend, Playwright e verificador de contraste já estão configurados. Nenhuma dependência ou diretório novo é necessário.

Nenhuma tarefa de setup.

---

## Phase 2: Foundational

**Purpose**: Permitir que os E2Es exercitem gêneros diferentes usando a campanha de teste existente.

- [X] T001 Adicionar em `frontend/e2e/helpers.ts` um helper Playwright que intercepte a resposta de configuração da campanha e substitua somente `genero`, preservando os demais campos da fixture.

**Checkpoint**: Os testes podem variar o gênero sem semear quatro campanhas nem alterar dados persistidos.

---

## Phase 3: User Story 1 - Escolher claro ou escuro em qualquer campanha (Priority: P1) 🎯 MVP

**Goal**: Permitir Claro e Escuro nos quatro gêneros mantendo a identidade visual de cada um e a preferência local explícita.

**Independent Test**: Executar os E2Es focados do seletor e confirmar que, em Fantasia, Gótico, Sci-Fi e Urbano, Claro/Escuro são aplicados após seleção e recarga, sem mudar `data-genre` nem o valor local salvo.

### Tests for User Story 1

- [X] T002 [US1] Ampliar `frontend/e2e/theme-selector-menu.spec.ts` para exercitar Claro e Escuro nos quatro gêneros via helper de `frontend/e2e/helpers.ts`, validar o modo efetivo após recarga e confirmar que a preferência continua isolada em dois contextos de navegador.

### Implementation for User Story 1

- [X] T003 [US1] Remover a restrição por `supportsLight` e a aplicação de `data-genre-forced-dark` em `frontend/src/theme/genres.ts` e `frontend/src/theme/campaignGenre.ts`; aplicar/restaurar a preferência existente em todos os gêneros e retirar o tratamento de preview obsoleto em `frontend/src/pages/NovoCodexPage.tsx`.
- [X] T004 [P] [US1] Criar variantes claras para Gótico, Sci-Fi e Urbano em `frontend/src/styles/tokens.css`, incluindo fundos, superfícies, textos, bordas e acentos que preservem a identidade cromática de cada gênero.
- [X] T005 [US1] Ampliar `frontend/scripts/check-contrast.mjs` para validar combinações claro/escuro dos quatro gêneros nos pares de texto, superfície, acento, borda e vínculo definidos pelo gate atual.

**Checkpoint**: A história 1 funciona sem alteração de API, preferência persistida, dados da campanha ou paleta escura existente.

---

## Phase 4: User Story 2 - Usar o modo automático (Priority: P2)

**Goal**: Fazer Auto acompanhar a preferência atual do dispositivo em todos os gêneros, mantendo Claro e Escuro explícitos estáveis.

**Independent Test**: Com Auto selecionado, emular mudança do sistema entre claro e escuro em cada gênero e confirmar atualização imediata; com escolha explícita, confirmar que a mudança do sistema não altera o modo.

### Tests for User Story 2

- [X] T006 [US2] Ampliar `frontend/e2e/theme-selector-trigger.spec.ts` para verificar Auto com `page.emulateMedia` nos quatro gêneros, persistência de `auto` após recarga e estabilidade de Claro/Escuro quando o esquema do dispositivo muda.

**Checkpoint**: Auto acompanha o sistema em qualquer campanha; preferências explícitas permanecem estáveis e locais.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Registrar e executar apenas as validações relevantes à feature.

- [X] T007 Atualizar `specs/150-tema-claro-escuro-universal/quickstart.md` com a matriz final e executar os E2Es focados `theme-selector-menu.spec.ts` e `theme-selector-trigger.spec.ts`, `npm run test:contrast` e `npm run build` em `frontend/`; registrar resultados e limitações no próprio quickstart.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: sem alterações; toolchain e estrutura já existem.
- **Foundational (Phase 2)**: T001 prepara a variação de gênero reutilizada pelos testes.
- **User Story 1 (Phase 3)**: depende de T001; T002 deve preceder as alterações de implementação para evidenciar os casos ausentes.
- **User Story 2 (Phase 4)**: depende de US1, pois Auto só pode ser validado nos gêneros após retirar a restrição de modo claro e criar as paletas correspondentes.
- **Polish (Phase 5)**: depende das duas histórias; usa apenas E2Es focados, contraste e build, sem rodar toda a suite Playwright.

### User Story Dependencies

- **US1 (P1)**: inicia após T001; entrega o MVP e não depende de outra história.
- **US2 (P2)**: inicia depois de US1 para validar Auto nas variantes completas dos quatro gêneros.

### Within Each User Story

- T002 é a cobertura E2E que deve falhar antes da mudança de comportamento.
- T003 e T004 alteram arquivos distintos e podem ocorrer em paralelo depois de T002; T005 depende da definição das novas cores em T004.
- T006 valida o comportamento Auto depois que US1 estiver integrada.

## Parallel Opportunities

- Após T002, T003 (resolução de gênero/preferência) e T004 (tokens CSS) podem ser feitos em paralelo por tocarem arquivos distintos.
- T005 depende de T004 para aferir os valores de contraste escolhidos.
- Não executar E2Es em paralelo contra o mesmo ambiente/diretório de dados compartilhados; o Playwright do projeto está configurado com um worker.

### Parallel Example: User Story 1

```text
Após T002 falhar pelos casos novos:
- T003 atualizar genres.ts, campaignGenre.ts e NovoCodexPage.tsx
- T004 criar variantes claras em tokens.css
Depois de T004:
- T005 ampliar o gate de contraste
```

## Implementation Strategy

### MVP First (User Story 1)

1. Criar a fixture reutilizável de gênero (T001).
2. Escrever e executar os casos E2E de seleção explícita (T002).
3. Remover a restrição por gênero e criar as paletas claras (T003–T005).
4. Validar US1 com os E2Es focados da história e contraste.

### Incremental Delivery

1. Entregar Claro/Escuro nos quatro gêneros com paletas legíveis (US1).
2. Validar a reação de Auto às mudanças do sistema em todos os gêneros (US2).
3. Executar os E2Es de tema, o gate de contraste e o build, escolhendo a suite ampla somente para marco de risco elevado ou CI.

## Notes

- Todos os itens executáveis seguem `- [ ] TNNN [P?] [US?] descrição com caminho`.
- Não há tarefas de backend, migração, contrato/API ou novas dependências.
- A suite completa Playwright não é requisito para cada alteração; os dois specs de tema cobrem as jornadas desta feature.
