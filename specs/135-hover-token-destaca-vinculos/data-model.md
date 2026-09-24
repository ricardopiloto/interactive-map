# Data Model: Hover no token do personagem destaca seus vínculos (Relações)

Não aplicável — nenhuma entidade, schema ou persistência nova.

### Estado de UI (já existente)

| Estado / derivação | Onde | Notas |
|--------------------|------|--------|
| `hoveredId: number \| null` | `RelacoesPage` | Fonte única; lista **e** tokens do grafo passam a escrever aqui |
| `hoveredId` prop | `GraphStage` | Já existe |
| `previewId` | Derivado em `GraphStage` | `hoveredId` se o nó está visível; já destaca arestas/nós |
| Selecção `selectedId` | `RelacoesPage` → `GraphStage` | Hover MUST NOT limpar selecção |

Sem novos campos em `Personagem` / `Vinculo`.
