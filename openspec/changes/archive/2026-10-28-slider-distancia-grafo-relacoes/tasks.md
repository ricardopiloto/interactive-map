# Tasks

## 1. Layout

- [x] 1.1 Adicionar parâmetro opcional `spacing = 1` a `layoutRing`, `layoutRadialByTipo` e `layoutRadialByRelation` em `frontend-v2/src/lib/graphLayout.ts`, multiplicando os raios dos anéis e ajustando `origin`/`width`/`height`, sem alterar caixas nem `gap`
- [x] 1.2 Testes do layout: `spacing = 1` idêntico ao atual; `2` dobra os raios; `0.5` metade, sem NaN; `layoutRing` com 0 e 1 nó e `spacing != 1` sem NaN e com quadro finito; `pad` não escalado (origin/largura/altura corretos); determinismo; não sobreposição preservada para `spacing >= 1` (elenco grande)

## 2. Controle no grafo

- [x] 2.1 Estado `spacing` em memória em `RelationsGraph.tsx`; fator `2^(valor/50)` com slider inteiro −50..50; passar o fator ao layout e incluir no `useMemo` do `frame`
- [x] 2.2 Descartar `sessionShifts` ao mudar o fator; o `spacing` vale ao vivo, mas o efeito de enquadramento só reajusta a viewport em `onValueCommit` (fitToView sem seleção, foco no selecionado com seleção), preservando zoom/pan durante o arrasto; seleção, filtro e troca de campanha continuam reenquadrando como hoje
- [x] 2.3 Estender `components/ui/slider.tsx` para repassar props/aria ao `Thumb` e validar o estilo no tema paper-parchment; UI em `GraphControls`: painel `rounded-2xl` em coluna, rótulo, `Slider` com `value={[v]}`, botão "Padrão" e `onDoubleClick` no Root para resetar; `aria-label`, `aria-valuetext` com `Intl.NumberFormat(i18n.language)`; conferir a legenda "Tipos de laço" e 375 px
- [x] 2.4 Textos pt-BR/en em `locales/{pt-BR,en}/relacoes.json`

## 3. Testes e verificação

- [x] 3.1 Stub de `ResizeObserver` (e `PointerEvent`/`hasPointerCapture`, se preciso) no setup de teste; testes de `RelationsGraph.test.tsx` por teclado (setas/Home/End): slider no meio por padrão; mover altera as posições sem reenquadrar; commit reenquadra; "Padrão" e duplo clique restauram; arrastes descartados; `aria-valuetext` formatado
- [x] 3.2 `npx vitest run`, `npx tsc --noEmit`, `npx eslint src`; conferir visualmente no navegador (elenco grande a 0,5× e 2×, com e sem seleção)
- [x] 3.3 Divisão do apply no codex: execução 1 (grupo 1), execução 2 (grupos 2 e 3.1); verificação visual do coordenador (3.2)
- [x] 3.4 Atualizar o README/CHANGELOG ([Unreleased]) com o novo controle

## 4. Revisão de UI (pedido posterior)

- [x] 4.1 Escala assimétrica em `graphLayout.ts` (`spacingFromSlider`: v<0 → `2^(v/25)`, v>=0 → `2^(v/50)`) e testes (−50→0,25; 0→1 exato; 50→2)
- [x] 4.2 Separar o slider do painel de zoom em item próprio; rótulos «Perto»/«Longe» (pt-BR/en), sem rótulo de padrão e sem botão «Padrão»; duplo clique reseta; inicia centralizado; posição desktop/mobile conforme design; ajustar testes e i18n
- [x] 4.3 Conferir no navegador (1440 px e 375 px) e atualizar CHANGELOG/README
