# Research: Botão "1:1" ajusta a tela pra mostrar todos os tokens (Relações)

Sem `[NEEDS CLARIFICATION]` — causa raiz em [BKLG-028](../../docs/v2/backlog.md#bklg-028-bugdesign--botão-11-no-grafo-de-relações-não-ajusta-a-tela-para-mostrar-todos-os-tokens); assunção da spec deixa o rótulo ao plan.

## Decisão 1 — Fit-to-view com o transform actual (não reinventar o sistema de coords)

**Decisão**: Manter `transform: translate(viewportCenter + pan) scale(scale)` com `transform-origin: 0 0`. Para um bbox de conteúdo com centro `(cx, cy)` e tamanho `(cw, ch)`:

1. `scale = clampScale(min(usableW / (cw + pad), usableH / (ch + pad)))`
2. Cap adicional: `scale = min(scale, 1)` — **não ampliar** além do zoom “natural”; só reduzir para caber.
3. `pan = { x: -scale * cx, y: -scale * cy }` para o centro do conteúdo mapear ao `viewportCenter` (centro da área útil).

BBox por token: centro `positions.get(id)` ± `NODE_W/2`, `NODE_H/2` (o nó é desenhado com esse offset).

**Rationale**: Confirmado no código — world point `p` → ecrã `viewportCenter + pan + scale * p`. A fórmula de pan centrado segue directamente. Cap em 1 evita o zoom “exageradamente próximo” do edge case de 1 token / grafo pequeno (aceitação 2 + edge case).

**Alternatives considered**:
- Continuar reset `scale=1, pan=0` — falha FR-001.
- Permitir zoom-in até `MAX_SCALE` no fit — viola “razoável” com 1 token.
- Mudar `transform-origin` para centro — breaking change desnecessária.

## Decisão 2 — Área útil = mesma medida do painel flutuante

**Decisão**: O fit MUST usar a mesma rectângulo útil que já calcula `measureUsableCenter` (stage minus overlap do `.map-panel` em baixo ou à esquerda). Extrair medição partilhada (ex. `readUsableViewport(stage): { left, top, width, height, center }`) para o resize effect e o clique do botão não divergirem.

**Rationale**: Spec assume “área do canvas disponível”; ignorar o painel faria “caber” tokens por baixo do painel.

**Alternatives considered**: Usar só `getBoundingClientRect()` do stage — incorrecto com painel expandido.

## Decisão 3 — Conjunto de tokens = os que `isVisible` renderiza

**Decisão**: Iterar `personagens.filter((p) => isVisible(p.id))` com posição em `positions`. A lista já chega status-filtrada do pai; `isolate` esconde via `isVisible`. Busca só esmaece — tokens dimmed **contam** no fit (ainda estão no canvas).

**Rationale**: FR-002 / SC-001: “visíveis” = o que está no grafo, não a campanha inteira. Não inventar segundo critério de filtro.

**Alternatives considered**: Fit só em `matchedIds` da busca — esconderia o resto do grafo ainda desenhado; confuso.

## Decisão 4 — Zero tokens: no-op seguro; não crashar

**Decisão**: Se nenhum token visível, `fitView` não altera scale/pan (ou opcionalmente `scale=1, pan={0,0}`). Preferir **no-op** para não surpreender quem filtrou tudo.

**Rationale**: FR-004 / SC-002.

**Alternatives considered**: Forçar reset 1:1 — também aceitável; no-op é mais simples e previsível.

## Decisão 5 — Rótulo: i18n “Ajustar” / “Fit”, não “1:1”

**Decisão**: Substituir o texto hardcoded `1:1` por `t('graph.fitView')` (pt-BR: «Ajustar»; en: «Fit») e `aria-label={t('graph.fitViewAria')}` descrevendo fit-to-view. Manter o mesmo controlo/posição junto aos botões de zoom.

**Rationale**: Assunção da spec — “1:1” deixa de ser verdade literal; constituição V exige chaves. Evitar ícone novo sem design system.

**Alternatives considered**: Manter “1:1” mentiroso — rejeitado. Ícone só — pior a11y sem aria clara (aria sozinha ok, mas label visível ajuda).

## Decisão 6 — Padding constante

**Decisão**: Padding ~24–32px em cada lado do bbox antes de calcular a escala (`FIT_PADDING`), para tokens não colarem à borda.

**Rationale**: UX básica de fit-to-view; valor exacto pode afinar no implement sem nova spec.
