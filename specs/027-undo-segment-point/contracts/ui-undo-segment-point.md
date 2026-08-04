# UI Contract: Desfazer ponto com botão direito

**Feature**: 027-undo-segment-point  
**Component**: `RouteDigitizerView`

## Gesto

| Contexto | Ação | Resultado |
|----------|------|-----------|
| `mode === 'draw-seg'`, ≥1 mid | Botão direito (mapa ou nó) | Remove último `draftMids`; rascunho continua |
| `mode === 'draw-seg'`, origem sem mids | Botão direito (mapa ou nó) | `draftA = null`; modo permanece Traçar segmento |
| `mode === 'draw-seg'`, sem origem | Botão direito | No-op; menu browser bloqueado |
| `mode !== 'draw-seg'` | Botão direito na área | Comportamento default (sem undo de rascunho) |
| Clique **esquerdo** num nó (destino) | Inalterado | Fecha/grava segmento como hoje |
| Botão direito num nó | **Não** grava / **não** fecha | Só undo do rascunho |

## Feedback

- Polyline de rascunho atualiza de imediato ao remover o último mid / limpar origem.
- Hint (recomendado): mencionar “Botão direito: desfazer último ponto.”
- Sem diálogo de confirmação.

## Invariantes

- Segmentos/nós já listados na rede não mudam só por direito.
- Menu de contexto do browser não aparece na área de traçado em `draw-seg`.
