# Research: 024-route-planner-speed

## 1. Ritmo vs velocidade

**Decision**: `ritmo` controla só **horas de jornada/dia** (`normal`→6, `intenso`→8). Velocidade de marcha vem de `velocidade_media_mph` (default 4). Remover `PACE_MPH` cauteloso/normal/arriscado da UI e do contrato público novo.

**Rationale**: Spec clarificada; separa “quanto andam por dia” de “quão rápido andam”.

**Alternatives considered**: Manter tríade antiga como MPH — rejeitado pelo pedido; mapear intenso→arriscado — semântica errada.

## 2. Modificadores de tipo

**Decision**: `TIPO_MOD`: `estrada=1.0`, `rio=1.4`, `trilha=0.8`. Tempo de trecho = `distancia_milhas / (velocidade_media_mph * mod)`. Respeitar `modificador_velocidade` do segmento se preenchido (override).

**Rationale**: Spec (+40% / −20%). Código atual usa 1.5 / 0.5 — corrigir.

**Alternatives considered**: Manter 1.5/0.5 — conflita com spec.

## 3. Pathfinding por tempo + alternativas paralelas

**Decision**:
- Peso da aresta = horas de marcha (`tempo`).
- Usar `nx.shortest_simple_paths(..., weight="tempo")` com `k≤5`, já alinhado à clarificação A.
- Trocar `nx.Graph` por `nx.MultiGraph` (ou equivalente) indexado por `seg.id`, para **não descartar** um segundo segmento entre o mesmo par de waypoints (ex. estrada + rio).

**Rationale**: Graph simples atual fica só com a aresta mais rápida entre A–B; o utilizador não vê a alternativa. MultiGraph preserva ambas; k-shortest por tempo lista as mais rápidas (rio primeiro se vantajoso).

**Alternatives considered**:
- Só reordenar k-shortest por distância — rejeitado (clarificação)
- Exigir waypoints distintos para cada tipo — frágil para o GM

## 4. Formatação do tempo

**Decision**: Após somar `tempo_horas` (marcha), converter com `horas_por_dia`:
- `dias = floor(tempo_horas / horas_por_dia)`
- `horas_resto = tempo_horas - dias * horas_por_dia` (arredondar a 1 decimal se útil)
- `tempo_texto`: omitir zeros (“1 dia”, “4 h”, “2 dias e 3 h”)
- Expor `tempo_horas`, `tempo_dias`, `tempo_horas_resto`, `tempo_texto` no `RoutePlanItem` (FE mostra `tempo_texto`).

**Rationale**: Clarificação B; SC-001/002.

**Alternatives considered**: Só FE formata — possível, mas backend já conhece ritmo; contrato único evita drift.

## 5. API

**Decision**: `GET /api/routes/plan?origem_local_id=&destino_local_id=&ritmo=normal|intenso&velocidade_media_mph=4`  
Validar `velocidade_media_mph > 0`. Rotas já ordenadas por `tempo_horas` crescente (ordem do gerador por peso tempo). Cliente auto-seleciona índice 0.

**Rationale**: FR-001/008; breaking change aceitável vs cauteloso/arriscado (feature ainda recente).

## 6. UI

**Decision**: `RoutePlannerPanel`: selects De/Para; Ritmo Normal|Intenso; input número Velocidade média (default 4); lista com `#`, mi, `tempo_texto`, tipos; clique seleciona e atualiza overlay (já existente).

**Rationale**: Spec US1–US3.
