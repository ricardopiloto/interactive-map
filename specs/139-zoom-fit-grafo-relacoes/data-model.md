# Data Model: Botão "1:1" ajusta a tela pra mostrar todos os tokens (Relações)

Não aplicável — nenhuma entidade, schema ou persistência nova.

### Estado de UI (já existente; semântica do controlo muda)

| Estado | Onde | Notas |
|--------|------|--------|
| `scale` | `GraphStage` | Passa a ser definido pelo fit (clamped), não só reset a `1` |
| `pan` | `GraphStage` | Passa a centrar o bbox; deixa de ser só `{0,0}` no botão |
| `viewportCenter` / área útil | `GraphStage` | Entrada do cálculo; alinhar com medição do painel |
| `positions` | derivado | Fonte do bbox dos tokens visíveis |

### Constantes relevantes

| Constante | Valor actual | Uso no fit |
|-----------|--------------|------------|
| `MIN_SCALE` / `MAX_SCALE` | 0.35 / 2.5 | Clamp da escala |
| `NODE_W` / `NODE_H` | 172 / 112 | Expansão do bbox por token |
| Cap de zoom-in no fit | **1.0** (novo contrato) | Não ampliar além do zoom natural |
