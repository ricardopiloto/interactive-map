# Data Model: Diminuir a distância entre tokens no grafo de Relações

Não aplicável — nenhuma entidade, schema ou persistência nova.

### Constantes de layout (valores-alvo pós-138)

| Constante / prop | Ficheiro | Antes | Alvo (~−30%) | Notas |
|------------------|----------|-------|------|--------------|--------|
| `COMPACT_INNER_SPACING_MIN` | `graphLayout.ts` | 120 | **84** | Floor do ramo compact 086; também base overview |
| `OVERVIEW_SPACING` | `graphLayout.ts` | = min acima | **84** | Alias; `computeInitialLayout` |
| `espacamento` (default) | `GraphStage.tsx` | 240 | **168** | Base do foco + outer ring |

### Intactos (não são “base”)

| Constante | Valor | Papel |
|-----------|-------|--------|
| `COMPACT_INNER_FACTOR` | 2/3 | Spec 086 |
| `COMPACT_INNER_TIGHTEN` | 0.6 | Spec 088 (código actual) |
| `SPARSE_INNER_FACTOR` | 1.3 | Spec 089 |
| `COMPACT_INNER_THRESHOLD` | 6 | |
| `SPARSE_INNER_THRESHOLD` | 3 | |
| `NODE_W` / `NODE_H` / `DISC` | 172 / 112 / 58 | Caixa do token |
