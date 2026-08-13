# Feature Specification: UX Nocturne & Débitos

**Feature Branch**: `079-ux-nocturne`

**Release**: Codex **v2.0.0** (Frente C)

**Created**: 2026-08-13

**Status**: Implemented

**Input**: Corrigir débitos de UX (digitalização de rotas, pinch-zoom na Rede) e aplicar diretriz visual Nocturne (elevação vs borda pesada).

**Depends on**: Nenhuma frente v2 obrigatória — pode intercalar com A/B

**Source**: [docs/v2/rfc-debito-ux.md](../../docs/v2/rfc-debito-ux.md)

**Blocks (recommended before)**: [080-i18n-interface](../080-i18n-interface/spec.md)

## Clarifications

### Session 2026-08-13

- Q: Pinch-zoom no Mapa principal entra no escopo de 079 ou fica só na Rede? → A: Verificar durante implementação; corrigir na mesma frente se confirmado o mesmo gap de touch.
- Q: Qual padrão mobile para a coluna de digitalização em viewport estreito? → A: Bottom sheet retrátil (abre/fecha), reutilizando o padrão do painel de detalhe mobile da Rede.
- Q: Quais diálogos GM recebem tratamento visual Nocturne (elevação/agrupamento)? → A: Todos os diálogos GM das três superfícies principais (Mapa, Relações, digitalização): personagem, conexão, local, NPC, arco, waypoint e aresta.
- Q: Qual breakpoint define viewport estreito para bottom sheet na digitalização? → A: 800px (`max-width: 800px`), alinhado à Rede de Relações.
- Q: Bottom sheet retrátil aplica-se também à coluna mobile da Rede ou só à digitalização? → A: Só digitalização; Rede mantém coluna inferior fixa no mobile, com apenas tratamento visual Nocturne (elevação).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Digitalização de rotas usável (Priority: P1)

O mestre, na tela de digitalização de waypoints/arestas, encontra elementos via **busca** numa **coluna lateral fixa** (padrão Mapa/Relações), com secções Waypoints e Arestas; clicar num item centra/destaca no mapa.

**Why this priority**: Lista em baixo do ecrã impede achar nós em campanhas grandes.

**Independent Test**: Campanha com 20+ waypoints → busca filtra; clique centra no mapa.

**Acceptance Scenarios**:

1. **Given** lista longa de waypoints, **When** mestre pesquisa por nome, **Then** lista filtra em tempo real.
2. **Given** item seleccionado na lista, **When** clica, **Then** mapa centra e destaca o waypoint/aresta correspondente.
3. **Given** ecrã estreito (tablet), **When** abre digitalização, **Then** coluna vira bottom sheet retrátil (abre/fecha por toggle), reutilizando o padrão do painel de detalhe mobile da Rede — mapa ocupa o palco quando a folha está fechada.

---

### User Story 2 - Pinch-zoom na Rede de Relações (Priority: P1)

Utilizador com touchscreen (notebook, tablet, telemóvel) faz **pinça** no palco da Rede para zoom, com o mesmo factor de escala que a roda do rato.

**Why this priority**: Entrada por toque hoje ignorada — bug funcional, não só estética.

**Independent Test**: Pinça in/out altera zoom; roda do rato continua a funcionar.

**Acceptance Scenarios**:

1. **Given** Rede aberta em dispositivo touch, **When** gesto de pinça, **Then** zoom aumenta/diminui suavemente.
2. **Given** zoom por roda já usado, **When** alterna para pinça, **Then** continua no mesmo nível de zoom (estado único).
3. **Given** gesto com 3+ dedos, **Then** não quebra pan/zoom (comportamento estável).

---

### User Story 3 - Diretriz visual Nocturne (elevação) (Priority: P2)

Painéis flutuantes e colunas fixas se separam do conteúdo por **sombra/elevação**, não bordas pesadas; accent blurple só em interactivos; modais GM com hierarquia visual mais clara.

**Why this priority**: Feedback “visual datado” — identidade sem mudar arquitectura de informação.

**Independent Test**: Comparar coluna Relações/Mapa antes/depois — sem borda grossa; painel detalhe com sombra mais pronunciada.

**Acceptance Scenarios**:

1. **Given** coluna Relações (236px fixa), **When** observa separação do palco, **Then** vê elevação/sombra, não contorno pesado (estrutura fixa mantida).
2. **Given** painel de detalhe aberto, **When** sobrepõe palco, **Then** destaca-se como camada superior (sombra mais forte).
3. **Given** diálogo GM (personagem, conexão, local, NPC, arco, waypoint ou aresta) aberto a partir de Mapa, Relações ou digitalização, **When** observa hierarquia, **Then** campos relacionados agrupados visualmente; modal com fundo escurecido e elevação pronunciada.

---

### Edge Cases

- Digitalização: protocolo de clique no mapa para criar waypoint/aresta **não muda** — só layout.
- Rede mobile (≤800px): coluna lateral **mantém** painel inferior fixo; bottom sheet retrátil é exclusivo da digitalização nesta frente.
- Mapa principal: verificar se partilha gap de pinch durante implementação; se confirmado, corrigir na mesma frente 079 (escopo principal continua sendo a Rede).
- Paleta dark + blurple **não muda**; referência Google Maps é disposição, não tema claro.
- Spec Relações: coluna continua **fixa** (não flutuante) — só tratamento visual.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Tela de digitalização MUST usar coluna lateral (~236px) com busca, secções Waypoints/Arestas colapsáveis.
- **FR-002**: Busca MUST filtrar waypoints e arestas por nome simultaneamente.
- **FR-003**: Selecção na lista MUST centrar/destacar elemento no mapa admin.
- **FR-004**: Em viewport estreito (`max-width: 800px`), coluna de digitalização MUST tornar-se bottom sheet retrátil (abre/fecha por toggle), reutilizando o padrão do painel de detalhe mobile da Rede — não painel inferior fixo permanente. A coluna lateral da Rede no mobile **não** muda de layout nesta frente.
- **FR-004a**: Coluna lateral da Rede em mobile (≤800px) MUST manter painel inferior fixo existente; apenas tratamento visual Nocturne (FR-006) se aplica.
- **FR-005**: Rede de Relações MUST suportar zoom por pinça com estado de zoom unificado com roda.
- **FR-005a**: Durante implementação, MUST verificar pinch-zoom no Mapa principal; se o mesmo gap for confirmado, MUST corrigir na mesma frente (sem ticket separado).
- **FR-006**: Colunas fixas (Mapa, Relações, digitalização) MUST usar elevação em vez de borda pesada como separador principal.
- **FR-007**: Painel de detalhe e modais MUST reforçar hierarquia por sombra/elevação.
- **FR-007a**: Diálogos GM abertos a partir de Mapa, Relações ou digitalização (personagem, conexão, local, NPC, arco, waypoint, aresta) MUST aplicar agrupamento visual de campos relacionados, backdrop escurecido e elevação pronunciada.
- **FR-008**: Accent blurple MUST restringir-se a elementos interactivos/seleccionados.

### Key Entities

- **Coluna de busca/lista**: padrão reutilizável (Mapa, Relações, digitalização).
- **Gestos de zoom**: roda + pinça → mesmo estado de escala.
- **Camadas UI**: palco (conteúdo) vs painéis flutuantes (elevação).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Mestre encontra waypoint nomeado em digitalização em **<10 s** com busca (campanha com 20+ nós).
- **SC-002**: Pinch-zoom funciona em **3 de 3** dispositivos touch testados (notebook/tablet/telefone).
- **SC-003**: Coluna Relações/Mapa sem borda grossa visível em revisão visual side-by-side.
- **SC-004**: Zero regressão no protocolo de criação de arestas/waypoints por clique no mapa.

## Assumptions

- Reutilizar drawer/padrões já previstos em Relações quando possível.
- Biblioteca de gestos (ex. use-gesture) aceitável se reduzir código próprio.
- Notas visuais em `docs/v2/feature-rede-relacoes.md` aplicam-se na implementação C, não exigem nova spec de relações.
- i18n (080) deve vir depois ou junto desta frente para não traduzir UI que será redesenhada.
