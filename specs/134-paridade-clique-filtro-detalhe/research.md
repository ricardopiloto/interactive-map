# Research: Paridade de clique no filtro do painel de detalhe (Relações)

Sem `[NEEDS CLARIFICATION]` — causa raiz e direção já confirmadas em [BKLG-023](../../docs/backlog/backlog.md#bklg-023-bugdesign--filtro-do-painel-de-detalhe-relações-não-tem-paridade-de-clique-com-o-filtro-do-grafo-geral) e na [spec.md](./spec.md).

## Decisão 1 — Extrair a mecânica de clique; não copiar o bloco duas vezes

**Decisão**: Generalizar `CHIP_CLICK_DELAY_MS` + pending timeout + `toggle` / `soloOrRestore` num helper ou hook reutilizável (ex. `useVinculoTipoChipClicks(setTipos, { onSingleClickSideEffect? })`) usado pelo filtro do grafo e pelo filtro do detalhe.

**Rationale**: A spec assume extracção a partir do grafo geral; duplicar delay/refs nos dois sítios divergeria de novo (o bug actual). Só o `Set` de destino muda (`activeTipos` vs `activeDetailTipos`).

**Alternatives considered**:
- Copiar `handleChipClick`/`handleChipDoubleClick` para dentro de `PersonagemDetailBody` — resolve o sintoma, mas viola a assunção de generalizar e aumenta risco de drift.
- Unificar os dois estados num só `Set` — rejeitado pela spec 133 (filtros independentes).

## Decisão 2 — Side-effect só no grafo: `setExpanded(true)`

**Decisão**: O helper aceita um callback opcional no clique único (ex. expandir o painel flutuante). O grafo passa `() => setExpanded(true)`; o detalhe não passa nada.

**Rationale**: Hoje `handleChipClick` no grafo também abre/expande o painel. O detalhe já está dentro do painel expandido — não deve acoplar-se a esse side-effect.

**Alternatives considered**: Sempre expandir no helper — efeito colateral indevido no detalhe.

## Decisão 3 — Cancelar timer no unmount (cobre FR-004 com `key={personagem.id}`)

**Decisão**: O helper/hook limpa o `setTimeout` pendente no cleanup do `useEffect` (unmount). Como o call site de `PersonagemDetailBody` já usa `key={personagem.id}` (spec 133), trocar de personagem desmonta o corpo do detalhe e cancela o clique pendente sem lógica extra no pai.

**Rationale**: FR-004 exige que nenhum timer do detalhe sobreviva à troca de pessoa; cleanup no unmount é o idioms React correcto e aproveita o remount já existente.

**Alternatives considered**: Subir o pending ref ao pai e limpar num `useEffect([selectedId])` — mais código, estado longe do chip.

## Decisão 4 — Semântica de toggle “conjunto vazio” permanece por filtro

**Decisão**: Partilhar delay + solo/restore; manter a função de toggle de cada filtro. O detalhe pode continuar a restaurar todos os tipos se o `Set` ficar vazio (`toggleDetailTipo` actual); o grafo continua a permitir conjunto vazio se já o faz. Solo/restore nos dois usa a mesma regra: um tipo sozinho → `new Set(VINCULO_TIPOS)`; senão → `new Set([tipo])`.

**Rationale**: Spec 134 pede paridade de **clique** (delay + isolar), não reabrir a política de “zero tipos activos” da 133. Alinhar empty-set seria scope creep.

**Alternatives considered**: Forçar o mesmo `toggleTipo` nos dois — fora do pedido; risco de regressão na lista do detalhe.
