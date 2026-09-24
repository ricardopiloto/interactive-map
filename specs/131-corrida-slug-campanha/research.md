# Research: Corrigir travamento ao entrar numa campanha vindo de fora

Sem marcadores `[NEEDS CLARIFICATION]` na spec — a causa raiz já foi investigada e confirmada diretamente no código antes de escrever a spec (registrada em `BKLG-019`). Este documento consolida essa investigação no formato Decisão/Racional/Alternativas.

## Decisão 1 — Onde corrigir: `MapPage.tsx`, não `campaignSlug.ts`

**Decisão**: passar o `slug` (já disponível via `useParams()` em `MapPage`) explicitamente para `campaignApi.listWaypoints(linkedOnly, slug)`.

**Racional**: `campaignApiPrefix(slug?: string)` já aceita um slug explícito como override do estado de módulo — é o mecanismo mais direto e já existente pra evitar depender de `activeSlug` estar setado a tempo. `MapPage` é o único ponto que dispara `listWaypoints` no efeito de montagem sem passar por um fluxo que já garanta o slug (ex.: `RotaPage` também chama, mas via `reloadWaypoints`, que roda depois de outras verificações — não apresentou o mesmo sintoma reportado).

**Alternativas consideradas**:
- **Mudar `CampaignShell` pra `useLayoutEffect`**: efeitos de layout ainda seguem a mesma ordem filho-antes-do-pai no React — não resolveria a corrida.
- **Setar `activeSlug` durante a renderização (fora de efeito)**, direto no corpo de `CampaignShell`: resolveria de forma mais ampla (qualquer chamada futura, não só `listWaypoints`), mas é uma mudança de padrão mais arriscada num módulo compartilhado por toda a aplicação, para um bug hoje confirmado em um único call site. Fica registrado como possível endurecimento futuro, não escolhido aqui por ser desproporcional ao escopo do bug.
- **Adicionar um guard no efeito do `MapPage`** (`if (!getCampaignSlug()) return`): evitaria o crash, mas simplesmente pularia a primeira tentativa de carregar waypoints, exigindo uma renderização adicional (ou efeito de re-tentativa) pra realmente carregar os dados — pior experiência que corrigir a causa (SC-002 da spec exige carregar já na primeira renderização).

## Decisão 2 — `ErrorBoundary` fica fora desta correção

**Decisão**: não adicionar `ErrorBoundary` nesta feature.

**Racional**: o `BKLG-019` já registra isso como "item separado" — é um endurecimento geral da aplicação (qualquer erro futuro, não só este), com escopo e decisões de UX próprias (que tela de erro mostrar, se tem botão de retry, granularidade — por rota? por página?). Resolver a causa raiz (Decisão 1) já elimina o sintoma reportado sem precisar dessa peça maior.

**Alternativas consideradas**: fazer as duas juntas nesta mesma spec — descartado por misturar uma correção pontual e comprovada com uma decisão de arquitetura de tratamento de erro que merece discovery própria.
