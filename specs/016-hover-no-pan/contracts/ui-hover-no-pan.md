# UI Contract: Hover Locais sem pan/zoom da vista

Escopo: hover na aba Locais do menu vs transform do mapa.

## Must

| Situação | Comportamento |
|----------|----------------|
| Hover item Locais | Pin correspondente destacado (scale/glow ok) |
| Durante/após hover | Pan e zoom da **vista** iguais aos de antes do hover |
| Leave hover | Remove destaque; vista ainda inalterada |
| Clique menu / pin (jogador) | Foco pan/zoom continua |
| Hover cartão menu (014) | Fundo sutil ok; sem vista mover |

## Must not

- Hover setar ou re-disparar foco de mapa (`zoomToElement` / `focusRequest`)
- Reaplicar último foco só porque `hoveredLocalId` mudou
- Remover destaque visual do pin no hover
- Quebrar foco por clique

## Acceptance check

1. Fixar vista; hover 3+ locais → vista idêntica; pins destacam.
2. Clicar local no menu → foco ocorre.
3. Hover de novo → vista não “pula” de volta / não re-zooma.
4. Clicar pin no mapa → foco ok.
