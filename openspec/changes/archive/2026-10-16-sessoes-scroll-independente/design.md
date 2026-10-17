# Design

## Context

Ver `proposal.md` - Why pra motivação completa. Estado atual, lido por completo (`frontend-v2/src/routes/sessoes.tsx:242-308`):

```tsx
<main className="mx-auto grid min-h-screen max-w-6xl gap-10 px-4 pt-24 pb-28 lg:grid-cols-[300px_1fr] lg:pb-16">
  <nav aria-label={...} className="lg:sticky lg:top-24 lg:self-start">
    {/* lista de sessões — em mobile, `ol` horizontal com overflow-x-auto; em lg:, coluna vertical */}
  </nav>
  {current && (
    <article className="max-w-2xl animate-in fade-in" key={current.id}>
      {/* descrição da sessão selecionada */}
    </article>
  )}
  {draft && <SessionEditor ... />}
  <AlertDialog ... />
</main>
```

- `min-h-screen` no `<main>`: a página cresce conforme o conteúdo, scroll é do documento/`window` inteiro — é isso que faz a lista e a descrição "competirem" pelo mesmo scroll.
- `lg:sticky lg:top-24 lg:self-start` no `<nav>`: gruda a lista no topo enquanto a página rola, mas não dá um scroll próprio pra lista — se ela for mais alta que a viewport, ela só continua crescendo (sticky não limita altura).
- Padrão já existente noutra tela pra "coluna com altura limitada e scroll próprio": `LocationInspector.tsx:45-50` — contêiner externo com `max-h-[62vh] flex flex-col overflow-hidden`, conteúdo interno com `overflow-y-auto`.
- Páginas de mapa (`index.tsx:261`, `rota.tsx:469`) usam `<main className="fixed inset-0">` — um padrão diferente (tela cheia, sem padding de conteúdo tipo documento), não diretamente aplicável aqui sem ajuste, já que Sessões é uma tela de leitura/documento com `pt-24`/`pb-28` como respiro visual pro TopBar/nav inferior fixos, não uma tela full-bleed.
- `SessionEditor` (drawer/diálogo de edição) e `AlertDialog` (confirmação de exclusão) são componentes de overlay (shadcn/ui, baseados em portal/`position: fixed`) — não devem ser afetados por mudanças no fluxo de layout do `<main>`, mas vale confirmar visualmente que continuam abrindo por cima de tudo corretamente depois da mudança.

## Goals / Non-Goals

**Goals:**
- Em telas grandes (`lg:` e acima, onde a lista e a descrição já aparecem lado a lado), a lista de sessões e a descrição da sessão selecionada SHALL ter scroll vertical independente uma da outra — rolar uma não afeta a posição de rolagem da outra, e a descrição SHALL permanecer sempre alcançável sem precisar rolar além do fim da lista.
- Em telas pequenas (mobile, abaixo de `lg:`), o comportamento de rolagem atual (página inteira, lista horizontal no topo) SHALL permanecer exatamente como está — esta proposta não muda nada no layout mobile.
- Nenhuma mudança funcional (CRUD, sugestão por IA, chips, alertas de inconsistência) — só layout/scroll.

**Non-Goals:**
- Redesenhar visualmente a lista ou a descrição (cores, tipografia, espaçamento interno) — só a estrutura de scroll muda.
- Aplicar esse padrão de scroll independente a outras telas que ainda não têm (ex. Timeline, Relações) — fora do escopo, pode ser uma proposta separada se fizer sentido depois.

## Decisions

### 1. `<main>` vira um contêiner de altura de viewport, com overflow controlado por breakpoint
**Decisão**: trocar `min-h-screen` por algo equivalente a `fixed inset-0 overflow-y-auto lg:overflow-hidden` no `<main>` — mantendo o mesmo `pt-24 pb-28` (ou equivalente) como respiro do TopBar/nav inferior fixos. Em mobile (abaixo de `lg:`), `overflow-y-auto` no próprio `<main>` preserva o scroll de página inteira atual (um só scroll, como já é hoje). A partir de `lg:`, `overflow-hidden` no `<main>` desativa esse scroll único, e cada coluna (`<nav>`, `<article>`) ganha `lg:h-full lg:overflow-y-auto` — preenchendo a altura do grid row e rolando de forma independente.
**Por quê**: é a menor mudança estrutural que cria duas regiões de scroll independentes em desktop sem alterar nada do comportamento mobile já existente (que não foi pedido pra mudar).
**Alternativa considerada**: usar `position: sticky` com uma altura máxima calculada (`max-h-[calc(100vh-Npx)]`) em vez de `fixed inset-0`. Rejeitada — `sticky` por si só não limita altura (é exatamente a limitação do código atual que está sendo corrigida); seria preciso combinar `sticky` com `max-h`/`overflow-y-auto` de qualquer forma, o que acaba sendo mais complexo que simplesmente fixar o contêiner externo.

### 2. `<nav>` perde o `sticky`, ganha `overflow-y-auto` próprio
**Decisão**: remover `lg:sticky lg:top-24 lg:self-start` do `<nav>`; adicionar `lg:h-full lg:overflow-y-auto` (mais um `lg:pr-2` ou equivalente, pra a barra de rolagem não colar no texto).
**Por quê**: com o `<main>` agora de altura fixa (Decision 1), a lista já fica inteiramente dentro da viewport por construção — não precisa mais de `sticky` pra "acompanhar" a rolagem da página, porque não há mais uma rolagem de página da qual acompanhar; ela tem a sua própria.

### 3. `<article>` ganha `overflow-y-auto` próprio
**Decisão**: adicionar `lg:h-full lg:overflow-y-auto` (e um `lg:pr-2`/padding equivalente) no `<article>` da descrição.
**Por quê**: mesma razão da Decision 2 — a descrição agora rola dentro da sua própria altura de viewport, sem depender do tamanho da lista ao lado.

## Risks / Trade-offs

- **`SessionEditor` (drawer de edição) e `AlertDialog` (confirmação de exclusão) precisam continuar funcionando normalmente** depois da mudança de `overflow`/`position` do `<main>` — ambos já são baseados em portal/overlay fixo (shadcn/ui), então não deveriam ser afetados, mas é um ponto a confirmar visualmente na validação (task dedicada), não só por inferência.
- **Scrollbars visíveis em duas colunas simultaneamente** pode ficar um pouco diferente visualmente do scroll único de hoje — aceito como parte do pedido (é literalmente "um scroll pra lista, outro pra descrição").

## Migration Plan

Não há migração de dados — mudança é 100% de CSS/estrutura de layout no frontend. Entrega é isolada numa única tela; reversível revertendo as classes de `overflow`/`position` sem efeito em dados.
