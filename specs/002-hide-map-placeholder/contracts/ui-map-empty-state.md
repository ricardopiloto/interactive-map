# UI Contract: Empty state do mapa de fundo

Componente: `CampaignMap` (visão pública e admin).

## Estados visuais

| Condição | Imagem de fundo | Mensagem “envie a imagem pelo painel GM” |
|----------|-----------------|------------------------------------------|
| `mapUrl` carregou com sucesso (`onLoad`) | Visível | **Oculta** |
| `mapUrl` falhou (`onError`) ou ainda não resolvida após erro | Não exibida (ou escondida) | **Visível** |
| `mapUrl` acabou de mudar | Reset: aguarda load/error | Oculta até decidir |

## Regras

1. Mensagem e imagem bem-sucedida são **mutuamente exclusivas**.
2. Texto do empty state: equivalente a “Mapa da campanha — envie a imagem pelo painel GM”.
3. Nenhuma API nova; não há contrato HTTP adicional.

## Verificação

- Com arquivo válido em `/uploads/map/campaign-map.*` → SC-001.
- Sem arquivo (404) → SC-002.
