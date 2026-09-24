# Research: Home, Explorar e Painel (119)

## 1. Três rotas, não duas

**Decision**: `HomePage` em `/` torna-se Landing (marketing). Nova `ExplorarPage` em `/explorar` recebe o catálogo (`campanhasApi.catalogo()`). `PainelPage` em `/painel` mantém auth + `minhas()` + criar/import/export/visibilidade/unidade/capa. Registar `<Route path="/explorar" element={<ExplorarPage />} />` em `App.tsx`. CTAs da Home apontam para `/explorar` e `/login?next=/painel` (ou `/painel` se já autenticado — MAY detectar `authApi.me` de forma leve ou sempre `/login` com next).

**Rationale**: FR-001–002; protótipo Landing / Explore / MestrePainel.

**Alternatives considered**:
- Manter catálogo em `/` + marketing só no hero — falha critério-chave.
- `/catalogo` em vez de `/explorar` — diverge do protótipo.

## 2. CampaignCard único

**Decision**: Criar `frontend/src/components/campaign/CampaignCard.tsx` (+ CSS) espelhando o contrato do protótipo: props `slug`, `nome`, `sistema`, `genero`, `capa_url?`, `linkTo?`, `compact?`, `footer?: ReactNode`. Cover: `capa_url` img ou placeholder/gradiente por género (`--genre-swatch-*` / `data-genre`). Badge de género via i18n `painel.genre_*`. **Omitir** `jogadores`, `resumo`, `mestre`, `ultimaSessao` se ausentes na API (FR-009 / Assumptions). Home destaque: `compact` + `linkTo`. Explorar: `linkTo` + footer opcional mínimo (só o que a API tiver — tipicamente nada extra, ou sistema já no body). Painel: **sem** `linkTo` no wrapper (evitar `<a>` aninhado); `footer` com cota, badge visibilidade, Abrir / export / toggles existentes.

**Rationale**: FR-005–006 / SC-002; mesmo componente nas três.

**Alternatives considered**:
- Props tipadas a `Campaign` do protótipo — força campos inventados.
- Dois wrappers HomeCard/PainelCard — viola «mesmo componente».

## 3. Pré-visualização de género na Home

**Decision**: Vitrine dos quatro `GENRES`; ao clicar, aplicar `document.documentElement.dataset.genre` (helpers em `campaignGenre.ts` / mesmo padrão que `PainelPage` já usa no formulário criar). Restaurar género anterior no unmount. NÃO mock de cores estáticas se tokens 111 existem.

**Rationale**: FR-007 / SC-004.

**Alternatives considered**: Só highlight do card activo sem mudar tokens da página — falha «ao vivo».

## 4. Filtros em Explorar

**Decision**: Client-side sobre `catalogo()`: query em `nome`/`sistema` (case-insensitive); chips género + «todos» via `Chip` kit. EmptyState i18n. Sem query params obrigatórios na v1 (MAY sync `?q=`/`?genero=` depois — fora de escopo mínimo).

**Rationale**: FR-003; ExplorePage do protótipo.

## 5. Painel: casca vs capacidade

**Decision**: Restyle layout (título, lead, grid, cartão «criar novo») ao MestrePainel. Manter formulário criar + import **na página** (ou âncora `#criar` / scroll) — CTA «Criar novo codex» foca/abre essa secção; **não** exigir rota `/painel/novo` se o PRD já embute criação. Substituir markup `painel-page__card` legado por `CampaignCard` + footer com as mesmas acções (`Link` Abrir, export, toggle visibilidade/unidade, capa).

**Rationale**: FR-004; Assumptions «CTA equivalente».

**Alternatives considered**: Nova rota `/painel/novo` só UI — YAGNI se form já existe.

## 6. SiteChrome / i18n

**Decision**: Continuar `SiteChrome` nas três páginas (produto). Namespaces: estender `comum` com chaves `landing.*`, `explorar.*` (e reusar `painel.*` / `home.*` onde fizer sentido). Nomes/sistemas da API nunca traduzidos.

**Rationale**: FR-008; Spec 114 chrome.

## 7. Deep-links `/`

**Decision**: `/` deixa de listar o catálogo completo; bookmarks antigos vêem Landing. Descoberta via CTA → `/explorar`. Sem redirect forçado de `/` → `/explorar`.

**Rationale**: Edge case do spec; transição coberta por CTAs.
