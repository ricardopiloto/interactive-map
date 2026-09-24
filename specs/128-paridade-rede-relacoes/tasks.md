---
description: "Tarefas para reconciliar critérios de privacidade, visualização e fluxos da Rede de Relações"
---

# Tasks: Auditoria de paridade da Rede de Relações

**Input**: Design documents from `/specs/128-paridade-rede-relacoes/`

**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/relationship-visual-contract.md`, `parity-matrix.md`, `quickstart.md`

**Tests**: Cobrir a projeção pública de privacidade antes de qualquer mudança nela; acrescentar testes Playwright para evidências visuais e regressão dos fluxos atuais antes de alterar a interface.

**Organization**: Tarefas agrupadas pelas quatro histórias. O painel flutuante e o modelo de interação desta branch são invariantes; mudanças ficam limitadas a critérios comprovadamente perdidos e à documentação de paridade.

## Phase 1: Setup

**Purpose**: Frontend, backend, dados de vínculo, APIs e infraestrutura de teste já existem; nenhuma dependência, rota ou migração é necessária.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Completar a matriz rastreável de critérios e estabelecer testes de privacidade antes das correções.

- [ ] T001 Completar a matriz com todos os critérios aplicáveis do manual, specs 068/071/073/081/086–089/105/116 e comparação de `main`, classificando cada um como preservado, divergência intencional ou gap em `specs/128-paridade-rede-relacoes/parity-matrix.md`

---

## Phase 3: User Story 1 - GM distingue vínculos privados e sentidos secretos (Priority: P1) 🎯 MVP

**Goal**: GM identifica privacidade e sentido não conhecido no grafo e no detalhe; jogador recebe somente dados permitidos e não infere conteúdo secreto.

**Independent Test**: Para mesmo conjunto de vínculos, GM identifica par privado e extremo secreto sem abrir edição; jogador não recebe nem vê par privado, marcador secreto, tipo, qualificador, nota ou detalhe desconhecido.

### Tests for User Story 1

- [ ] T002 [P] [US1] Adicionar testes de endpoint para par privado omitido, vínculo de personagem oculto omitido e redação de tipo/qualificador/nota do sentido não conhecido, preservando o sentido conhecido, em `backend/tests/test_visibility_relacoes.py`
- [ ] T003 [P] [US1] Criar cenários Playwright comparando GM e jogador para vínculo público/privado e par de duas vias parcialmente conhecido, incluindo inspeção do grafo, detalhe e controles de filtro em `frontend/e2e/relacoes-privacy.spec.ts`

### Implementation for User Story 1

- [ ] T004 [US1] Exibir pistas visuais e acessíveis exclusivas ao GM para vínculo privado e sentido não conhecido, junto à aresta/extremo e nos detalhes, sem expor esses estados ao jogador em `frontend/src/components/relacoes/GraphStage.tsx` e `frontend/src/pages/RelacoesPage.tsx`
- [ ] T005 [US1] Adicionar traduções pt-BR/en para marcadores, ajuda e nomes acessíveis de privacidade/sentido secreto em `frontend/src/locales/pt-BR/relacoes.json` e `frontend/src/locales/en/relacoes.json`

**Checkpoint**: Privacidade pública continua imposta pela resposta do servidor e a interface GM distingue os estados sem qualquer indício secreto na vista de jogador.

---

## Phase 4: User Story 2 - Usuário interpreta o grafo com linhas e cores legíveis (Priority: P1)

**Goal**: Arestas são retas; direção e perspectivas não se invertem; oito tipos são distinguíveis em ambos temas por cor e pistas redundantes.

**Independent Test**: Em claro/escuro e grafo denso, identificar 8/8 tipos pelo conjunto de cor, padrão e texto; verificar segmentos retos, orientação A→B/B→A, gradiente/rótulos de duas vias e amostras de chip iguais ao traço do palco.

### Tests for User Story 2

- [ ] T006 [P] [US2] Criar cenários Playwright para segmentos SVG retos, direção das duas orientações, tipos e qualificadores por extremo, oito amostras no filtro, temas claro/escuro e densidade de arestas em `frontend/e2e/relacoes-visual.spec.ts`

### Implementation for User Story 2

- [ ] T007 [US2] Substituir caminhos quadráticos e hit areas curvos por segmentos SVG retos; preservar o alvo de clique, hover/foco, labels existentes e desenhar a direção correta para A→B e B→A em `frontend/src/components/relacoes/GraphStage.tsx` e `frontend/src/components/relacoes/vinculoDirection.ts`
- [ ] T008 [US2] Atribuir cores distintas a cada um dos oito tipos nos dois temas usando aliases de tipo existentes, preservar padrões/espessuras como pistas redundantes e alinhar helpers de estilo em `frontend/src/styles/tokens.css` e `frontend/src/components/relacoes/vinculoStyles.ts`
- [ ] T009 [US2] Substituir swatches circulares dos filtros por amostras de traço que correspondam à cor e padrão de cada tipo, mantendo nome textual e interação dos filtros em `frontend/src/pages/RelacoesPage.tsx` e `frontend/src/pages/RelacoesPage.css`

**Checkpoint**: Todas as arestas usam segmentos retos; sentidos e tipos permanecem associados; cores, padrões e amostras são legíveis nos dois temas.

---

## Phase 5: User Story 3 - PJ e NPC mantêm posicionamento compreensível no palco (Priority: P1)

**Goal**: Visão geral e foco radial continuam legíveis em relação à área útil do grafo, sem nós essenciais encobertos pelo painel flutuante.

**Independent Test**: Com PJ/NPC mistos, somente um grupo, grafo vazio e alta densidade, verificar overview e foco em desktop/mobile com painel recolhido/expandido; selecionar personagem, localizar vizinhos e reenquadrar com zoom.

### Tests for User Story 3

- [ ] T010 [P] [US3] Criar cenários Playwright para posições overview/foco, viewport desktop/mobile, estados do painel, densidades e casos sem PJ/NPC/vínculos em `frontend/e2e/relacoes-layout.spec.ts`

### Implementation for User Story 3

- [ ] T011 [US3] Corrigir centro/fit da área útil somente se os cenários demonstrarem sobreposição reproduzível; preservar algoritmo radial, espaçamentos e seleção existentes em `frontend/src/components/relacoes/GraphStage.tsx` e `frontend/src/components/relacoes/graphLayout.ts`

**Checkpoint**: PJs, NPCs, foco e vizinhos diretos são localizáveis sem restaurar o layout de página antigo ou redesenhar o algoritmo radial.

---

## Phase 6: User Story 4 - Usuário conserva os fluxos atuais da rede (Priority: P2)

**Goal**: Casca flutuante e fluxos de busca, filtro, lista/detalhe, seleção e edição GM continuam funcionando após as correções.

**Independent Test**: Buscar e filtrar personagens/vínculos, selecionar na lista e grafo, abrir/voltar do detalhe e, como GM, criar/editar/remover; em mobile alternar lista/detalhe/palco sem painel ou coluna antigos.

### Tests for User Story 4

- [ ] T012 [P] [US4] Criar smoke E2E para busca, filtros, isolar, sincronização lista/grafo/detalhe, edição GM e painel móvel atual em `frontend/e2e/relacoes-flows.spec.ts`

### Implementation for User Story 4

- [ ] T013 [US4] Corrigir somente regressões demonstradas pelos cenários de interação, mantendo `MapSidePanel`, lista/detalhe único e os formulários atuais sem reintroduzir coluna fixa/painel separado em `frontend/src/pages/RelacoesPage.tsx` e `frontend/src/components/map/MapSidePanel.tsx`

**Checkpoint**: Interações e painel atual permanecem intactos com os novos marcadores, estilos, filtros e amostras.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Finalizar documentação rastreável e executar validação ponta a ponta.

- [ ] T014 Atualizar instruções de uso, cores/traços, privacidade GM/jogador e linhas retas em `docs/manual-relacoes.md`; atualizar a referência estrutural vigente e registrar diferenças intencionais da spec 105 em `specs/116-relacoes-rota-reconstrucao/spec.md`
- [ ] T015 Atualizar estados/evidências de todos os critérios da matriz final e executar backend, Playwright/axe e build conforme `specs/128-paridade-rede-relacoes/parity-matrix.md` e `specs/128-paridade-rede-relacoes/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Nenhuma inicialização nova.
- **Foundational (Phase 2)**: T001 identifica a linha de base, critérios aplicáveis e conflitos antes da implementação.
- **User Stories (Phases 3–6)**: US1 e US2 são P1; começar por testes e não alterar o servidor sem falha comprovada. US3 só altera geometria se T010 demonstrar problema. US4 serve como regressão e coordena-se com as outras histórias sem mudar o shell.
- **Polish (Phase 7)**: Depende das correções selecionadas; documentação/matriz precisa refletir evidência final.

### User Story Dependencies

- **US1 (P1)**: MVP de segurança visual; T002/T003 são testes independentes e precedem qualquer mudança de projeção/renderização.
- **US2 (P1)**: Pode avançar após T001; T007 e T008 alteram módulos diferentes e podem ser coordenados em paralelo depois de T006. T009 depende dos estilos finais de T008.
- **US3 (P1)**: Independente em conceito, mas T011 compartilha `GraphStage.tsx` com US1/US2; executar após essas alterações para evitar conflitos e só se T010 encontrar sobreposição.
- **US4 (P2)**: Os testes T012 podem ser escritos em paralelo com E2E das outras histórias; T013 é apenas para falhas reproduzidas.

### Parallel Opportunities

- T002 e T003 podem ser escritos em paralelo em backend e frontend.
- T006, T010 e T012 são testes em arquivos separados e podem ser preparados em paralelo após a matriz T001.
- T007 (palco/direção) e T008 (tokens/helpers de estilo) podem avançar em paralelo depois dos testes; T009 deve aguardar o mapeamento final de T008.
- T014 documentação pode começar após as decisões finais de privacidade e estilo, enquanto a validação visual final é preparada.

## Parallel Example: User Stories 1 and 2

```text
T002 endpoint privacy/redaction regression tests
T003 GM/player privacy rendering tests
Após especificar os estados e os testes:
T007 linha reta e direção no palco
T008 cores por tipo e estilos redundantes
```

## Implementation Strategy

### MVP First (User Story 1)

1. Completar T001 com a matriz de fontes e divergências aceitas.
2. Escrever testes de projeção pública e dos estados GM/jogador.
3. Implementar pistas GM-only com a projeção de servidor existente; só alterar backend se o teste demonstrar vazamento.
4. Validar que nenhuma informação privada aparece no payload ou interface de jogador.

### Incremental Delivery

1. Entregar US1 e confirmar privacidade no servidor e distinção visual no GM.
2. Entregar US2 com arestas retas, direções corretas, oito cores e amostras fiéis.
3. Validar US3 e ajustar viewport apenas se houver sobreposição reproduzível.
4. Confirmar US4, atualizar manual/spec estrutural e fechar cada linha da matriz com evidência.
