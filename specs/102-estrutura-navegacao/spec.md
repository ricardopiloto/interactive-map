# Feature Specification: Estrutura e navegação

**Feature Branch**: `102-estrutura-navegacao`

**Created**: 2026-09-20

**Status**: Implemented

**Input**: User description: "Estrutura e navegação. Barra de topo única em todas as telas: marca "Campaign Codex" (mesmo nome em todos os idiomas: locales, <title>, favicon), seções Mapa e Relações com sublinhado, menu do usuário (entrar/sair, idioma e tema Auto/Claro/Escuro persistido) e um espaço para o nome da campanha, pronto para /c/:slug. Remover a marca duplicada da coluna e os três indicadores de Modo GM. Um único controle "Modo edição", visível só para quem pode editar, com o estado sempre visível. Barra inferior no celular com ícones. Enquanto a 095 não existe, o acesso ao Modo edição segue o gate atual. Fora de escopo: contas e login (spec 095). Depende de: UX-2; coordenar com 094 e 095. Critério-chave: Mapa e Relações compartilham o mesmo cabeçalho; nenhuma tela mostra a marca ou o Modo GM em mais de um lugar."

**Depends on**: [101-componentes-base-icones](../101-componentes-base-icones/spec.md) (UX-2); [094-roteamento-campanha](../094-roteamento-campanha/spec.md) (Implemented); [095-contas-sessao-permissoes](../095-contas-sessao-permissoes/spec.md) (Implemented); [100-fundacoes-sistema-visual](../100-fundacoes-sistema-visual/spec.md) (UX-1 — temas); RFC ([docs/v2/rfc-ux-redesign.md](../../docs/v2/rfc-ux-redesign.md) fase UX-3); constituição v1.0.0 (III, IV, V)

**Phase**: UX-3. Coordena com rotas `/c/:slug` (094) e sessão/membership (095). **Não** reimplementa contas/login (095 já entregue). Bloqueia UX-5 (listas/modo edição em profundidade) e alimenta UX-9.

## Clarifications

### Session 2026-09-20

- Q: O seletor de tema (Auto / Claro / Escuro) deve persistir onde? → A: `localStorage` no browser (por dispositivo)
- Q: Onde fica «Modo edição» e o estado ligado/desligado? → A: Na barra de topo; estado mantém-se ao mudar Mapa ↔ Relações na mesma campanha; ao sair de `/c/:slug` volta a desligado
- Q: Que itens entram na barra inferior (viewport estreito)? → A: Só Mapa e Relações
- Q: Em ecrã estreito, as secções Mapa/Relações no topo ficam como? → A: Ocultas no topo; navegação só pela barra inferior
- Q: Para onde leva o clique na marca «Campaign Codex»? → A: Para `/` (home); nome da campanha é só texto

### Resolved in specify

- **095 já existe (Implemented)**: o prompt original do RFC dizia «enquanto a 095 não existe, usar o gate actual». Nesta árvore a 095 está entregue. Portanto: o acesso a **Modo edição** MUST basear-se na sessão autenticada e na capacidade de editar a campanha actual (membership 095 / regras já usadas pela API admin). MUST NOT reintroduzir HTTP Basic nem um segundo sistema de contas. Fora de escopo continua a ser *desenhar* ecrãs de login/convite (já 095) — só integrar o menu Entrar/Sair com o que existe.
- **Marca**: «Campaign Codex» em locales, `<title>` e favicon — mesmo nome em pt-BR e en (e quaisquer outros).

## Constitution

- Isolamento (I): cabeçalho e navegação MUST NÃO misturar dados de outra campanha; o nome mostrado é o da campanha do slug actual (094).
- Testes primeiro (II): partilha do cabeçalho Mapa/Relações, unicidade da marca e unicidade do controlo de edição, e persistência do tema MUST ser verificáveis (teste e/ou checklist de aceitação no plano).
- Produção legada (III): MUST NOT exigir `/opt/codex-*`.
- Simplicidade (IV): um chrome partilhado; reutilizar componentes UX-2; tema Auto/Claro/Escuro sobre tokens UX-1.
- i18n (V): copy nova do chrome (menu, Modo edição, navegação móvel) MUST ter pt-BR e en. A **marca** MUST ser a string fixa **«Campaign Codex»** em todos os idiomas (não traduzir).
- Migrações (VI): N/A.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Mapa e Relações partilham o mesmo cabeçalho (Priority: P1)

Um jogador ou mestre, dentro de `/c/:slug`, vê **uma** barra de topo comum ao Mapa e às Relações: marca «Campaign Codex», secções Mapa e Relações com indicador sublinhado na secção activa, espaço para o **nome da campanha**, e menu do utilizador. Ao mudar entre Mapa e Relações, o cabeçalho é o mesmo (não reinventa marca nem indicadores).

**Why this priority**: Critério-chave de coerência; elimina marca duplicada e chrome fragmentado.

**Independent Test**: Abrir mapa e relações da mesma campanha; o cabeçalho é visualmente e estruturalmente o mesmo componente/região; só o indicador de secção muda. Contar ocorrências visíveis da marca: **uma**. Contar indicadores de «Modo GM» / edição: **no máximo um** controlo «Modo edição».

**Acceptance Scenarios**:

1. **Given** campanha em `/c/:slug` em viewport largo, **When** o utilizador está no Mapa ou em Relações, **Then** vê a mesma barra de topo com marca «Campaign Codex», links Mapa/Relações (sublinhado na activa) e espaço do nome da campanha.
2. **Given** a coluna lateral ou outro painel da página, **When** se inspecciona a UI, **Then** **não** há segunda marca do produto nem segundo bloco de título que repita «Campaign Codex» / «Codex da Campanha».
3. **Given** Mapa e Relações, **When** se procura indicadores de modo mestre/edição, **Then** existe **no máximo um** controlo «Modo edição» (estado sempre visível quando aplicável) — MUST NOT haver tag «Modo GM» no cabeçalho **e** botão «Modo GM» **e** outro indicador na coluna ao mesmo tempo.
4. **Given** viewport estreito, **When** está em `/c/:slug`, **Then** as tabs Mapa/Relações **não** aparecem no topo; a navegação entre secções é só pela barra inferior.
5. **Given** o cabeçalho, **When** o utilizador activa a marca «Campaign Codex», **Then** navega para `/`. **Given** o nome da campanha no cabeçalho, **When** se tenta activá-lo, **Then** não é um link.

---

### User Story 2 - Menu do utilizador: sessão, idioma e tema persistido (Priority: P1)

No chrome, o menu do utilizador permite: entrar ou sair (integrado com 095), mudar idioma (pt-BR/en), e escolher tema **Auto / Claro / Escuro**, com a escolha **persistida** entre visitas. Auto segue a preferência do sistema (UX-1); Claro/Escuro forçam o tema.

**Why this priority**: Completa a barra única; tema persistido fecha a lacuna deixada pela UX-1 (sem seletor).

**Independent Test**: Sem sessão → Entrar leva ao login existente. Com sessão → Sair encerra sessão. Mudar tema para Claro, recarregar → permanece Claro. Idioma continua a funcionar.

**Acceptance Scenarios**:

1. **Given** anónimo, **When** abre o menu, **Then** pode ir a Entrar (fluxo 095) sem novo ecrã de contas inventado nesta spec.
2. **Given** autenticado, **When** escolhe Sair, **Then** a sessão termina e a UI reflecte estado anónimo.
3. **Given** tema Claro ou Escuro escolhido (gravado em `localStorage`), **When** recarrega a app, **Then** o tema escolhido mantém-se. **Given** Auto, **When** a preferência do sistema muda com a app aberta, **Then** o tema acompanha o sistema (como UX-1).
4. **Given** o menu, **When** muda o idioma, **Then** a copy de interface muda; a marca permanece «Campaign Codex».

---

### User Story 3 - Modo edição único e navegação móvel (Priority: P1)

Quem **pode editar** a campanha actual vê um único controlo «Modo edição» **na barra de topo** (junto ao menu), com estado sempre visível (ligado/desligado). O estado **mantém-se** ao mudar Mapa ↔ Relações na mesma campanha; ao sair de `/c/:slug` o modo volta a **desligado**. Quem não pode editar **não** vê o controlo. Em ecrã estreito, uma **barra inferior com ícones** com **apenas** Mapa e Relações permite saltar entre essas secções (menu e Modo edição ficam no topo).

**Why this priority**: Critério-chave de unicidade do modo edição; usabilidade em telemóvel.

**Independent Test**: Membro com permissão de edição vê um só toggle no topo; jogador anónimo não vê. Ligar o modo, ir a Relações e voltar ao Mapa → continua ligado; sair da campanha e voltar → desligado. Viewport estreito: barra inferior com exactamente dois destinos (Mapa, Relações).

**Acceptance Scenarios**:

1. **Given** utilizador autorizado a editar a campanha (095), **When** está em Mapa ou Relações, **Then** vê exactamente um controlo «Modo edição» na barra de topo e o estado (activo/inactivo) é sempre legível.
2. **Given** «Modo edição» ligado, **When** muda entre Mapa e Relações na mesma campanha, **Then** o modo permanece ligado. **Given** sai de `/c/:slug` (home, painel, outra campanha), **When** regressa, **Then** o modo está desligado.
3. **Given** anónimo ou utilizador sem permissão de edição, **When** usa as mesmas telas, **Then** **não** vê «Modo edição» nem indicadores equivalentes de «Modo GM».
4. **Given** viewport estreito (espírito ~800 px / toque), **When** usa a campanha, **Then** a barra inferior mostra **só** Mapa e Relações e permite mudar entre eles sem depender só do topo.

---

### User Story 4 - Marca e documento alinhados (Priority: P2)

O nome do produto apresentado ao utilizador é **Campaign Codex** em todos os idiomas: strings de marca nos locales, título do documento e favicon/identidade associada. Deixa de haver «Codex da Campanha» / «Mapa da Campanha» como nome de produto na UI.

**Why this priority**: Identidade do RFC; menos crítico que o chrome partilhado, mas obrigatório nesta fase.

**Independent Test**: Locale pt-BR e en mostram a mesma marca; `<title>` reflecte Campaign Codex; não há marca traduzida.

**Acceptance Scenarios**:

1. **Given** UI em pt-BR ou en, **When** se lê a marca no cabeçalho, **Then** o texto é «Campaign Codex».
2. **Given** a página carregada, **When** se lê o título do documento / favicon da app, **Then** estão alinhados a Campaign Codex (sem terceiro nome de produto).

---

### Edge Cases

- Home `/` e painel `/painel` (098): MUST usar a marca «Campaign Codex» e o menu de utilizador/tema/idioma de forma coerente; as secções Mapa/Relações e o nome da campanha aplicam-se no contexto `/c/:slug`. MUST NOT voltar a mostrar marca duplicada nessas páginas.
- Campanha sem imagem de mapa: navegação Mapa/Relações permanece; regras 094 de redirect sem mapa mantêm-se salvo decisão explícita no plano.
- Deep link `/c/:slug/relacoes`: cabeçalho com Relações activa.
- Modo edição desligado: acções de mestre NÃO precisam desaparecer todas nesta fase (UX-5 aprofunda listas); o controlo e a unicidade SIM. Esta fase MAY ligar o estado existente `isGm` ao novo rótulo/controlo único no topo.
- Troca de campanha (`/c/a` → `/c/b`): modo edição MUST estar desligado na campanha destino (saiu do slug anterior).
- Preferência de tema corrompida no armazenamento local: MUST cair em Auto.
- `/opt/codex-*` intocado.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: MUST existir barra de topo **única** partilhada por Mapa e Relações em `/c/:slug`, com: marca «Campaign Codex» (clicável → `/`); secções Mapa e Relações com sublinhado na activa (só em viewport largo); espaço para o **nome da campanha** como texto não clicável; menu do utilizador.
- **FR-002**: A marca do produto MUST ser a string fixa **Campaign Codex** em todos os idiomas (locales de marca, `<title>`, favicon/identidade). MUST NOT traduzir o nome do produto. O clique na marca MUST navegar para `/` (home). O nome da campanha no cabeçalho MUST NÃO ser link.
- **FR-003**: MUST remover a marca duplicada na coluna (ou outros sítios) e colapsar os múltiplos indicadores de «Modo GM» num único controlo «Modo edição».
- **FR-004**: «Modo edição» MUST residir **só** na barra de topo, visível **só** para quem pode editar a campanha actual, com estado sempre visível. O estado MUST persistir ao navegar Mapa ↔ Relações na mesma campanha e MUST resetar a desligado ao sair de `/c/:slug`. Autorização MUST usar a sessão/membership da 095 (não recriar contas). MUST NOT implementar novos ecrãs de login/convite nesta spec.
- **FR-005**: O menu do utilizador MUST oferecer Entrar/Sair (095), idioma, e tema Auto/Claro/Escuro com persistência em **`localStorage`** (por dispositivo). Auto segue `prefers-color-scheme` (UX-1); Claro/Escuro forçam `data-theme`.
- **FR-006**: MUST existir barra inferior com ícones em viewport estreito **apenas** com Mapa e Relações (sem menu do utilizador nem «Modo edição» na barra inferior). Em viewport estreito, as tabs Mapa/Relações MUST estar **ocultas no topo** (navegação só pela barra inferior). Em viewport largo, a barra inferior MUST NÃO aparecer e as tabs MUST estar no topo.
- **FR-007**: Mapa e Relações MUST NÃO mostrar a marca do produto em mais de um sítio nem o modo edição/GM em mais de um sítio na mesma vista.
- **FR-008**: MUST coordenar com rotas 094 (`/c/:slug`, `/c/:slug/relacoes`) sem quebrar o prefixo de campanha.
- **FR-009**: MUST usar componentes/tokens das UX-1/UX-2 onde aplicável (Button, IconButton, Tabs/menu, etc.).
- **FR-010**: MUST NOT exigir alterações em `/opt/codex-*`.
- **FR-011**: Fora de escopo: redesenhar o conteúdo do mapa/grafo/listas (UX-4–UX-8); novos fluxos de contas (095).

### Out of Scope

- Implementar ou redesenhar login, convite, reset, lockout (095 — já existe; só integrar).
- Redesenho de pinos, popovers, listas, relações, rotas, formulários (UX-4–UX-8).
- Acento/capa por campanha (UX-9).
- Auditoria a11y completa (UX-10).
- Corte legado (099).

### Key Entities

- **Chrome de campanha**: barra de topo (+ barra inferior móvel só com Mapa/Relações) partilhada em `/c/:slug`.
- **Modo edição**: estado booleano de UI para quem pode editar; um controlo na barra de topo; persiste na sessão da campanha (Mapa ↔ Relações); reset ao sair de `/c/:slug`; alimenta comportamentos GM existentes.
- **Preferência de tema**: Auto | Claro | Escuro; persistida no cliente.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Em Mapa e em Relações da mesma campanha, o utilizador vê o **mesmo** cabeçalho (marca, secções, nome, menu); só o sublinhado de secção muda.
- **SC-002**: Em 100% das vistas de Mapa/Relações revistas, a marca do produto aparece **exactamente uma vez** e o controlo de edição/GM aparece **no máximo uma vez** (zero para quem não pode editar).
- **SC-003**: Após escolher tema Claro ou Escuro, um reload mantém a escolha; Auto segue o sistema.
- **SC-004**: Em viewport estreito, o utilizador consegue ir de Mapa a Relações (e vice-versa) pela barra inferior com exactamente esses dois itens, sem perder o contexto da campanha.
- **SC-005**: Em pt-BR e en, a marca visível é «Campaign Codex» (não um nome traduzido distinto).

## Assumptions

- 094 e 095 estão Implemented: rotas e auth existem; esta fase só unifica chrome e liga Modo edição à permissão real.
- O estado interno actual `isGm` pode ser renomeado/religado ao rótulo «Modo edição» sem mudar ainda todas as regras de UX-5; controlo só no topo; persistência na campanha (ex. estado React partilhado ou `sessionStorage` com chave por slug — detalhe no plano).
- Persistência de tema: `localStorage` no browser (chave documentada no plano); valor inválido → Auto.
- Nome da campanha no cabeçalho: vem da config/API já existente da campanha (094/098).
- Home/painel (098) alinham marca e menu; não precisam das tabs Mapa/Relações nem da barra inferior.
- Breakpoint estreito vs largo: o mesmo espírito ~800 px / `pointer: coarse` já usado no chrome (detalhe no plano).
- CHANGELOG `[Unreleased]`; sem `/opt`; SemVer só se o plano exigir.

## Notes

- Prompt original UX-3 em [docs/v2/ux-redesign-speckit-prompts.md](../../docs/v2/ux-redesign-speckit-prompts.md); adaptado porque 095 já não é futuro.
- Critério-chave do RFC: cabeçalho partilhado; marca e modo edição únicos.
- Próximo: `/speckit-plan`.
- Clarify 2026-09-20 fechado (5/5): tema `localStorage`; Modo edição no topo com persistência na campanha; barra inferior só Mapa/Relações; tabs ocultas no topo em móvel; marca → `/`, nome da campanha só texto.
