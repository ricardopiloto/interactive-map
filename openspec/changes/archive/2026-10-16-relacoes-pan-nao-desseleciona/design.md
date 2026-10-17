# Design

## Context

Hoje, em `RelationsGraph.tsx`, o `<svg>` tem:

```tsx
onClick={() => {
  if (consumeSuppressedClick()) return;
  onSelect(null);
}}
```

`skipClickRef` / `consumeSuppressedClick()` só é armado quando um **nó** foi arrastado além de `GRAB_SLOP_PX` (4px). O pan da viewport (área vazia via `react-zoom-pan-pinch`) ainda gera um `click` no SVG ao soltar — e esse click limpa a seleção. Arrastar nó já está coberto; o buraco é só o pan (e qualquer arrasto que não passe por `beginGrab`).

## Goals / Non-Goals

**Goals:**
- Suprimir `onSelect(null)` quando o gesto na área vazia foi um arrasto (pan), não um clique.
- Reutilizar o limiar de slop já existente (`GRAB_SLOP_PX`) para manter sensação consistente com o arrasto de nó.
- Cobrir com teste unitário/de interação que pan com seleção ativa não chama `onSelect(null)`.

**Non-Goals:**
- Mudar layout radial, foco de viewport na seleção, ou deep-link `?personagem=`.
- Alterar o comportamento de toggle ao clicar num nó.
- Trocar a biblioteca de zoom/pan.

## Decisions

### 1. Detectar arrasto na área vazia no próprio grafo, não depender de callbacks do TransformWrapper
**Decisão**: no estágio/SVG (ou wrapper do `TransformComponent`), rastrear `pointerdown` → `pointermove` → `pointerup`/`click` na área vazia. Se o deslocamento do ponteiro ultrapassar `GRAB_SLOP_PX` antes do `click`, armar o mesmo `skipClickRef` (ou equivalente) usado pelo arrasto de nó, para que o `onClick` do SVG não chame `onSelect(null)`.

**Alternativa considerada**: usar `onPanning` / `onPanningStop` do `TransformWrapper`. Rejeitada como única solução porque acopla desseleção a um detalhe interno da lib e não cobre gestos que movem o ponteiro sem o pan “oficial” (ex. botão secundário, ou futuro desligar pan). Pode ser usada como sinal complementar se o pointer tracking for insuficiente, mas o contrato principal fica no gesto do ponteiro.

**Alternativa considerada**: remover o `onClick` do SVG e desselecionar só por um botão/ESC. Rejeitada — o clique na área vazia é o padrão esperado e já documentado pelo uso atual.

### 2. Unificar o “suppress click após drag” num único caminho
**Decisão**: o mecanismo de suppress após arrasto de nó e após pan na área vazia deve compartilhar o mesmo flag (`skipClickRef` + `consumeSuppressedClick`), para o handler de desseleção continuar um único `onClick` previsível.

### 3. Clique em aresta (vínculo) conta como área vazia
**Decisão**: clicar numa linha/rótulo de vínculo (sem ser nó) continua desselecionando, desde que seja clique simples. Não há seleção de vínculo nesta tela.

## Impact analysis (outras funcionalidades do grafo)

`onSelect` no grafo é `pick` em `relacoes.tsx`. `pick(null)` não só limpa o destaque: também `setIsolate(false)`, remove `?personagem=` da URL, troca o layout (`layoutRadialByRelation` → `layoutRadialByTipo`) e o `useEffect` de foco chama `fitToView` — destruindo o pan que o usuário acabou de fazer. Por isso pan → desseleção acidental é um bug cascata; o fix é **conservador** se só ampliar o suppress de click.

| Superfície | Depende de seleção / click / pan? | Impacto do fix |
|---|---|---|
| Pan área vazia + seleção / isolate / `?personagem=` | Sim — hoje pan dispara `onSelect(null)` | **Corrige** (preserva URL, isolate, layout radial e pan) |
| Clique simples área vazia | `onClick` SVG → `pick(null)` | **Preservar** (só desseleciona se movimento ≤ slop) |
| Clique / toggle em nó | `stopPropagation` no nó; `beginGrab` + `skipClick` se moveu | **Neutro** se tracking da área vazia **não** interceptar nós |
| Arrastar nó | Já arma `skipClickRef`; `panning.disabled` enquanto `grabbedId` | **Neutro** se não `stopPropagation` na área vazia |
| Zoom roda / pinça / botões ± / “Ajustar à tela” | Não passam pelo `onClick` de desseleção | **Neutro** |
| Filtro tipo / status / busca / lista lateral / Profile fechar | Fora do SVG ou `pick` explícito | **Neutro** |
| Labels/arestas de vínculo | Contam como área vazia (Decision 3) | Clique simples ainda desseleciona; arrasto sobre aresta = pan |
| `sessionShifts` (reposicionamento de visita) | Independente; só some ao trocar slug | **Neutro**; deixar de desselecionar no pan evita reset de layout que “joga fora” o contexto visual |
| Deep-link `?personagem=` (e2e seleção) | Seleção inicial via URL | **Melhora** se o usuário pan após abrir o link |

### Constraint crítica de implementação

Nós já fazem `onMouseDown`/`onPointerDown` com `stopPropagation` para o TransformWrapper não iniciar pan no nó. O tracking da **área vazia** MUST NOT chamar `stopPropagation`/`preventDefault` em `pointerdown`/`mousedown`, senão o pan da lib quebra. Só observar o deslocamento e armar `skipClickRef` antes do `click`.

Estado intermediário do tracking (origem / `moved`) MUST ser limpo em `pointerup`/`pointercancel` mesmo sem `click`, para não “envenenar” o próximo clique simples.

## Risks / Trade-offs

- **[Risco] Clique “sujo” (mão treme > 4px) não desseleciona** → Mitigação: `GRAB_SLOP_PX = 4` já é o limiar usado em nós; manter o mesmo valor. Se reclamações aparecerem, ajustar a constante uma vez para ambos os gestos.
- **[Risco] `click` dispara em timing diferente do `pointerup` (rAF limpa o flag cedo demais)** → Mitigação: o padrão atual (set flag + `requestAnimationFrame` para limpar) já funciona para nós; reutilizar o mesmo padrão para pan.
- **[Risco] Eventos de pan capturados pelo TransformWrapper não chegam ao SVG** → Mitigação: escutar no wrapper do stage (`relations-stage` / wrapper do transform) se o SVG não receber `pointerdown`; validar no teste de interação simulando pointer move + click no stage.
- **[Risco] `stopPropagation` acidental na área vazia quebra pan** → Mitigação: constraint acima; regressão e2e/unitária de pan (`relacoes-zoom.spec.ts` já cobre pan sem seleção).
- **[Risco] Flag `moved` residual impede desseleção no clique seguinte** → Mitigação: limpar tracking em `pointerup`/`pointercancel`; `consumeSuppressedClick` consome o flag no click do pan.

## Migration Plan

Sem migração de dados. Deploy = frontend-v2. Rollback = reverter o commit do componente/teste.
