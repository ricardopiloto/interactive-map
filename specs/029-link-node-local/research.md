# Research: 029-link-node-local

## 1. Onde viver a regra de sync

**Decision**: Criar `backend/app/services/waypoint_local_link.py` com funções do tipo:
- `set_waypoint_local(session, waypoint_id, local_id | None)` — usado pelo PUT waypoint
- `set_local_waypoint(session, local_id, waypoint_id | None)` — usado por create/update Local

Ambas: validar unicidade; ao **ligar**, `local.x/y = waypoint.x/y`; ao **desligar**, só `waypoint.local_id = None`.

**Rationale**: Evitar duplicar snap + unicidade em dois routers; FR-008 único.

**Alternatives considered**: Só FE a chamar update Local coords depois — rejeitado (race e inconsistência); só no PUT waypoint e FE Local chama dois requests — frágil.

## 2. Extensão da API de Local

**Decision**: Adicionar `waypoint_id: Optional[int] = None` a `LocalCreate` e `LocalUpdate` (e `LocalRead` opcionalmente para hidratar o form: incluir `waypoint_id` derivado do Waypoint com esse `local_id`).

No create/update, após persistir o Local, chamar `set_local_waypoint`. Se `waypoint_id` veio no payload:
- limpar outros waypoints deste local
- atribuir `local_id` ao nó escolhido
- sobrescrever coords do Local com as do nó

Se `waypoint_id` é `null` explícito no update → desvincular.

**Rationale**: Clarificação B (form Local); um round-trip.

**Alternatives considered**: Campo só no FE com segundo PUT waypoint — mais calls e fácil esquecer snap.

## 3. PUT waypoint existente

**Decision**: Após aplicar `WaypointUpdate`, se `local_id` mudou para um valor não-nulo, snap do Local; se `null`, só clear. Reutilizar o serviço.

**Rationale**: Já existe update; falta só snap + UI.

## 4. UI Rede de rotas

**Decision**: Em cada item da lista de nós: `<select>` de Locais elegíveis + “Sem Local”; onChange → `adminApi.updateWaypoint(id, { local_id })` + reload. Mostrar nome do Local (não só id).

**Rationale**: FR-006 (1); lista já existe.

**Alternatives considered**: Dialog modal por nó — overkill.

## 5. UI LocalFormDialog + MapPage

**Decision**: `LocalFormDraft.waypoint_id: number | null`; select de nós elegíveis (sem local_id, ou o ligado a este draft.id); ao gravar, incluir `waypoint_id` no payload. Hidratar draft ao editar via `waypoints.find(w => w.local_id === local.id)`.

Nota UX: ao escolher um nó no form, pode-se atualizar `draft.x/y` no cliente para preview; o servidor continua a ser a fonte de verdade no save.

**Rationale**: Clarificação B; MapPage já orquestra save.

## 6. Elegibilidade

**Decision**:
- Do lado do nó: Locais sem waypoint, **ou** o Local atualmente ligado a este nó
- Do lado do Local: Waypoints com `local_id is null`, **ou** o waypoint com `local_id === este local`

**Rationale**: FR-003 / FR-009.
