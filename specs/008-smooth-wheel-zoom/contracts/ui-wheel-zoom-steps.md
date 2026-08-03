# UI Contract: Passos de zoom (rolagem e botões)

Escopo: `CampaignMap` / `TransformWrapper` / controles +, −, 1:1.

## Must

| Interação | Comportamento |
|-----------|----------------|
| Wheel / trackpad scroll | `wheel.step` calibrado por cobertura relativa imagem↔viewport; menor que o legado `0.1` |
| Cobertura alta | Passo de rolagem mais fino |
| Cobertura baixa | Passo não excessivamente lento (clamp superior) |
| Clique + / − | Passo **maior** que um tick típico da rolagem calibrada |
| 1:1 | Reset para escala inicial; inalterado em intenção |
| Limites | Respeitar min/max scale do mapa |

## Must not

- Um único tick de rolagem atravessar quase toda a faixa min→max
- Botão +/− com o mesmo passo fino da rolagem (clarificação B)
- Remount do mapa a cada resize (perder pan/zoom do usuário)
- Exigir controle manual de “sensibilidade” pelo usuário

## Acceptance check

Rolagem: ~3–15 ticks para faixa intermediária útil (SC-003). Clique +: delta visualmente maior que 1 tick de roda (SC-005). Dois contextos de cobertura relativa distintos ainda dentro da faixa fluida.
