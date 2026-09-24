# Feature Specification: Mapa

**Feature Branch**: `103-mapa`

**Created**: 2026-09-20

**Status**: Implemented

**Input**: User description: "Mapa. Controles de zoom (+, −, 1:1, ir ao grupo) em painel translúcido legível sobre qualquer imagem de mapa. Pinos com contorno e estado por forma (preenchido = visitado, contorno = conhecido, bandeira = grupo), mantendo a cor livre escolhida pelo mestre. Popover do local ancorado ao pino, sem escurecer o mapa; ocultar "Sem descrição.". Legenda recolhível. Nomes dos pinos só a partir de certo zoom ou no hover. Sem mudar dados nem API. Depende de: UX-2. Critério-chave: controles e pinos legíveis sobre o pergaminho claro e sobre áreas escuras do mapa, nos dois temas; o mapa nunca é coberto por um fundo escuro para mostrar um local."

**Depends on**: [101-componentes-base-icones](../101-componentes-base-icones/spec.md) (UX-2); [100-fundacoes-sistema-visual](../100-fundacoes-sistema-visual/spec.md) (UX-1 — temas/contraste); [102-estrutura-navegacao](../102-estrutura-navegacao/spec.md) (UX-3 — Implemented); [094-roteamento-campanha](../094-roteamento-campanha/spec.md) (Implemented — `/c/:slug`); RFC ([docs/v2/rfc-ux-redesign.md](../../docs/v2/rfc-ux-redesign.md) fase UX-4); constituição v1.0.0 (III, IV, V)

**Phase**: UX-4. Só apresentação do mapa interactivo. **MUST NOT** alterar modelo de dados, contratos de API, nem regras de negócio de locais/grupo. Coordena visualmente com UX-3 (chrome); não redesenha a coluna de listas (UX-5).

## Clarifications

### Session 2026-09-20

- Q: Quando devem aparecer os nomes dos pinos? → A: Acima do limiar de zoom **e** no hover (mesmo abaixo do limiar)
- Q: Onde fica o painel translúcido dos controlos de zoom? → A: Canto inferior direito do mapa
- Q: A legenda de formas inicia como? → A: Fechada por defeito; clique/toque abre
- Q: Como se fecha o popover do local? → A: Esc, clique fora (no mapa) ou botão fechar
- Q: Onde fica a legenda recolhível? → A: Canto inferior esquerdo do mapa

## Constitution

- Isolamento (I): o mapa continua a mostrar só a campanha do slug actual; sem novas rotas de conteúdo.
- Testes primeiro (II): legibilidade dos controlos/pinos nos dois temas e a ausência de overlay escuro no detalhe do local MUST ser verificáveis (checklist visual + testes de regressão onde fizer sentido). Sem mudança de API → sem matriz de isolamento de dados nova obrigatória além do existente.
- Produção legada (III): MUST NOT tocar `/opt/codex-*`.
- Simplicidade (IV): reutilizar tokens UX-1 e controlos UX-2; sem biblioteca de mapa nova salvo justificação no plano.
- i18n (V): copy nova (controlos, legenda, tooltips) MUST ter pt-BR e en. Nomes/descrições do mestre MUST NOT ser traduzidos. MUST NOT inventar texto placeholder «Sem descrição.» quando a descrição está vazia.
- Migrações (VI): N/A (sem schema).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Controlos de zoom legíveis sobre qualquer mapa (Priority: P1)

Um jogador ou mestre no mapa usa um painel translúcido no **canto inferior direito** do mapa com **+**, **−**, **1:1** (repor escala) e **ir ao grupo**. Os controlos permanecem legíveis sobre imagens claras (pergaminho) e escuras, nos temas claro e escuro da app.

**Why this priority**: Critério-chave de legibilidade dos controlos; problema actual do RFC (zoom ilegível sobre pergaminho).

**Independent Test**: Abrir uma campanha com mapa claro e outra com áreas escuras (ou a mesma com regiões mistas); nos dois temas da UI, os quatro controlos no canto inferior direito são distinguíveis e utilizáveis sem adivinhar o ícone.

**Acceptance Scenarios**:

1. **Given** o mapa aberto, **When** o utilizador usa +, −, 1:1 e ir ao grupo, **Then** cada acção funciona (aproximar, afastar, repor escala de referência, centrar/focar o grupo).
2. **Given** tema claro ou escuro da app e imagem de mapa clara ou escura, **When** observa o painel de controlos, **Then** o painel está no canto inferior direito, é translúcido, e os controlos continuam legíveis (não «desaparecem» no fundo do mapa).

---

### User Story 2 - Pinos por forma + cor do mestre; nomes discretos (Priority: P1)

Os pinos mantêm a **cor livre** escolhida pelo mestre. O **estado** comunica-se pela **forma**: preenchido = visitado; contorno = conhecido; bandeira = grupo. Os **nomes** dos pinos aparecem **acima de um limiar de zoom** (todos os elegíveis) **e** no **hover** (mesmo abaixo do limiar, só o pino sob o cursor), para não poluir o mapa afastado.

**Why this priority**: Critério-chave de pinos legíveis; cor deixa de ser o único sinal de estado.

**Independent Test**: Locais visitados vs conhecidos vs marcador de grupo distinguem-se pela forma mesmo com a mesma cor de mestre; com zoom baixo os nomes estão ocultos excepto no hover; acima do limiar os nomes ficam visíveis.

**Acceptance Scenarios**:

1. **Given** locais com estados visitado/conhecido e a posição do grupo, **When** se observa o mapa, **Then** o estado é legível pela forma (preenchido / contorno / bandeira), sem depender só da cor.
2. **Given** um local com cor de pino escolhida pelo mestre, **When** se redesenha o pino, **Then** essa cor continua a ser usada no preenchimento/contorno conforme o estado.
3. **Given** zoom abaixo do limiar, **When** se olha o mapa sem hover, **Then** os nomes dos pinos **não** estão todos visíveis. **Given** hover sobre um pino (qualquer zoom), **Then** o nome desse pino torna-se visível. **Given** zoom acima do limiar, **Then** os nomes dos pinos elegíveis ficam visíveis.

---

### User Story 3 - Detalhe do local sem escurecer o mapa (Priority: P1)

Ao seleccionar um local, o detalhe abre num **popover ancorado ao pino**. O mapa **não** é coberto por um fundo escuro (dimming/overlay). O popover fecha com **Esc**, **clique no mapa fora** do popover, ou **botão fechar**. Se a descrição estiver vazia, **não** se mostra o texto «Sem descrição.» (nem equivalente).

**Why this priority**: Critério-chave — o mapa nunca é coberto por fundo escuro para mostrar um local.

**Independent Test**: Abrir um local com e sem descrição; o mapa permanece visível à volta do popover; fechar por Esc / clique fora / botão; string «Sem descrição.» / «No description.» ausente no detalhe do mapa quando a descrição é vazia.

**Acceptance Scenarios**:

1. **Given** um local seleccionado, **When** o detalhe abre, **Then** o popover está ancorado ao pino e **não** há overlay escuro a cobrir o mapa.
2. **Given** o popover aberto, **When** o utilizador pressiona Esc, clica no mapa fora do popover, ou activa o botão fechar, **Then** o popover fecha e a selecção deixa de mostrar o detalhe.
3. **Given** local sem descrição, **When** o detalhe abre, **Then** o campo de descrição vazio **não** mostra o placeholder «Sem descrição.» (nem a tradução equivalente).
4. **Given** local com descrição, **When** o detalhe abre, **Then** a descrição do mestre é mostrada normalmente.

---

### User Story 4 - Legenda recolhível (Priority: P2)

O mapa oferece uma **legenda recolhível** no **canto inferior esquerdo** que explica as formas/estados dos pinos (e o que for necessário à leitura). **Começa fechada**; o utilizador abre com clique/toque. Fechada, não ocupa espaço permanente nem bloqueia o mapa. (Controlos de zoom ficam no canto inferior direito.)

**Why this priority**: Apoia a legibilidade das novas formas; secundário aos controlos e ao popover.

**Independent Test**: Com a legenda fechada (estado inicial) no canto inferior esquerdo, pan/zoom funcionam; abrir/fechar esclarece visitado/conhecido/grupo; não colide com o painel de zoom.

**Acceptance Scenarios**:

1. **Given** o mapa acabou de abrir, **When** o utilizador não interagiu com a legenda, **Then** a legenda está **fechada** no canto inferior esquerdo e não impede pan/zoom nem cobre o conteúdo de forma permanente.
2. **Given** a legenda aberta, **When** o utilizador a consulta, **Then** consegue associar forma → significado (visitado, conhecido, grupo).
3. **Given** a legenda aberta, **When** o utilizador a fecha, **Then** volta ao estado compacto sem bloquear o mapa.

---

### Edge Cases

- Campanha sem imagem de mapa: comportamento de ausência de mapa (094) mantém-se; esta fase não inventa mapa placeholder decorativo obrigatório.
- Modo edição / colocação de pinos (GM): MUST permanecer utilizável; esta fase não remove capacidades de edição — só muda apresentação. Detalhe fino de botões na lista = UX-5.
- Grupo sem posição: «ir ao grupo» MUST falhar de forma compreensível (desactivado ou mensagem breve), sem quebrar o mapa.
- Zoom extremo: nomes e hit-targets MUST permanecer usáveis nos limiares definidos no plano.
- Temas claro/escuro: controlos e pinos (contorno) MUST funcionar sobre o bitmap do mapa, não só sobre o chrome da app.
- `/opt/codex-*` intocado.
- Sem alterações a payloads de locais, grupo, config ou uploads.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: MUST existir painel translúcido de controlos de mapa no **canto inferior direito**, com: zoom +, zoom −, repor 1:1, ir ao grupo. MUST ser legível sobre imagens de mapa claras e escuras, nos dois temas da UI.
- **FR-002**: Pinos MUST usar forma para estado: preenchido = visitado; contorno = conhecido; bandeira = grupo. MUST preservar a cor livre do mestre.
- **FR-003**: Nomes dos pinos MUST aparecer (a) acima de um limiar de zoom (visíveis em massa) **e** (b) no hover sobre um pino a qualquer zoom. Abaixo do limiar, sem hover, os nomes MUST estar ocultos. Limiar exacto no plano; MUST ser consistente.
- **FR-004**: Detalhe do local MUST ser um popover ancorado ao pino. MUST NOT escurecer/cobrir o mapa com fundo escuro (overlay de dimming) para mostrar o local. MUST fechar com Esc, clique no mapa fora do popover, ou botão fechar.
- **FR-005**: MUST NOT mostrar «Sem descrição.» / equivalente quando a descrição do local está vazia no detalhe do mapa.
- **FR-006**: MUST existir legenda recolhível dos estados/formas dos pinos no **canto inferior esquerdo**. MUST iniciar **fechada**; abrir/fechar por clique ou toque. MUST NOT sobrepor o painel de controlos (inferior direito).
- **FR-007**: MUST NOT alterar dados persistidos nem contratos de API (leitura/escrita de locais, grupo, mapa, config).
- **FR-008**: Copy nova de controlos/legenda MUST ter pt-BR e en.
- **FR-009**: MUST usar tokens UX-1 e, onde fizer sentido, componentes UX-2 (IconButton, etc.).
- **FR-010**: MUST NOT exigir alterações em `/opt/codex-*`.

### Out of Scope

- Redesenho da coluna de listas / Modo edição em listas (UX-5).
- Rede de Relações, planeador de rotas, formulários (UX-6–UX-8).
- Chrome global / seletor de tema (UX-3) — apenas coexistir.
- Mudanças de backend, schema, ACLs de mídia.
- Corte legado (099).

### Key Entities

- **Painel de controlos do mapa**: zoom e ir ao grupo; translúcido; canto inferior direito.
- **Pino**: cor do mestre + forma de estado + nome condicional (limiar + hover).
- **Popover de local**: detalhe ancorado; sem dimming; fecha Esc / clique fora / botão.
- **Legenda**: recolhível; canto inferior esquerdo; inicia fechada.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Em revisão nos dois temas da app, com mapa claro e com mapa escuro (ou regiões escuras), os controlos +, −, 1:1 e ir ao grupo (canto inferior direito) são utilizáveis sem falha de legibilidade reportada no checklist de aceitação.
- **SC-002**: Um revisor distingue visitado / conhecido / grupo **pela forma** do pino, mantendo a cor escolhida pelo mestre.
- **SC-003**: Em 100% dos fluxos de abrir detalhe de local no mapa, **não** há overlay escuro a cobrir o mapa; fechar funciona por Esc, clique fora ou botão.
- **SC-004**: Locais sem descrição **não** mostram a string de placeholder «Sem descrição.» (nem equivalente i18n) no detalhe do mapa.
- **SC-005**: Com zoom baixo e sem hover, nomes de pinos não estão todos permanentes; aparecem no hover e acima do limiar de zoom.

## Assumptions

- Estados «visitado» / «conhecido» já existem na lógica actual do mapa (ou equivalentes derivados dos dados actuais); esta fase só muda a codificação visual. Se algum estado não existir no modelo, o plano MUST mapear para o sinal mais próximo **sem** nova API.
- Limiar de zoom para nomes: valor único documentado no plano (ex. nível da câmara actual).
- «1:1» = repor a escala/zoom de referência da vista (não necessariamente pixels 1:1 da imagem).
- Popover pode reutilizar conteúdo do detalhe actual (PinModal), mudando apresentação/âncora — sem novos campos de API.
- Legenda: inicia fechada; sem persistência de estado entre visitas nesta fase (salvo decisão no plano).
- CHANGELOG `[Unreleased]`; sem SemVer obrigatório; sem `/opt`.

## Notes

- Diagnóstico RFC: zoom ilegível sobre pergaminho; popover que escurece o mapa; «Sem descrição.» a ocupar espaço.
- Clarify 2026-09-20 fechado (5/5): nomes limiar+hover; zoom bottom-right; legenda fechada bottom-left; fechar popover Esc/fora/botão.
- Próximo: `/speckit-plan`.
