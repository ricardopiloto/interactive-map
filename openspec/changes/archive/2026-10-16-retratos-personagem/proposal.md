# Proposal

## Why

O usuário notou, testando `frontend-v2/` contra uma cópia real de produção, que os retratos dos Personagens — visíveis tanto no grafo de Relações quanto na descrição de cada Personagem no `frontend/` legado — desapareceram na reescrita.

Investigação confirmou que isso é um buraco de exibição em `frontend-v2/`, não uma lacuna de backend: o backend nunca perdeu nada. `NPC.retrato_url` (`backend/app/models/npc.py:38`) continua no modelo, `PersonagemCreate`/`Update`/`Read` continuam com `retrato_url`, o CRUD admin persiste o campo, a leitura pública já devolve a URL reescrita, e a categoria de upload `"portraits"` já é de primeira classe em `backend/app/services/media_paths.py` (`MEDIA_CATEGORIES`), com cache privado dedicado e controle de acesso anônimo (`portrait_allowed_for_anonymous`) já implementados e testados. Nada disso precisa mudar.

Em `frontend-v2/`, o campo `retrato_url` também já existe no tipo `Personagem` (`frontend-v2/src/api/relacoes.ts:28`) e **o upload já funciona**: `uploadPortrait` (`relacoes.ts:148-153`) já envia pra `admin/uploads` com `category: "portraits"`, e o editor de Personagem na tela de Relações (`RelationEditors.tsx`, `PersonagemEditor`) já tem o campo de arquivo que chama esse upload. O que falta é só **exibir** o resultado, em três lugares:

1. O próprio editor não mostra nenhuma prévia depois do upload (diferente do editor de NPC acessado pela tela do Mapa, `MapEditors.tsx`, que já tem essa prévia pro mesmo campo do mesmo registro de backend).
2. O painel de detalhe do Personagem na tela de Relações (`Profile`, em `relacoes.tsx`) nunca renderiza `retrato_url`.
3. Os nós do grafo de Relações (`RelationsGraph.tsx`) são só círculos com iniciais — nunca mostram a imagem.

`openspec/changes/frontend-v2-paper-parchment/design.md` promete "paridade funcional completa" com `frontend/` como Goal explícito, e não lista retratos de Personagem como Non-Goal/adiado em lugar nenhum (diferente da tela de Itens públicos, que teve esse tratamento explícito) — é um esquecimento genuíno contra a própria meta daquela change, não uma decisão consciente de corte.

## What Changes

- **Prévia no editor de Personagem** (`frontend-v2/src/components/codex/RelationEditors.tsx`, `PersonagemEditor`): depois de um upload bem-sucedido (ou ao editar um Personagem que já tem retrato), mostrar `<img src={draft.retrato_url}>` acima/ao lado do campo de arquivo — mesmo padrão já usado em `MapEditors.tsx` pro editor de NPC da tela do Mapa (`h-24 w-24 rounded-full object-cover`).
- **Retrato no painel de detalhe** (`frontend-v2/src/routes/relacoes.tsx`, função `Profile`): quando `person.retrato_url` existir, mostrar a imagem no topo do painel — mesmo padrão já usado em `LocationInspector.tsx` pra `local.imagem_url` (`<img>` de largura total, `object-cover`, antes do conteúdo textual).
- **Retrato nos nós do grafo** (`frontend-v2/src/components/codex/RelationsGraph.tsx`): quando `person.retrato_url` existir, recortar a imagem em círculo dentro do próprio nó SVG (`<clipPath>` + `<image>`), substituindo (ou sobrepondo) o preenchimento de cor sólida; as iniciais continuam como estão hoje quando não há retrato, e também como *fallback* caso a imagem falhe ao carregar (o grafo legado em `frontend/` já tinha esse comportamento de fallback via `onError`, reproduzido aqui com o equivalente SVG).
- **Sem mudança nenhuma de backend, schema, upload ou controle de acesso** — tudo isso já existe e já funciona; confirmado lendo `backend/app/services/uploads.py`, `media_paths.py`, `media_acl.py` e `url_rewrite.py` por completo.

## Capabilities

### New Capabilities
- `retratos-personagem`: cobre a exibição do retrato de um Personagem no grafo de Relações, no editor de Personagem e no painel de detalhe — não existia nenhuma spec cobrindo isso antes.

### Modified Capabilities
(nenhuma)

## Impact

- **Frontend (`frontend-v2/`)**: `src/components/codex/RelationEditors.tsx` (prévia no editor), `src/routes/relacoes.tsx` (retrato no painel de detalhe `Profile`), `src/components/codex/RelationsGraph.tsx` (retrato recortado em círculo nos nós do grafo via SVG).
- **Backend**: nenhuma mudança — modelo, schema, CRUD, categoria de upload, cache e ACL de mídia já existem e já cobrem retrato de Personagem.
- **Dados/migração**: nenhuma.
- **`frontend-v2-paper-parchment`**: nenhuma edição nessa change; esta proposta fecha uma lacuna contra a meta de paridade funcional já declarada lá, sem precisar reabrir ou editar aquela change.
