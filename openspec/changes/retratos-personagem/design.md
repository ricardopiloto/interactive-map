# Design

## Context

Ver `proposal.md` - Why pra motivação completa. Estado atual relevante, confirmado por investigação (subagente, read-only):

- **Backend**: `NPC.retrato_url` (`backend/app/models/npc.py:38`), `PersonagemCreate`/`Update`/`Read.retrato_url` (`backend/app/schemas/personagem.py`), CRUD admin já persiste (`backend/app/routers/admin/personagens.py`), leitura pública já reescreve a URL (`backend/app/routers/public/personagens.py:34`, `public/npcs.py:31`). Categoria de upload `"portraits"` já é de primeira classe em `MEDIA_CATEGORIES` (`backend/app/services/media_paths.py:8`), com cache privado dedicado (`public/media.py:29`) e controle de acesso anônimo via `portrait_allowed_for_anonymous` (`media_acl.py:36-44`, espelhando `local_image_allowed_for_anonymous`). **Nenhuma mudança de backend é necessária.**
- **`frontend-v2/` já tem o campo e o upload, só não exibe**: `Personagem.retrato_url: string | null` (`frontend-v2/src/api/relacoes.ts:28`); `uploadPortrait` (linha 148-153) já funciona, já chamado pelo editor de Personagem (`RelationEditors.tsx:150-158`, campo `<Input type="file">` sem nenhuma prévia depois).
- **O mesmo campo, no mesmo registro de backend, já tem o padrão de exibição pronto em outro lugar do próprio `frontend-v2/`**: o editor de NPC acessado pela tela do **Mapa** (`frontend-v2/src/components/codex/MapEditors.tsx:363-376`) já mostra `{draft.retrato_url && <img src={draft.retrato_url} className="h-24 w-24 rounded-full object-cover" />}` acima do campo de arquivo. E `LocationInspector.tsx:50-57` já mostra `local.imagem_url` como `<img className="aspect-[16/9] w-full object-cover">` no topo do painel de detalhe de Local — o mesmo padrão a replicar pro painel de Personagem.
- **O grafo de Relações é SVG puro** (`RelationsGraph.tsx`), diferente do `frontend/` legado (`GraphStage.tsx`), cujo grafo é feito de `<div>`s HTML posicionados por CSS, onde o recorte circular da imagem era só `border-radius: 50%; overflow: hidden` num `<div>` com um `<img object-fit: cover>` dentro, com fallback pras iniciais via `onError` (`frontend/src/components/relacoes/GraphStage.tsx:152-167`, `DiscAvatar`). Em SVG, o equivalente é um `<clipPath>` com um `<circle>` aplicado a um elemento `<image>`.

## Goals / Non-Goals

**Goals:**
- Mostrar o retrato do Personagem (quando existir) nos três lugares onde ele já existia no `frontend/` legado: editor (prévia), painel de detalhe, nó do grafo.
- Reaproveitar exatamente os padrões visuais já usados em `frontend-v2/` pro mesmo campo noutra tela (`MapEditors.tsx`) e pro campo análogo de Local (`LocationInspector.tsx`), não inventar um padrão novo.
- Quando a imagem falhar ao carregar (404, URL quebrada), continuar mostrando as iniciais — nunca um ícone de imagem quebrada do navegador.

**Non-Goals:**
- Qualquer mudança de backend, schema, categoria de upload, cache ou controle de acesso de mídia — tudo já existe e já funciona.
- Qualquer ferramenta de recorte/edição de imagem na hora do upload — continua sendo só escolher um arquivo, como já é hoje.
- Mudar o comportamento de imagem de `Local` — já funciona, não é tocado por esta proposta.
- Reduzir o tamanho de upload/validação de tipo de arquivo já existente (`backend/app/services/uploads.py`, `allowed_image_type_list`/`max_upload_bytes`) — fora do escopo, nenhuma mudança.

## Decisions

### 1. Editor: copiar literalmente o padrão já usado em `MapEditors.tsx`
**Decisão**: em `RelationEditors.tsx` (`PersonagemEditor`), adicionar `{draft.retrato_url && <img src={draft.retrato_url} alt="" className="h-24 w-24 rounded-full object-cover" />}` imediatamente acima do `<Input type="file">` existente (linhas ~149-158); de passagem, igualar o `onChange` do input ao padrão de `MapEditors.tsx` (que já faz `event.target.value = ""` depois de ler o arquivo, permitindo reenviar o mesmo nome de arquivo em sequência — `RelationEditors.tsx` hoje não faz isso, inconsistência pequena, mas já que a mesma linha está sendo tocada, corrige junto).
**Por quê**: é literalmente o mesmo campo (`retrato_url`), do mesmo registro de backend (`NPC`), com o mesmo mecanismo de upload (`uploadPortrait`/`category: "portraits"`) — não há motivo pra inventar um padrão diferente do que já existe duas telas ao lado.

### 2. Painel de detalhe: copiar o padrão já usado em `LocationInspector.tsx`
**Decisão**: em `relacoes.tsx`, função `Profile`, renderizar `{person.retrato_url && <img src={person.retrato_url} alt={person.nome} className="aspect-square w-full object-cover" />}` (ou proporção equivalente à escolhida na implementação) no topo do painel, antes do nome/kicker — mesma posição relativa que `LocationInspector.tsx` usa pra `local.imagem_url` antes do conteúdo textual.
**Por quê**: mesmo raciocínio da Decision 1 — padrão já estabelecido no próprio `frontend-v2/` pra um painel de detalhe lateral irmão (Local).
**Alternativa considerada**: avatar pequeno e redondo ao lado do nome, em vez de imagem grande no topo. Rejeitada — o `frontend/` legado já mostrava a imagem grande no topo do painel de detalhe (`RelacoesPage.tsx:742-749`), e isso bate com o padrão já adotado pro painel de Local; manter os dois painéis irmãos visualmente consistentes é mais importante que uma variação sem pedido explícito.

### 3. Nó do grafo: `<clipPath>` circular + `<image>`, com fallback pras iniciais em caso de erro
**Decisão**: em `RelationsGraph.tsx`, pra cada nó com `person.retrato_url` não nulo, definir um `<clipPath id={`avatar-clip-${person.id}`}><circle r={radius} /></clipPath>` dentro de `<defs>` (o id de cada Personagem já é único e estável por campanha, não precisa de `useId()`) e renderizar `<image href={person.retrato_url} x={-radius} y={-radius} width={radius*2} height={radius*2} clipPath={`url(#avatar-clip-${person.id})`} preserveAspectRatio="xMidYMid slice" onError={...} />` por cima do `<circle>` de preenchimento sólido já existente (que continua lá, servindo de fundo caso a imagem demore a carregar ou falhe). As iniciais (`<text>`) só são renderizadas quando não há `retrato_url`, **ou** quando a imagem falhou ao carregar — rastreado por um `Set<number>` de ids com erro de carregamento (`onError` adiciona o id ao set), reproduzindo o mesmo comportamento de fallback que `DiscAvatar` já tinha no legado (`GraphStage.tsx:152-167`, via `onError` de um `<img>` HTML — aqui o equivalente é o evento `onError` do `<image>` SVG). O anel de destaque de PJ (`var(--seal)`) e o traço de seleção continuam exatamente como hoje, desenhados por cima/ao redor da imagem.
**Por quê**: `frontend-v2/`'s grafo é SVG puro (ao contrário do grafo legado em HTML/CSS) — `<clipPath>`+`<image>` é o equivalente direto e nativo de SVG pro recorte circular que o legado fazia com `border-radius`+`overflow:hidden` num `<div>`.
**Alternativa considerada**: trocar o grafo inteiro de SVG pra HTML/CSS (como o legado), pra poder reusar `border-radius`/`overflow:hidden` diretamente. Rejeitada — reescreveria um componente inteiro já funcional (edges em curva, marcadores de seta, gradientes de vínculo de duas vias) só pra evitar aprender o equivalente SVG de uma propriedade CSS; fora de proporção pro que foi pedido.

## Risks / Trade-offs

- **Imagens quebradas/lentas num grafo com muitos nós** (especialmente depois de `rede-relacoes-zoom-radial`, que pode ter dezenas de NPCs visíveis ao mesmo tempo) — mitigado pelo fallback de `onError` (Decision 3); o círculo de cor sólida já existente serve de placeholder enquanto a imagem carrega, sem layout shift (mesmo raio, mesma posição).
- **Duas telas de edição do mesmo registro divergindo de novo no futuro** (`MapEditors.tsx` e `RelationEditors.tsx` editam o mesmo `NPC`, mas são componentes separados) — aceito como já é hoje (fora do escopo desta proposta unificar os dois editores); só garantimos que os dois agora mostram prévia, não que viram o mesmo componente.

## Migration Plan

Não há migração de dados — `retrato_url` já existe e já é persistido pelo backend há tempo; esta proposta só adiciona exibição no frontend. Entrega é aditiva em três componentes já existentes, reversível sem efeito em dados.
