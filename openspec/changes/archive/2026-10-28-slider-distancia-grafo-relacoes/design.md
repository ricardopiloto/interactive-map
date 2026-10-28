# Design

## Context

`graphLayout.ts` calcula dois layouts radiais determinísticos (`layoutRadialByTipo`, `layoutRadialByRelation`, mais o caso de anel único `layoutRing`). Os raios vêm de `ringRadius(count, separation)` com `separation = minCenterDistance(box, gap)` (diagonal do card + `NODE_GAP`), o que garante a não sobreposição. `RelationsGraph.tsx` memoriza o `frame`, aplica `sessionShifts` (arraste só em memória) e reenquadra a viewport num efeito quando o `frame` muda. O painel `GraphControls` (zoom, ajustar à tela) já existe, e `components/ui/slider.tsx` (Radix) também.

## Goals / Non-Goals

**Goals:**
- Slider simétrico em torno do padrão (meio = layout atual, bit a bit).
- Sem backend e sem dependência nova.
- Acessível e consistente com o design-system.

**Non-Goals:**
- Persistir a preferência (localStorage/conta).
- Layout por forças (física) ou outros algoritmos.
- Mudar o tamanho dos nós, fontes ou espessura das arestas.

## Decisions

1. **Fator multiplicativo no raio, não na separação.** `layout*` ganha um parâmetro opcional `spacing = 1` que multiplica os raios finais dos anéis (e o `origin`/largura do quadro, para o grafo continuar centrado). Caixas e `gap` ficam intactos. Com `spacing = 1` o resultado é idêntico ao atual (teste de igualdade). Alternativa rejeitada: escalar `gap`/`box`, que mexeria em mais lugares e não é linear no que o usuário percebe como "distância".
2. **Escala logarítmica assimétrica.** O slider é inteiro de −50 a +50 (passo 1, padrão 0): para `v >= 0`, `fator = 2^(v/50)` (1× … 2×); para `v < 0`, `fator = 2^(v/25)` (1× … 0,25×). O meio é exatamente 1× e a metade esquerda dá mais alcance para aproximar. Alternativa rejeitada: escala simétrica 0,5×–2× (aproximar pouco, contra o pedido).
3. **Aproximar além do padrão pode sobrepor.** Limitar o lado esquerdo à não sobreposição o deixaria sem efeito (o padrão já é o mínimo sem sobreposição). A pessoa pediu aproximar; a sobreposição é consequência aceita e documentada na spec (requisito modificado). Abaixo de 1× o `frame` ainda é válido (sem NaN).
4. **Estado em memória no `RelationsGraph`**, ao lado de `sessionShifts`. Persistir em localStorage foi descartado por ora: o padrão ideal é sempre o ponto de partida e evita estados "esquisitos" ao voltar à página. É barato adicionar depois.
5. **Mudou o fator → descarta `sessionShifts`.** Os deslocamentos são relativos às posições antigas; escalá-los seria confuso.
6. **Fator ao vivo, reenquadramento só ao soltar.** O `spacing` entra no `frame` a cada passo do slider (feedback imediato), mas o zoom/pan da pessoa não muda durante o arrasto; o reenquadramento (`fitToView` sem seleção, foco no selecionado com seleção) ocorre em `onValueCommit`. Hoje o efeito de `focusViewport` roda a cada mudança de `frame`; ele passa a distinguir mudança por seleção/filtro/campanha (reenquadra como hoje) de mudança por fator (não reenquadra até o commit), por exemplo com um `frameReason`/contador de commit no estado. O valor visual do slider é um estado separado do `spacing` aplicado quando necessário. Alternativa rejeitada: reenquadrar a cada tick (zera o zoom da pessoa).
7. **Posição na UI:** o painel de zoom volta a ser a pílula de uma linha (`GraphControls`). O slider vira um item à parte (componente próprio, `glass`, `rounded-full`), com «Perto» à esquerda e «Longe» à direita, sem rótulo de padrão e sem botão «Padrão»; duplo clique (`onDoubleClick` no Root) reseta. Posição: desktop, centralizado na base da área do grafo (descontando o painel lateral `lg:pr-[400px]`); mobile, logo abaixo da pílula de zoom, acima do painel de lista. Conferir a legenda «Tipos de laço» e 375 px. O wrapper `components/ui/slider.tsx` encaminha `aria-label`/`aria-valuetext` ao thumb; `value={[v]}`; `aria-valuetext` com `Intl.NumberFormat(i18n.language)` («1×», «0,25×», «2×»).
8. **Textos** em `relacoes.json` (pt-BR/en): `graph.distanceClose`, `graph.distanceFar`, `graph.distanceValue` ("{{valor}}×").

## Risks / Trade-offs

- Elencos muito grandes a 2× ficam enormes: mitigado pelo "Ajustar à tela" e pelo reenquadramento automático.
- Sobreposição abaixo de 1× (até 0,25×) pode esconder nomes: é escolha da pessoa e reversível com duplo clique ou voltando ao centro.
- Recalcular o `frame` a cada tick em elencos grandes: o layout é O(n) e memoizado; se pesar, aplicar o fator só ao soltar (`onValueCommit`), mantendo o valor visual do slider em estado separado.
- jsdom não tem `ResizeObserver` e o Thumb do Radix o usa: os testes precisam de um stub.
