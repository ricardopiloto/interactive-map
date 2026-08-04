# UI Contract: Calculador de rotas — custo e velocidade opcional

**Feature**: 031-route-travel-cost  
**Component**: `RoutePlannerPanel`

## Campos

| Campo | Comportamento |
|-------|----------------|
| De / Para / Ritmo | Inalterado |
| Velocidade média (mi/h) | **Opcional**; valor inicial **vazio**; placeholder a indicar padrão coach/balsa |
| Calcular | Se velocidade vazia → API sem param; se preenchida → validar > 0 no cliente; ≤0 → erro, não chama API |

## Resultado (cada item)

| Elemento | Conteúdo |
|----------|----------|
| Título / “mais rápida” | Como hoje (índice 0) |
| Distância | `X mi` |
| Tempo | `tempo_texto` |
| Custo | **Dentro: N bp** e **Fora: M bp** (ambos sempre visíveis) |

## Invariantes

- Lista ordenada pela API (mais rápida primeiro); auto-seleção índice 0.
- Mudar só a velocidade e recalcular: tempos mudam; bp iguais para a mesma rota.
- Sem toggle Dentro/Fora no formulário.
