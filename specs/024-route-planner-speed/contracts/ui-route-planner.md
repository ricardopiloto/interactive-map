# UI Contract: Calcular rota

**Feature**: 024-route-planner-speed  
**Component**: `RoutePlannerPanel` (+ overlay de rota existente)

## Formulário

| Campo | Controlo | Default |
|-------|----------|---------|
| De | select locais com waypoint | vazio |
| Para | select | vazio |
| Ritmo | Normal \| Intenso | Normal |
| Velocidade média (mi/h) | número > 0 | 4 |

Ações: Calcular; Fechar.

## Lista de resultados

Para cada rota (índice 0 = auto-selecionada / mais rápida):

| Elemento | Conteúdo |
|----------|----------|
| Número | 1…N (ordem da lista) |
| Distância | `distancia_milhas` + “mi” |
| Tempo | `tempo_texto` |
| Tipo(s) | `tipos` unidos de forma legível (ex. “estrada, rio”) |

- Clique / seleção → `onSelectIndex`; mapa destaca geometria da rota ativa (comportamento 021).
- Sem rotas → mensagem clara; sem erro alarmante se só vazio.
- Velocidade inválida → bloquear calcular + mensagem.

## Removido da UI

- Opções de ritmo Cauteloso / Arriscado (tríade antiga).

## Invariantes

1. Após calcular com N≥1, seleção inicial = 0.
2. Mudar ritmo ou velocidade e recalcular atualiza tempos/lista.
3. Jogador e GM veem o mesmo formulário (acesso já existente ao painel).
