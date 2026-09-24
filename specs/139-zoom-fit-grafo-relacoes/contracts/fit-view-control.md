# Contract: Controlo de ajustar vista (fit) no grafo de Relações

**Surface**: UI — botão de vista em `GraphStage` (ex-“1:1”) em `/c/:slug/relacoes`.

## Comportamento ao clicar

1. Determinar tokens **visíveis** (mesma regra de render: `isVisible` sobre `personagens` já filtrados pelo pai).
2. Se zero tokens: no-op (scale/pan inalterados); MUST NOT lançar.
3. Senão: bbox axis-aligned em world space usando centro do nó ± `NODE_W/2`, `NODE_H/2`.
4. Medir área útil do canvas (stage minus overlap do painel flutuante, igual ao centro usable).
5. Calcular `scale` para caber o bbox com padding, depois:
   - `scale = min(scale, 1)` (não zoom-in no fit)
   - `scale = clamp(scale, MIN_SCALE, MAX_SCALE)`
6. `pan = -scale * center(bbox)` sob o transform `translate(viewportCenter + pan) scale(scale)`, origem `(0,0)`.
7. Aplicar `setScale` / `setPan`.

## Copy (i18n)

| Chave | pt-BR (proposta) | en (proposta) |
|-------|------------------|---------------|
| `graph.fitView` | Ajustar | Fit |
| `graph.fitViewAria` | Ajustar a vista para mostrar todos os personagens | Fit view to show all characters |

O texto literal `1:1` MUST NOT permanecer como rótulo do botão.

## Garantias

- SC-001: após o clique, todos os tokens do passo 1 estão dentro da área útil (dentro da tolerância do padding/clamp a `MIN_SCALE` — se o grafo for tão grande que mesmo `MIN_SCALE` não cabe, ainda assim MUST aplicar o mínimo e centrar; documentar no quickstart como limite do produto).
- Clique / zoom ± / pan manual existentes MUST permanecer intactos.
- Isolado de spec 138 (espaçamento) e 135/136 (hover).
