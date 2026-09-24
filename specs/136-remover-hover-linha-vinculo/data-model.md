# Data Model: Remover destaque de hover na linha de vínculo (Relações)

Não aplicável — nenhuma entidade, schema ou persistência nova.

### Estado de UI removido

| Estado | Onde | Acção |
|--------|------|--------|
| `hoveredEdgeId: number \| null` | `GraphStage` | **Remover** — só alimentava `midLabelVisible` no hover da aresta |

### Estado / derivação preservados

| Item | Notas |
|------|--------|
| `highlighted` (aresta) | Continua a controlar opacidade/espessura e rótulo mid-edge |
| `onEdgeClick` | Clique no hit-path inalterado |
| `hoveredId` / `previewId` | Preview por personagem (lista/token) — fora desta spec; não remover |
