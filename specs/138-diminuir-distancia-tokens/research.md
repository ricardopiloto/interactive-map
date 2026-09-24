# Research: Diminuir a distância entre tokens no grafo de Relações

Sem `[NEEDS CLARIFICATION]` bloqueante — a spec permite afinar o valor exacto com QA visual desde que ~30% e sem sobreposição. Decisões abaixo fecham o “não totalmente decidido” do [BKLG-027](../../docs/backlog/backlog.md#bklg-027-design--diminuir-a-distância-entre-os-tokens-no-grafo-de-relações-em-30).

## Decisão 1 — Cortar as **duas** bases (overview 120 e foco 240), não só `OVERVIEW_SPACING`

**Decisão**: Aplicar ≈30% a:
- `COMPACT_INNER_SPACING_MIN` / `OVERVIEW_SPACING`: **120 → 84** (`Math.round(120 * 0.7)`)
- Default `espacamento` em `GraphStage`: **240 → 168** (`Math.round(240 * 0.7)`)

**Rationale**: Confirmado no código — a vista geral usa `OVERVIEW_SPACING` (120); o foco usa `espacamento` default **240** para o anel exterior e como input de `focusInnerSpacing`. Baixar só 120 deixaria o foco (caso 4–6 = 240, esparso = 312) intacto e falharia FR-001 (“visão geral **e** visão de foco”). Manter a razão 1∶2 (84/168) preserva a hierarquia overview vs foco das specs 087–089.

**Alternatives considered**:
- Só `OVERVIEW_SPACING` — incompleto face FR-001.
- Multiplicar `spacing` dentro de `ringMinRadius` por 0.7 — esconde a alavanca e complica factores compact/sparse.
- Alterar `COMPACT_INNER_FACTOR` / `TIGHTEN` / `SPARSE_INNER_FACTOR` — viola FR-002 / assunção (não reabrir 086–089).

## Decisão 2 — Factores relativos intactos; derivados esperados após a mudança

**Decisão**: Não alterar `COMPACT_INNER_FACTOR` (2/3), `COMPACT_INNER_TIGHTEN` (0.6), `SPARSE_INNER_FACTOR` (1.3), nem limiares 6 / 3.

Com `espacamento = 168` e floor `COMPACT_INNER_SPACING_MIN = 84`:

| Ramo | Antes (≈) | Depois (≈) |
|------|-----------|------------|
| Overview | 120 | **84** (−30%) |
| Foco 4–6 (default) | 240 | **168** (−30%) |
| Foco 1–3 (sparse) | 312 | **218** (`round(168*1.3)`) |
| Foco >6 (compact) | `compactInnerSpacing(240)` → 96 | `compactInnerSpacing(168)` → **67** |

Os três ramos de foco continuam distintos (SC-003).

**Rationale**: Spec manda operar sobre a base; os factores já calibrados aplicam-se sozinhos.

**Alternatives considered**: Recalibrar `TIGHTEN` porque 67 parece “apertado” — só se QA visual mostrar sobreposição de **rótulos** ilegível; nesse caso subir ligeiramente a base (ex. 90/180) antes de tocar nos factores.

## Decisão 3 — Sobreposição: confiar em `ringMinRadius`; QA em campanha densa

**Decisão**: Não mudar `NODE_W`/`NODE_H`/`DISC`. A garantia FR-003 de não-sobreposição de caixas continua a ser `ringMinRadius(count, spacing)` com `circumference = count * (NODE_W + spacing)`. Validar visualmente campanha com dezenas de nós e foco com >6 directos (compact).

**Rationale**: Espaçamento positivo (84 / 67) + `NODE_W` na circunferência já evita overlap de caixas; o risco residual é densidade visual de nomes, não geometria.

**Alternatives considered**: Aumentar `NODE_*` — fora de escopo e aumentaria o grafo.

## Decisão 4 — Afinação pós-QA sem nova spec

**Decisão**: Se 84/168 falhar SC-002 (parece amontoado) ou SC-001 (redução imperceptível), permitir ajuste fino da **mesma** base (ex. 90/180 ou 80/160) no implement/quickstart, documentado no CHANGELOG — sem reabrir factores 086–089.

**Rationale**: Assunção explícita da spec; backlog pedia fecho do valor no plan com margem visual.
