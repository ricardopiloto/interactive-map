# Feature Specification: Home, Explorar e Painel (três telas)

**Feature Branch**: `119-home-explorar-painel`

**Created**: 2026-09-23

**Status**: Draft

**Input**: User description: "Home, Explorar e Painel — três telas, não duas. / = marketing (Landing); /explorar = catálogo público; /painel = minhas campanhas. Um CampaignCard reusado nas três. Critério-chave: batem visualmente com LandingPage, ExplorePage e MestrePainel do protótipo; o mesmo cartão aparece nas três."

**Depends on**: Spec 110 (tokens / forma); Spec 114 (cabeçalho / SiteChrome adequado às páginas públicas e ao painel). Spec 111 (gênero real) — a vitrine de gêneros na Home MUST reagir de verdade se o produto já aplica `data-genre` / tokens de gênero.

**Phase**: Paridade estrutural com o protótipo — superfícies públicas e painel do mestre.

## Constitution *(constraints; not implementation)*

- Isolation (I): Sem rotas HTTP novas de dados; reutilizar catálogo e «minhas campanhas» já existentes. Matriz isolamento **N/A**.
- Testes primeiro (II): UI de polimento — quickstart/capturas MAY; sem schema/auth novo.
- Produção legada (III): Só produto Codex; MUST NOT tocar `/opt`.
- Simplicidade (IV): Um componente de cartão; sem duplicar APIs nem inventar catálogo paralelo.
- i18n (V): Toda copy nova de marketing/explorar/painel MUST ter pt-BR e en; nomes/sistemas das campanhas MUST NOT ser traduzidos pela app.
- Migrações (VI): N/A.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Home de marketing em `/` (Priority: P1) 🎯 MVP

Um visitante abre **`/`** e vê uma **página de marketing**, não uma lista densa de catálogo: hero com proposta de valor e CTAs (entrar como mestre / ver campanhas abertas), secção «como funciona» (mapa, relações, rotas), **vitrine de gêneros** clicável que **pré-visualiza o tema ao vivo** (as cores da página mudam ao escolher um género — usando os géneros reais já no produto), opcionalmente **campanhas em destaque** (subconjunto listado do catálogo) em cartões compactos, e CTA final para criar o primeiro codex. A rota **`/explorar`** passa a ser o destino do catálogo completo.

**Why this priority**: Critério-chave — `/` deixa de misturar marketing e catálogo.

**Independent Test**: Abrir `/`; confirmar secções do protótipo Landing; clicar géneros e ver mudança visual de tema; CTA «Ver campanhas» vai a `/explorar`; capturar vs. LandingPage.

**Acceptance Scenarios**:

1. **Given** visitante em `/`, **When** a página carrega, **Then** vê hero + «como funciona» + vitrine de géneros (+ destaque/CTA conforme protótipo), **não** a grade completa de catálogo como conteúdo principal.
2. **Given** vitrine de géneros, **When** o visitante selecciona um género, **Then** a pré-visualização do tema aplica-se de imediato (não é mock estático se o produto já tem géneros da spec 111).
3. **Given** CTA «Ver campanhas abertas» (ou equivalente i18n), **When** o visitante o activa, **Then** navega para `/explorar`.
4. **Given** campanhas listadas na API de catálogo, **When** a Home mostra destaque, **Then** usa o **mesmo** componente de cartão (variante compacta) com link para a campanha.

---

### User Story 2 - Catálogo público em `/explorar` (Priority: P1)

Um visitante abre **`/explorar`** e vê o **catálogo público**: título/descrição, **busca** (nome/sistema), **filtro por género** (incluindo «todos»), e **grade de cartões**. Os dados vêm da **mesma API de catálogo** que a Home antiga já usava. Cartões usam o componente único (com rodapé adequado ao catálogo, se o protótipo o tiver). Estado vazio i18n quando o filtro não encontra nada.

**Why this priority**: Segunda metade da separação; critério-chave vs. ExplorePage.

**Independent Test**: Abrir `/explorar`; filtrar por texto e género; abrir um cartão → `/c/:slug`; capturar vs. ExplorePage.

**Acceptance Scenarios**:

1. **Given** `/explorar`, **When** a página carrega, **Then** lista campanhas públicas/listadas via API de catálogo existente (sem mudar o contrato da API).
2. **Given** texto de busca e/ou chip de género, **When** o visitante filtra, **Then** a grade reflecte o filtro client-side sobre os dados já carregados.
3. **Given** um cartão no catálogo, **When** o visitante o activa, **Then** navega para a campanha (`/c/:slug`).
4. **Given** filtro sem resultados, **When** a lista está vazia, **Then** mostra estado vazio i18n.

---

### User Story 3 - Painel do mestre com o mesmo cartão (Priority: P1)

Um mestre autenticado abre **`/painel`** e continua a gerir **«minhas campanhas»** (criar, cota, visibilidade, abrir, exportar, etc. — fluxos já existentes). A **casca visual** alinha-se ao MestrePainel do protótipo (cabeçalho da secção, grade, cartão «criar novo»). Cada campanha usa o **mesmo** componente de cartão das rotas públicas, com **rodapé** próprio do painel (cota, acções). As implementações de cartão separadas da Home antiga e do Painel antigo deixam de ser o padrão.

**Why this priority**: Critério-chave «o mesmo cartão nas três telas».

**Independent Test**: Abrir `/painel` autenticado; confirmar cartão partilhado + cota/acções; capturar vs. MestrePainel; confirmar que Home/Explorar usam o mesmo componente.

**Acceptance Scenarios**:

1. **Given** mestre em `/painel`, **When** vê a lista, **Then** cada campanha renderiza o componente de cartão partilhado (não o markup legado exclusivo do Painel).
2. **Given** o cartão no painel, **When** o rodapé mostra cota e acções, **Then** os comportamentos de dados existentes (abrir, copiar link se existir, exportar, toggling, etc.) permanecem disponíveis sem mudar APIs.
3. **Given** as três rotas `/`, `/explorar` e `/painel`, **When** se inspecciona o cartão, **Then** é o **mesmo** componente (variantes `compact` / `footer` conforme o sítio).

---

### Edge Cases

- Catálogo vazio: Home omite ou esvazia a vitrine de destaque com elegância; Explorar mostra empty i18n; Painel mostra empty + CTA criar.
- Visitante não autenticado em `/painel`: mantém o redirect/login já existente.
- Campanha sem capa: cartão degrada com placeholder/gradiente de género (como o produto/protótipo já fazem) — sem exigir novo campo na API.
- Deep-links antigos que esperavam catálogo em `/`: MUST NOT partir bookmarks críticos — `/` deixa de ser o catálogo completo; descoberta passa por `/explorar` (CTAs da Home cobrem a transição).
- Formulário «criar campanha» / import no Painel: MUST permanecer acessível (na mesma página ou fluxo já usado); esta feature MUST NOT remover capacidade de gestão, só unificar cartão e casca.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: A rota `/` MUST ser a página de marketing alinhada ao Landing do protótipo (hero, como funciona, vitrine de géneros com pré-visualização ao vivo, destaque opcional, CTA final).
- **FR-002**: MUST existir a rota pública `/explorar` como catálogo (busca, filtro por género, grade).
- **FR-003**: `/explorar` MUST consumir a **mesma** API de catálogo já usada pela Home actual; MUST NOT alterar o contrato de resposta.
- **FR-004**: `/painel` MUST continuar a usar a API de «minhas campanhas» (e restantes acções já existentes); MUST NOT alterar o que essas APIs devolvem.
- **FR-005**: MUST existir **um** componente de cartão de campanha (equivalente ao CampaignCard do protótipo) com variantes compacta e com rodapé (`footer`), reutilizado em `/`, `/explorar` e `/painel`.
- **FR-006**: As implementações de cartão distintas em Home e Painel MUST ser substituídas pelo componente único.
- **FR-007**: A vitrine de géneros na Home MUST aplicar pré-visualização real do tema quando os géneros do produto (spec 111) estão disponíveis.
- **FR-008**: Toda copy nova MUST existir em pt-BR e en.
- **FR-009**: MUST NOT mudar contratos de API nem schema; MUST NOT redesenhar o interior do mapa/relações/rota nesta feature.

### Key Entities

- **Landing (`/`)**: Página de marketing; destaque usa subconjunto do catálogo.
- **Explorar (`/explorar`)**: Catálogo público filtrável.
- **Painel (`/painel`)**: Lista do mestre autenticado + gestão.
- **Cartão de campanha**: Componente único; props de ligação, compacto e rodapé.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Capturas de `/`, `/explorar` e `/painel` alinhadas a LandingPage / ExplorePage / MestrePainel do protótipo — estrutura de secções e cartão — sem diferença a olho nu para um revisor humano (claro e escuro).
- **SC-002**: Em 100% das três telas, o cartão de campanha é o mesmo componente (variantes permitidas); 0 regressão para dois markups de cartão paralelos como padrão.
- **SC-003**: Filtro/busca em `/explorar` produz resultados coerentes com o catálogo carregado; revisão manual em &lt; 3 minutos confirma o fluxo até abrir uma campanha.
- **SC-004**: Pré-visualização de género na Home altera o tema visível ao clicar (quando géneros reais existem no produto).
- **SC-005**: 100% das strings novas de UI aparecem correctamente em pt-BR e en; nomes de campanha/sistema permanecem como vieram da API.

## Assumptions

- Spec 110/114 entregam tokens e chrome adequados; SiteChrome/SiteHeader do produto cobre cabeçalho das páginas públicas.
- Spec 111 já (ou em paralelo) expõe géneros reais e swatches; a Home liga a vitrine a esse mecanismo — se algum género faltar no runtime, usa-se o conjunto canónico dos quatro géneros do produto.
- A API `catalogo()` e `minhas()` / acções do Painel permanecem; campos em falta no protótipo (ex.: contagem de jogadores, «última sessão») MAY omitir-se no cartão se a API não os fornecer — sem inventar endpoints (FR-009).
- «Criar novo codex» no protótipo aponta a `/painel/novo`; no PRD o fluxo de criação pode continuar embutido no Painel — MUST haver CTA equivalente que chegue ao mesmo resultado de criação.
- i18n: namespaces `comum` (e/ou `home`/`painel`) recebem as chaves novas.
