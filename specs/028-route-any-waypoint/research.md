# Research: 028-route-any-waypoint

## 1. Parâmetros do endpoint de plano

**Decision**: Substituir `origem_local_id` / `destino_local_id` por `origem_waypoint_id` / `destino_waypoint_id`. Carregar `Waypoint` por PK; 404/422 se inexistente; 422 se iguais; chamar `plan_routes(session, origem_id, destino_id, …)` como hoje.

**Rationale**: Clarificação — só IDs de nó; `plan_routes` já espera waypoint IDs. Remover o lookup `Waypoint.local_id == …` e erros “sem waypoint vinculado”.

**Alternatives considered**:
- Aceitar Local **ou** nó — rejeitado na clarify
- Manter nomes antigos dos query params mas passar waypoint IDs — confuso; breaking change explícito é melhor

## 2. Lista pública de waypoints

**Decision**: O calculador usa `GET /api/waypoints` **sem** `linked_only` (default `false` já lista todos). Manter `linked_only` no endpoint para outros usos futuros/admin mental model; MapPage deixa de chamar `listWaypoints(true)` para o planner.

**Rationale**: FR-001 / SC-003; seed já tem nó sem Local (“Cruzamento do Reik”).

**Alternatives considered**: Remover `linked_only` — desnecessário nesta feature.

## 3. Rótulos no painel (FR-008)

**Decision**: Helper no FE, ex.:

```
label(wp) = wp.nome?.trim() || locaisById.get(wp.local_id)?.nome || `Nó ${wp.id}`
```

Ordenar opções por `label` (localeCompare).

**Rationale**: Clarificação A; FE já carrega `locais` em `MapPage`.

**Alternatives considered**: Enriquecer `WaypointRead` com `local_nome` no backend — útil depois; YAGNI agora.

## 4. Props do RoutePlannerPanel

**Decision**: Trocar `locais` + `linkedLocalIds` por `waypoints: Waypoint[]` (+ `locais` só para resolver rótulo, ou `Map<number,string>` de nomes). Remover dependência de `linkedLocalIds` no painel.

**Rationale**: UI lista só nós (FR-004).

## 5. Mensagens

**Decision**: Atualizar copy de erro (“Escolha origem e destino”, “Nenhuma rota encontrada entre esses **nós**”) e remover textos que falem em Local como pré-requisito do cálculo.

**Rationale**: FR-005.

## 6. Documentação

**Decision**: Atualizar menções a `origem_local_id` em `backend/README.md` (e qualquer quickstart antigo só como referência histórica nas specs 021/024 — não reescrever specs fechadas; novo contrato 028 é a fonte de verdade).

**Rationale**: Evitar docs mentindo sobre a API pública.
