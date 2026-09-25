# Tasks: Otimizar a execução dos testes

**Input**: Design documents from `/specs/152-perfil-rapido-testes/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md, contracts/test-profiles.md

**Tests**: Não há novos testes de produto nesta feature. As tarefas executam e preservam as suítes existentes; qualquer teste de segurança/dados já obrigatório continua no fluxo completo.

**Organization**: Tarefas agrupadas pelas histórias de usuário; o baseline compartilhado vem antes das mudanças.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Preparar registro comparável para linha de base, ambiente e inventário das suítes.

- [X] T001 Criar `docs/test-performance.md` com campos para ambiente de referência, comandos, inventário de testes, cinco medições aquecidas e mediana por suíte/etapa.
- [X] T002 Registrar em `docs/test-performance.md` os comandos existentes para pytest, build, lint, contraste, seed E2E e Playwright desktop/mobile, indicando os gates completos de segurança e dados.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Medir o estado atual antes de escolher otimizações ou selecionar o perfil rápido.

- [ ] T003 Executar e registrar em `docs/test-performance.md` cinco medições aquecidas da suíte pytest completa, do build/lint/contraste frontend e do Playwright completo; documentar versões de ferramentas e condições do ambiente. **Parcial:** pytest/frontend medidos 5x; pytest passou após as correções; Playwright teve uma execução ampla interrompida e fluxos focados, sem cinco medições confiáveis.
- [ ] T004 Medir separadamente seed E2E, inicialização/readiness do backend, build/preview e execução Playwright com serviços já prontos; identificar os maiores custos e riscos de repetição em `docs/test-performance.md`. **Parcial:** seed/build medidos; preview bloqueado no bind localhost e casos E2E não isolados.

**Checkpoint**: baseline revisável por etapa; perfil rápido e otimizações podem ser definidos sem adivinhar o gargalo.

---

## Phase 3: User Story 1 - Obter feedback rápido durante o desenvolvimento (Priority: P1) 🎯 MVP

**Goal**: Oferecer um comando local claro, rápido, com falha confiável e escopo documentado.

**Independent Test**: Com dependências e fixtures preparadas, executar o perfil cinco vezes após aquecimento; confirmar mediana de até dois minutos, código de falha quando uma etapa falhar e lista explícita do que o perfil não cobre.

### Implementation for User Story 1

- [X] T005 [US1] Definir no contrato `specs/152-perfil-rapido-testes/contracts/test-profiles.md` a seleção de testes de alto sinal para o perfil rápido com base no baseline, incluindo pré-requisitos, suites omitidas e comandos completos necessários antes de integração/entrega.
- [X] T006 [US1] Implementar `scripts/test-fast.sh` para executar a seleção aprovada, validar pré-requisitos sem instalar dependências, rebuildar ou reseedar a cada chamada, medir/distinguir etapas e retornar código diferente de zero com o passo que falhou.
- [X] T007 [P] [US1] Documentar a invocação e as exclusões do perfil rápido em `README.md`, `backend/README.md` e `frontend/README.md`, preservando as instruções das suítes completas.
- [X] T008 [US1] Validar em `docs/test-performance.md` cinco execuções aquecidas do perfil rápido e registrar mediana, condições, saída de falha induzida e discrepâncias contra a meta de dois minutos.

**Checkpoint**: perfil local utilizável sem mascarar testes/gates omitidos.

---

## Phase 4: User Story 2 - Medir e otimizar as suítes completas (Priority: P1)

**Goal**: Diminuir a espera recorrente e tornar gargalos/erros diagnosticáveis, mantendo todos os cenários e gates completos.

**Independent Test**: Rodar os comandos completos após a otimização, comparar inventário de testes e gates com o baseline e confirmar redução mediana de 25% nas suítes recorrentes otimizadas; documentar qualquer meta tecnicamente inalcançável com evidência.

### Implementation for User Story 2

- [ ] T009 [US2] Otimizar em `backend/tests/conftest.py` a etapa de setup que o baseline identificar como dominante, preservando isolamento de bancos/usuários por teste e sem ampliar escopo de fixture sem comprovação de segurança.
- [ ] T010 [US2] Otimizar em `frontend/playwright.config.ts` e `frontend/e2e/seed_e2e.py` a inicialização/build/seed que o baseline identificar como dominante, mantendo um fluxo completo reproduzível em ambiente limpo e fazendo erros de seed falharem com diagnóstico claro.
- [ ] T011 [US2] Ajustar em `frontend/playwright.config.ts` limites de readiness e em `backend/tests/conftest.py` ou nos testes focados os timeouts de interação/setup comprovadamente excessivos, separando falha de serviço, falha de teste e operação lenta legítima.
- [X] T012 [US2] Avaliar paralelização segura em `frontend/playwright.config.ts`; somente aumentar workers se bancos, DATA_DIR, usuários, sessões e portas forem isolados por worker e as execuções repetidas forem estáveis; caso contrário, manter um worker e registrar a razão em `docs/test-performance.md`.
- [ ] T013 [US2] Executar os fluxos completos backend, frontend e Playwright em `backend/` e `frontend/`; comparar inventário de testes, gates de autenticação/permissões/migração/import-export/isolamento e resultados com o baseline em `docs/test-performance.md`. **Parcial:** pytest completo passou 5x após corrigir os oito problemas do baseline; build/lint/contraste passaram; Playwright amplo foi interrompido após 30 casos aprovados e problemas de qualidade; fluxos focados de arco/marcador passaram.
- [ ] T014 [US2] Repetir cinco medições aquecidas das suítes recorrentes otimizadas e atualizar `docs/test-performance.md` com as medianas finais, redução percentual e explicação baseada em evidência para qualquer meta não alcançada.

**Checkpoint**: comandos completos seguem verdes e executáveis; otimizações não removem cenários ou enfraquecem isolamento.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Consolidar instruções e executar a validação ponta a ponta documentada.

- [X] T015 Atualizar `specs/152-perfil-rapido-testes/contracts/test-profiles.md` e `specs/152-perfil-rapido-testes/quickstart.md` com comandos finais, pré-requisitos, gates omitidos pelo perfil rápido e tempos medidos.
- [X] T016 Revisar `README.md`, `backend/README.md`, `frontend/README.md` e `docs/test-performance.md` para remover comandos conflitantes e confirmar que os fluxos rápido/completos são distinguíveis.
- [ ] T017 Executar os cenários de `specs/152-perfil-rapido-testes/quickstart.md` e registrar o resultado final em `docs/test-performance.md`.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: sem dependência; cria inventário e formulário de medição.
- **Foundational (Phase 2)**: depende do inventário; é bloqueante para selecionar o perfil rápido e para escolher gargalos de otimização.
- **User Story 1 (Phase 3)**: depende do baseline. Entrega o perfil rápido MVP.
- **User Story 2 (Phase 4)**: depende do baseline e do perfil MVP; otimiza apenas os gargalos medidos e valida as suítes completas.
- **Polish (Phase 5)**: depende das duas histórias desejadas; consolida documentação e quickstart.

### User Story Dependencies

- **US1 (P1)**: depende de Setup e Foundational para a seleção ter base medida; pode ser validada independentemente depois disso.
- **US2 (P1)**: depende de Setup e Foundational; deve vir após US1 para evitar conflito nos arquivos de configuração usados pelo perfil rápido.

### Within Each User Story

- A seleção e os limites do perfil são definidos antes de implementar o invocador.
- Documentação do perfil pode ser escrita em paralelo à implementação após T005 fechar o contrato.
- Otimizações de backend e frontend preservam comandos e fixtures completos; timeouts e workers só mudam com evidência.

## Parallel Opportunities

- **T007** pode ocorrer em paralelo com **T006** após **T005**, pois altera apenas documentação.
- Em **US2**, inspeções adicionais e medições que não alterem os mesmos arquivos podem ocorrer em paralelo; alterações em `frontend/playwright.config.ts` ficam serializadas entre T010 e T011/T012.
- Não executar testes E2E concorrentes contra o mesmo `DATA_DIR` ou campanhas compartilhadas.

### Parallel Example: User Story 1

```text
Depois de T005:
- T006 implementar scripts/test-fast.sh
- T007 documentar perfil em README.md, backend/README.md e frontend/README.md
```

---

## Implementation Strategy

### MVP First (User Story 1)

1. Completar Setup e medir o baseline completo.
2. Definir escopo e omissões do perfil rápido a partir das medições.
3. Implementar e documentar o comando rápido.
4. Confirmar cinco execuções aquecidas, a meta de duração e o comportamento de falha.
5. Preservar os comandos completos antes de iniciar otimizações mais amplas.

### Incremental Delivery

1. Baseline reproduzível e inventário de gates.
2. Perfil rápido MVP, documentado como parcial.
3. Otimizações guiadas por custo medido.
4. Execução integral e comparação de cobertura/inventário.
5. Medição final e documentação das metas atingidas ou limites demonstrados.

## Notes

- Todas as tarefas seguem `- [ ] TNNN`, com `[P]` apenas para trabalho em arquivos independentes e `[US1]`/`[US2]` nas fases de história.
- Nenhuma tarefa adiciona testes de produto; as suítes existentes são executadas e preservadas como parte da implementação de tooling.
- Não elevar workers nem compartilhar fixtures sem provar isolamento e estabilidade.
