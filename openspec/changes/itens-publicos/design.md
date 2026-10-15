# Design

## Context

Ver `proposal.md` - Why para a motivação completa, incluindo a nota de redirecionamento (esta change mirava `frontend/` originalmente; revisão arquitetural confirmou que isso seria descartado no cutover de `frontend-v2-paper-parchment`, então foi redirecionada para `frontend-v2/`). Estado atual relevante em `frontend-v2/`:

- Backend (`backend/app/`) já expõe tudo que esta proposta precisa, sem alteração: `GET /api/c/{slug}/itens` → `ItemListPublic` (`backend/app/schemas/item.py:19-26`: `{id, nome, descricao, sessoes: [{id,numero,titulo}], eventos: [{id,titulo,ano,mes}]}`), filtrando por `visivel_para_todos` e, nas referências de sessão/evento, por visibilidade individual de cada uma. Não existe (nem é necessário) um endpoint de detalhe por id separado — a lista já retorna o shape completo.
- CRUD de GM já existe e não muda: `timelineApi.items/createItem/updateItem/deleteItem` (`frontend-v2/src/api/timeline.ts:61-72`, hitting `admin/itens`), consumido pelo diálogo de Itens embutido em `frontend-v2/src/routes/cronologia.tsx` (`Timeline`, gated por `isDono`) — não há um `ItemManager.tsx` separado como havia em `frontend/`.
- **Nenhum client público de Itens existe ainda** — só o client admin.
- Navegação da campanha é centralizada em `frontend-v2/src/components/codex/Shell.tsx`, array `lenses` (linhas ~22-28: `{ path, label, icon }`), renderizado via `nav(mobile)` (linhas ~43-72) usando `campaignHref(campaign.id, campaign.slug)` como base; o label é traduzido via `t(\`v2.${labels[path]}\`)` no namespace `comum`. Rotas centralizadas em `frontend-v2/src/routes/campaignRoutes.tsx`, função `campaignChildren()` (linhas ~9-21).
- Padrão já estabelecido para GM ver entidades ocultas: `sessoes.tsx:56-60` e `MapPage.tsx:73` trocam para o endpoint/cliente admin quando `isDono`, em vez de aplicar um bypass de visibilidade no endpoint público. Esta proposta segue o mesmo padrão para Itens (ver Decision 3).
- Padrão de chip de referência: `EntityChip` em `frontend-v2/src/routes/sessoes.tsx:70-91` (`Link` + `badgeVariants` de `@/components/ui/badge`).
- Deep-link: `frontend-v2/src/lib/navigation.tsx` já tem o padrão (`useSearch()`, `useNavigate()`, `Link` com prop `search`). Existentes: `?local=ID` (`index.tsx:70`), `?personagem=ID` (`relacoes.tsx`), `?s=NUMERO` (`sessoes.tsx:131-132` — note: número da sessão, não id), `?para=ID` (`LocationInspector.tsx:119-121`). **Não existe** deep-link por id/número de evento em nenhuma tela.
- Markdown sanitizado: `RichContent` (`frontend-v2/src/components/codex/RichContent.tsx`, `react-markdown`+`rehype-sanitize`); já tem uma prop `related: RelatedEntity[]` sem nenhum consumidor ainda.
- i18n: namespaces registrados em `frontend-v2/src/i18n/index.ts` (import de JSON + `resources[lang][ns]` + array `ns`). Existentes: `comum`, `mapa`, `relacoes`, `admin`, `sessoes`, `linhaTempo`.

## Goals / Non-Goals

**Goals:**
- Expor a lista e o detalhe de Itens visíveis para qualquer visitante de `frontend-v2/`, usando só o endpoint público que já existe (`GET /api/c/{slug}/itens`).
- Dar ao mestre, em Modo GM, visão de todos os Itens (inclusive ocultos) reaproveitando o client admin já existente, seguindo o padrão já estabelecido por `sessoes.tsx`/`MapPage.tsx` — sem criar bypass de visibilidade no endpoint público.
- Seguir os padrões já estabelecidos em `frontend-v2/` (rotas, navegação, i18n, `RichContent`, `EntityChip`, deep-link).

**Non-Goals:**
- Qualquer mudança de contrato de API do backend.
- CRUD de Itens pela tela nova — continua restrito ao diálogo já existente em `cronologia.tsx`.
- Deep-link por evento (`?evento=ID`) — não existe hoje em nenhuma tela de `frontend-v2/`; o chip de evento associado continua navegando para a lista da Linha do Tempo sem pré-seleção (ver Decision 2).
- Qualquer alteração em `frontend-v2-paper-parchment` ou no seu cronograma.

## Decisions

### 1. Página nova, não uma seção dentro de outra tela existente
**Decisão**: `routes/itens.tsx` é uma rota própria (`/c/:id/:slug/itens`, com compatibilidade `/c/:slug/itens`), com aba própria em `Shell.tsx` — no mesmo nível de `sessoes.tsx`/`cronologia.tsx`, não um painel dentro de outra tela.
**Por quê**: Itens já é tratado como entidade de primeira classe em `linha-tempo-por-descoberta` (um dos 4 tipos rastreados); uma tela própria deixa a navegação consistente com as demais entidades de primeira classe.
**Alternativa considerada**: listar Itens dentro da Linha do Tempo (onde o CRUD já vive). Rejeitada — misturaria a visão de GM (gestão) com a visão pública (consulta), e um Item pode não ter nenhum evento associado, então não é inerentemente ligado à Linha do Tempo.

### 2. Chip de sessão usa o deep-link já existente; chip de evento continua sem pré-seleção
**Decisão**: o chip de sessão associada no detalhe do Item navega para `/sessoes?s={numero}` (deep-link `?s=` já reconhecido por `sessoes.tsx`, pré-selecionando a sessão). O chip de evento associado navega para a Linha do Tempo sem parâmetro de pré-seleção, pois não existe deep-link por evento em nenhuma tela de `frontend-v2/`.
**Por quê**: diferente da proposta original (mirando `frontend/`, onde nenhum deep-link de sessão/evento existia), `frontend-v2/` já tem `?s=numero` pronto para sessão — reaproveitar é mais consistente do que propor uma navegação pior do que a já disponível. Para evento, implementar um deep-link novo ampliaria o escopo desta proposta para dentro da Linha do Tempo, que não é o foco desta mudança.
**Alternativa considerada**: adicionar `?evento=ID` à Linha do Tempo como parte desta proposta. Rejeitada por ampliar escopo; pode ser proposta como melhoria separada se a navegação sem pré-seleção para evento se mostrar insuficiente na prática.

### 3. Modo GM usa o client admin (vê itens ocultos) e só linka para o diálogo existente, sem duplicar CRUD
**Decisão**: quando `isDono`, a tela busca os Itens via `timelineApi.items` (admin, inclui ocultos) em vez do client público, e marca visualmente os itens com `visivel_para_todos=false` (ex. badge "oculto"); nenhuma ação de criar/editar/excluir é implementada em `routes/itens.tsx` — um link leva à Linha do Tempo, onde o diálogo de Itens já existe.
**Por quê**: a proposta original (mirando `frontend/`) não previa isso e a revisão arquitetural apontou como lacuna — o padrão já estabelecido em `sessoes.tsx:56-60`/`MapPage.tsx:73` é exatamente trocar de client quando dono, em vez de pedir ao endpoint público para revelar itens ocultos (o que exigiria mudança de contrato de API, um Non-Goal). Evita também duas implementações de CRUD do mesmo recurso.
**Alternativa considerada**: adicionar um parâmetro de bypass de visibilidade ao endpoint público para quem tem sessão de dono. Rejeitada — muda contrato de API (Non-Goal) quando o client admin já resolve o mesmo problema sem mudança de backend.

### 4. Sem endpoint de detalhe separado; deep-link `?item=ID` seleciona a partir dos dados já carregados
**Decisão**: a tela carrega só a lista (pública ou admin, conforme Decision 3) e seleciona o Item exibido no painel de detalhe a partir desses dados já em memória — não há uma segunda chamada HTTP por id. O deep-link `?item=ID` (mesmo padrão de `?local=ID`/`?personagem=ID`) seleciona o Item correspondente dentro da lista já carregada.
**Por quê**: a proposta original tinha um endpoint de detalhe (`GET /api/c/{slug}/itens/{id}`) e uma task dedicada a consumi-lo, mas a lista pública já retorna o shape completo (`descricao`, `sessoes`, `eventos`) — chamar de novo por id seria uma chamada redundante. Isso também resolve de forma direta o problema de testabilidade apontado na revisão (a proposta original exigia testar "acessar um Item oculto diretamente por id", mas não existia nenhum mecanismo de deep-link para isso): com `?item=ID`, uma pessoa sem sessão de dono tentando acessar um Item oculto encontra exatamente o mesmo resultado que um id inexistente — porque o item oculto nunca estava na lista que o client público carregou, não por uma checagem extra de "não encontrado" no frontend.
**Alternativa considerada**: manter o endpoint de detalhe por id e testar via chamada HTTP direta (sem passar pela UI). Rejeitada — testaria o backend (que já tem seus próprios testes, `test_itens_crud.py`/`test_public_reads.py`, inalterados por esta proposta) em vez de testar o comportamento da tela nova, que é o que esta proposta de fato adiciona.

## Risks / Trade-offs

- **Sem deep-link de evento (Decision 2), a navegação a partir de um Item para o evento associado é menos direta do que para a sessão associada** → aceito como trade-off de escopo; se o uso real mostrar que isso incomoda, é uma melhoria pequena e isolada para propor depois (adicionar `?evento=ID`/`?evento=NUMERO` à Linha do Tempo), não bloqueia esta entrega.
- **Nova aba na navegação da campanha em todas as campanhas, mesmo as que não têm nenhum Item cadastrado** → mitigado com um estado vazio explicando que nenhum Item foi cadastrado ainda.
- **GM com muitos itens cadastrados via client admin em vez do público** → sem impacto de performance relevante (mesmo volume de dados que o diálogo de Itens já carrega hoje dentro da Linha do Tempo).

## Migration Plan

Não há migração de dados. Entrega é aditiva (rota nova, aba nova) e não altera nenhuma tela existente além de adicionar uma entrada de navegação — pode ser implantada e revertida (remover a rota/aba) sem efeito em dados persistidos.
