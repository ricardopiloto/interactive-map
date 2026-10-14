# Design

## Context

Ver `proposal.md` - Why para a motivação completa. Estado atual relevante:

- Backend (`backend/app/`) já expõe tudo que esta proposta precisa, sem alteração: `GET /api/c/{slug}/itens` → `ItemListPublic`, `GET /api/c/{slug}/itens/{id}` → `ItemPublic` (`app/routers/public/itens.py` + `app/services/item_service.py`), ambos filtrando por `visivel_para_todos` e, nas referências de sessão/evento, por `is_visivel_para_jogador` de cada uma individualmente. `ItemPublic` já tem o shape `{id, nome, descricao, sessoes: [{id, numero, titulo}], eventos: [{id, titulo, ano, mes}]}`.
- CRUD de GM já existe e não muda: `adminApi.listItensAdmin/createItem/updateItem/deleteItem` (`frontend/src/api/admin.ts`), consumido por `ItemManager.tsx` dentro de `LinhaTempoPage.tsx`. O tipo `Item`/`ItemPayload` já existe em `frontend/src/types/index.ts`.
- `frontend/src/api/campaign.ts` (client público) ainda não tem nenhum método de Itens (`listSessoes`, por exemplo, é o padrão a seguir: `api.get<{ sessoes: Sessao[] }>(p('/sessoes'))`).
- Navegação da campanha é centralizada em `frontend/src/components/layout/campaignNav.ts` (`CampaignNavId`, `campaignNavItems(slug)`, `activeCampaignNavId`), consumida por `CodexHeader.tsx` e `CampaignBottomNav.tsx`. Rotas registradas em `frontend/src/App.tsx` junto das demais abas (`/c/:slug/sessoes`, `/c/:slug/linha-do-tempo`, etc.).
- Padrão já estabelecido para referência cruzada visível ao usuário: um `<Link>` estilizado como chip (não um componente `Chip` genérico — ex. `linha-tempo-page__chip` em `LinhaTempoPage.tsx`), com texto `{tipo}: {nome}` via i18n (`chipLocal`, `chipPersonagem`). **Não existe hoje** um mecanismo de deep-link para selecionar uma sessão ou evento específico em `SessoesPage`/`LinhaTempoPage` (ao contrário de Local via `?local=` e Personagem via `?personagem=`) — isso é relevante para a Decision 2 abaixo.
- Markdown sanitizado já tem um componente pronto e reaproveitável: `MarkdownSafe` (`frontend/src/components/common/MarkdownSafe.tsx`), usado por `SessoesPage`/`LinhaTempoPage`.

## Goals / Non-Goals

**Goals:**
- Expor a lista e o detalhe de Itens visíveis para qualquer visitante, usando só os endpoints públicos que já existem.
- Seguir exatamente os padrões já estabelecidos em `frontend/` (navegação, i18n, Markdown sanitizado, estilo de chip) — esta não é a migração `frontend-v2`, não há restrição de reaproveitamento de design aqui.

**Non-Goals:**
- Qualquer mudança de contrato de API do backend.
- CRUD de Itens pela tela nova — continua restrito ao `ItemManager` existente.
- Deep-link para pré-selecionar uma sessão/evento específico a partir de um chip do Item (não existe hoje para Sessões/Linha do Tempo) — ver Decision 2.
- Qualquer alteração em `frontend-v2-paper-parchment` ou no seu cronograma.

## Decisions

### 1. Página nova, não uma seção dentro de outra tela existente
**Decisão**: `ItensPage.tsx` é uma página própria, com rota `/c/:slug/itens` e aba própria na navegação — no mesmo nível de `SessoesPage`/`LinhaTempoPage`, não um painel dentro de outra tela.
**Por quê**: Itens já é tratado como entidade de primeira classe em `linha-tempo-por-descoberta` (um dos 4 tipos rastreados); uma tela própria deixa a navegação consistente com as demais entidades de primeira classe (Locais têm o Mapa, Personagens têm Relações, Sessões/Eventos têm suas próprias telas).
**Alternativa considerada**: listar Itens dentro da Linha do Tempo (onde o CRUD já vive). Rejeitada — misturaria a visão de GM (gestão) com a visão pública (consulta), e Itens já não são inerentemente ligados à Linha do Tempo (um Item pode não ter nenhum evento associado).

### 2. Chips de sessão/evento navegam para a lista, não para o item pré-selecionado
**Decisão**: os chips de sessão/evento no detalhe do Item navegam para `/c/:slug/sessoes` e `/c/:slug/linha-do-tempo` (a lista), sem parâmetro de pré-seleção.
**Por quê**: nem `SessoesPage` nem `LinhaTempoPage` têm hoje um mecanismo de deep-link por id de sessão/evento (diferente de Local/Personagem, que já têm `?local=`/`?personagem=`); implementar isso agora ampliaria o escopo desta proposta para dentro de duas páginas que não são o foco da mudança.
**Alternativa considerada**: adicionar suporte a `?sessao=ID`/`?evento=ID` em `SessoesPage`/`LinhaTempoPage` como parte desta proposta. Rejeitada por ampliar escopo; pode ser proposto como melhoria separada se a navegação sem pré-seleção se mostrar insuficiente na prática.

### 3. Modo GM só linka para o ItemManager, não duplica CRUD
**Decisão**: quando `isGm`/`isDono` (via `useEditMode`), a tela mostra um link/botão para abrir a Linha do Tempo com o `ItemManager`; nenhuma ação de criar/editar/excluir é implementada em `ItensPage.tsx`.
**Por quê**: evitar duas implementações de CRUD do mesmo recurso (uma em `ItemManager`, outra na tela nova) — isso duplicaria código e criaria risco de comportamento inconsistente entre as duas.
**Alternativa considerada**: mover o `ItemManager` inteiro para dentro da nova `ItensPage` e remover da Linha do Tempo. Rejeitada — fora do escopo desta proposta (que é só adicionar a visão pública) e mudaria um fluxo de GM já estabelecido sem necessidade.

## Risks / Trade-offs

- **Sem deep-link de sessão/evento (Decision 2), a navegação a partir de um Item é menos direta do que a partir de Local/Personagem** → aceito como trade-off de escopo; se o uso real mostrar que isso incomoda, é uma melhoria pequena e isolada para propor depois, não bloqueia esta entrega.
- **Nova aba na navegação da campanha em todas as campanhas, mesmo as que não têm nenhum Item cadastrado** → mitigado com um estado vazio (`EmptyState`, já usado em outras telas) explicando que nenhum Item foi cadastrado ainda, em vez de uma tela quebrada ou confusa.

## Migration Plan

Não há migração de dados. Entrega é aditiva (rota nova, aba nova) e não altera nenhuma tela existente além de adicionar uma entrada de navegação — pode ser implantada e revertida (remover a rota/aba) sem efeito em dados persistidos.
