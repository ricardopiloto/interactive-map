# Feature Specification: Fundação de testes do backend

**Feature Branch**: `092-fundacao-testes`

**Created**: 2026-09-19

**Status**: Implemented

**Input**: User description: "Fundação de testes do backend. Hoje não há nenhum teste (sem pasta tests, sem pytest no pyproject). Criar a infraestrutura: pytest, fixtures com banco SQLite temporário e diretório de uploads temporário, cliente de teste da API, e um comando único para rodar tudo. Escrever testes de caracterização do comportamento ATUAL (sem mudá-lo): rotas públicas de locais, NPCs, personagens, vínculos, arcos, grupo, config e cálculo de rotas; rotas admin com Basic Auth (401 sem credencial, 200 com); filtragem de personagens ocultos (visivel_para_todos) nas respostas públicas. Fora de escopo: qualquer mudança de comportamento ou da arquitetura; testes de frontend. Fonte: docs/v2/rfc-campaign-codex.md. Critério-chave: os testes passam no código atual e servirão de rede de segurança para as fases seguintes."

**Depends on**: Campaign Codex RFC ([docs/v2/rfc-campaign-codex.md](../../docs/v2/rfc-campaign-codex.md) §9 fase 092); constituição v1.0.0 (princípios II e IV)

## Constitution

- Isolamento (I): esta fase **não** introduz rotas `/c/{slug}`; a matriz cruzada A/B fica para 094+. N/A com justificação.
- Produção legada (III): MUST NOT exigir alteração das instâncias WFRP/WoD.
- i18n (V): sem copy de interface nova (só backend de testes).
- Simplicidade (IV): uma dependência de teste justificada (executor Python padrão da stack); ver Assumptions.
- Testes primeiro (II): esta spec **é** a fundação; as caracterizações MUST passar no código actual (não TDD de comportamento novo).

## Clarifications

### Session 2026-09-19

- Q: Quantas rotas admin entram na caracterização 401 / autenticado? → A: Todas as GET admin de listagem/sessão (sem upload de ficheiros)
- Q: O cálculo de rotas público pina o plano com sucesso, o erro de rede insuficiente, ou os dois? → A: Os dois: plano com sucesso numa rede mínima ligada **e** o erro já definido quando a rede é insuficiente

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Correr toda a suíte de backend num comando (Priority: P1)

Um contribuidor (ou o agente de implementação) no repositório executa **um único comando** e a suíte de testes do backend corre até ao fim. Cada execução usa dados **descartáveis** (base e pasta de imagens isoladas da instalação local e da produção). Existe um cliente de teste que fala com a API como um jogador ou como GM.

**Why this priority**: Sem isto não há rede de segurança para 093–099.

**Independent Test**: Com o código de produção actual, o comando único termina com sucesso; a base e os uploads habituais da máquina não são alterados.

**Acceptance Scenarios**:

1. **Given** o repositório sem suíte de backend hoje, **When** a fundação está no sítio, **Then** existe um comando documentado que corre todos os testes do backend.
2. **Given** uma base ou pasta de uploads de desenvolvimento na máquina, **When** a suíte corre, **Then** esses ficheiros permanecem intactos (a suíte usa armazenamento temporário por execução ou por teste).
3. **Given** a suíte, **When** um teste precisa de chamar a API, **Then** usa o cliente de teste (não um servidor manual na porta 8000).

---

### User Story 2 - Congelar o comportamento público actual (Priority: P1)

A suíte caracteriza as leituras públicas de **locais, NPCs, personagens, vínculos, arcos, grupo, configuração da instância e cálculo de rotas**. Os testes descrevem o que a API **já faz**; se o código actual passar, os testes passam. Nenhuma rota pública muda de contrato nesta feature.

**Why this priority**: As fases seguintes vão prefixar e fatiar estas rotas; regressões de leitura do jogador têm de ser visíveis.

**Independent Test**: Popular um conjunto mínimo de dados na base temporária (incluindo uma rede de vias mínima ligada); cada superfície listada tem pelo menos um teste que obtém sucesso no código actual. O cálculo de rotas tem **dois** pins: plano com sucesso nessa rede, e o erro já definido sem rede suficiente.

**Acceptance Scenarios**:

1. **Given** dados de amostra na base temporária, **When** se pede a listagem/detalhe público de locais, NPCs, personagens, vínculos, arcos e a posição do grupo, **Then** a API responde com sucesso e o formato esperado **hoje**.
2. **Given** a mesma base, **When** se pede a configuração da instância, **Then** a resposta inclui o que o cliente já usa (sistema, módulos, presença de mapa).
3. **Given** uma rede mínima de waypoints ligados, **When** se pede o cálculo de rotas entre dois pontos dessa rede, **Then** a API devolve um plano com sucesso no formato actual.
4. **Given** base sem rede suficiente para planear, **When** se pede o cálculo de rotas, **Then** a API devolve o erro **já definido** (não um crash nem um 500 inesperado).

---

### User Story 3 - Congelar o portão GM actual (Priority: P1)

As rotas de escrita/administração continuam atrás de **Basic Auth**. Sem credencial: recusa. Com as credenciais de GM da instância de teste: aceitação (não é um 401). A caracterização cobre **todas** as GET admin de listagem e a sessão admin: locais, NPCs, personagens, vínculos, arcos, grupo, waypoints, segmentos, escala do mapa e sessão. POST de upload de ficheiros permanece fora desta malha.

**Why this priority**: 095 troca Basic Auth por sessão; esta caracterização é o contrato a não partir até essa spec o substituir de propósito. Testar só a sessão deixaria um prefixo admin sem portão passar despercebido.

**Independent Test**: Cada GET admin de listagem/sessão listada acima, sem credenciais → 401; o mesmo conjunto com utilizador/senha de teste válidos → não 401 (tipicamente 200).

**Acceptance Scenarios**:

1. **Given** cada GET admin de listagem/sessão (locais, NPCs, personagens, vínculos, arcos, grupo, waypoints, segmentos, escala, sessão), **When** o pedido não traz credenciais, **Then** a API responde **401**.
2. **Given** as mesmas GET, **When** o pedido traz o par utilizador/senha configurado para o teste, **Then** a API **não** responde 401.

---

### User Story 4 - Personagens ocultos não saem nas respostas públicas (Priority: P1)

Um personagem com visibilidade desligada para todos **não** aparece nas listagens/detalhes públicos de personagens (nem no equivalente de NPCs). A API pública trata-o como inexistente para o jogador. O GM autenticado continua a poder vê-lo nas rotas admin (comportamento actual).

**Why this priority**: 096 aperta mídia; a regra de ficha já existe (084) e tem de ficar pinada.

**Independent Test**: Inserir um personagem visível e um oculto; a listagem pública só contém o visível; o detalhe público do oculto falha como «não encontrado»; a listagem admin com credencial inclui o oculto.

**Acceptance Scenarios**:

1. **Given** um personagem com `visivel_para_todos` verdadeiro e outro falso, **When** um jogador lista personagens (e NPCs), **Then** só o visível aparece.
2. **Given** o personagem oculto, **When** um jogador pede o detalhe pelo id, **Then** recebe o mesmo tipo de «não encontrado» que um id inexistente.
3. **Given** credenciais GM, **When** o admin lista personagens, **Then** o oculto está presente.

---

### Edge Cases

- Base temporária vazia: listagens públicas devolvem lista vazia (ou o default actual do grupo), não erro 500.
- Cálculo de rotas sem rede suficiente: o erro **já definido** pela API (não um crash) — obrigatório na malha, não substituto do plano com sucesso.
- Credencial admin errada: tratada como falha de autenticação (401), não como 200.
- Corridas consecutivas da suíte: não dependem de lixo da corrida anterior.
- Uploads: a pasta temporária existe para testes futuros; esta fase não precisa de caracterizar o POST de ficheiros.
- Vínculos públicos: se a API actual esconde linhas ligadas a personagens ocultos, o teste pinna isso; se não esconde, **não** «corrigir» nesta spec — só documentar o comportamento actual.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O repositório MUST oferecer um **comando único** que executa todos os testes do backend e termina com sucesso no código de produção actual.
- **FR-002**: Cada execução MUST usar uma base SQLite **temporária** e um diretório de uploads **temporário**, isolados dos caminhos de desenvolvimento e produção.
- **FR-003**: A suíte MUST expor um **cliente de teste** da API (jogador e GM) sem exigir o servidor de desenvolvimento à mão.
- **FR-004**: MUST existir caracterização com sucesso das superfícies públicas: locais, NPCs, personagens, vínculos, arcos, grupo, config, cálculo de rotas. O cálculo de rotas MUST pinar **os dois** caminhos: plano com sucesso numa rede mínima ligada, e o erro já definido quando a rede é insuficiente.
- **FR-005**: Pedidos GET às superfícies admin de listagem e sessão (locais, NPCs, personagens, vínculos, arcos, grupo, waypoints, segmentos, escala, sessão) **sem** credencial MUST caracterizar-se como **401**; **com** credencial GM de teste MUST caracterizar-se como autenticados (não 401). MUST NOT exigir caracterização do POST de upload.
- **FR-006**: Personagens/NPCs com visibilidade desligada para jogadores MUST estar ausentes das respostas públicas de listagem e detalhe; MUST permanecer visíveis nas rotas admin autenticadas (como hoje).
- **FR-007**: Esta feature MUST NOT alterar o comportamento da API, o schema, as rotas, a autenticação, os uploads em produção, nem a arquitectura (sem banco de controle, sem `/c/{slug}`).
- **FR-008**: Esta feature MUST NOT acrescentar testes de frontend.

### Out of Scope

- Qualquer mudança funcional ou de contrato da API.
- Testes do frontend (Vitest, Playwright, browser).
- Matriz de isolamento multi-campanha (094+).
- Cobertura exaustiva de cada verbo admin (criar/editar/apagar) — o portão 401/autenticado nas GET de listagem/sessão basta nesta fase.
- Caracterização obrigatória de upload de ficheiros.

### Key Entities

- **Ambiente de teste**: base descartável + pasta de imagens descartável + credenciais GM só para a suíte.
- **Cliente de teste**: actor jogador (sem auth) e actor GM (Basic Auth actual).
- **Personagem oculto**: ficha com visibilidade desligada para todos; já existe no produto.
- **Rede mínima de vias**: conjunto descartável de waypoints ligados suficiente para um plano público com sucesso.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Um comando, corrido duas vezes seguidas no código actual, termina com sucesso nas duas vezes (0 falhas).
- **SC-002**: 100% das superfícies públicas listadas em FR-004 têm pelo menos um teste a passar; o cálculo de rotas conta só quando existem os dois pins (plano com sucesso e erro de rede insuficiente).
- **SC-003**: 100% das GET admin de listagem/sessão listadas em FR-005, sem credencial, resultam em 401; com credencial válida, 0 desses mesmos pedidos resultam em 401.
- **SC-004**: Num conjunto com pelo menos um personagem oculto e um visível, a listagem pública contém 0 ocultos e o detalhe público do oculto não o revela.
- **SC-005**: Após a suíte, a base e os uploads habituais da máquina de desenvolvimento estão bitwise/intactos (não foram o destino da suíte).
- **SC-006**: Um contribuidor encontra o comando e o propósito da suíte na documentação do backend em menos de 2 minutos.

## Assumptions

- O executor da suíte é **pytest** (pedido explícito; dependência de desenvolvimento justificada — Constituição IV: não há suíte Python sem um runner).
- Os testes de caracterização pinam o comportamento **actual**, incluindo lacunas; não é objectivo «melhorar» visibilidade de vínculos nesta spec.
- Credenciais GM de teste vêm do ambiente da suíte (`ADMIN_USER` / `ADMIN_PASSWORD` ou equivalente injectado), nunca de produção.
- `docs/v2/rfc-campaign-codex.md` define 092 como fundação; 093+ dependem desta rede de segurança.
- Sem pasta `tests` nem pytest no manifesto do backend hoje — esta feature cria-os.

## Notes

- Documentar o comando no `backend/README.md` (SC-006).
- Não bump de versão de produto só por testes, salvo o plano da fase o exigir.
