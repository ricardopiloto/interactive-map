# Proposal

## Why

Toda Localidade (`Local`) pode opcionalmente ser vinculada a um nó da rede de rotas (`Waypoint`, `local_id` em `Waypoint`, único por local). Hoje esse vínculo é só opcional e a sincronização de posição entre os dois só acontece no instante em que o vínculo é feito (`snap_local_to_waypoint`, `backend/app/services/waypoint_local_link.py`) — o Local herda a posição do Waypoint naquele momento, e nunca mais. Isso causa um bug real: como o frontend sempre reenvia o `waypoint_id` atual em todo salvamento de Local, mover um Local já vinculado pelo botão "Reposicionar" é descartado silenciosamente — o backend volta a aplicar a posição antiga do Waypoint por cima da nova posição do Local a cada save. Além disso, não existe hoje nenhuma forma de mover um Waypoint já criado pela UI do editor de Rede de rotas.

Decisão do usuário: toda Localidade deve sempre ter um Waypoint associado (criado automaticamente, inclusive retroativamente para locais já existentes), e a posição dos dois deve ficar sempre sincronizada — mover um lado move o outro, inclusive deslocando os segmentos de rota conectados a esse nó. Um Waypoint continua podendo existir sem nenhuma Localidade associada (nó "solto" da rede de rotas, usado só pra rotear através de um ponto sem significado narrativo).

## What Changes

- Criar uma Localidade (`POST /api/c/{slug}/admin/locais`) passa a criar automaticamente um Waypoint na mesma posição (x,y) e vinculá-lo, quando nenhum `waypoint_id` é informado explicitamente no payload.
- Mover uma Localidade já vinculada a um Waypoint (`PUT /api/c/{slug}/admin/locais/{id}` com `x`/`y` novos e o mesmo `waypoint_id` de antes) passa a propagar a nova posição para o Waypoint vinculado, em vez de a posição do Waypoint sobrescrever silenciosamente a nova posição do Local. Trocar o vínculo para um Waypoint diferente continua fazendo o Local adotar a posição do novo Waypoint (comportamento já existente, preservado).
- Migração de dados (backfill, não é mudança de schema — a coluna já existe): toda Localidade já existente, em toda campanha, que hoje não tem nenhum Waypoint vinculado, ganha um Waypoint novo criado na posição atual do Local.
- Implementar a capacidade de mover um Waypoint já existente pela UI do editor de Rede de rotas (`frontend-v2/src/routes/rota.tsx`) — hoje só é possível criar Waypoints novos, não reposicionar um existente; os segmentos conectados a esse nó devem acompanhar visualmente a nova posição.
- Exclusão de Localidade continua desvinculando (não apagando) o Waypoint associado — comportamento já existente (`backend/app/routers/admin/locais.py::delete_local`), confirmado e preservado: um Waypoint pode continuar existindo sem nenhuma Localidade.

## Capabilities

### New Capabilities
- `local-node-vinculo`: toda Localidade tem sempre um Waypoint associado, com posição sempre sincronizada entre os dois (mover um move o outro); um Waypoint pode existir sem Localidade associada, mas uma Localidade nunca existe sem um Waypoint.

### Modified Capabilities
(nenhuma — não há capability OpenSpec existente cobrindo o vínculo Local↔Waypoint; a relação é anterior à adoção do OpenSpec neste projeto.)

## Impact

- **Backend**: `backend/app/routers/admin/locais.py` (`create_local` cria Waypoint automático quando ausente; `update_local` propaga reposição para o Waypoint vinculado em vez de resnapar o Local), `backend/app/services/waypoint_local_link.py` (nova função ou extensão de `set_local_waypoint_id` para decidir a direção da sincronização: vínculo novo/trocado → Local adota posição do Waypoint; reposição com vínculo inalterado → Waypoint adota nova posição do Local), `backend/app/routers/admin/waypoints.py` (confirmar que `PUT /waypoints/{id}` com `x`/`y` já propaga para o Local vinculado, se houver — hoje o schema já aceita `x`/`y`, mas nada no frontend usa isso). Script de backfill de dados (um uso) iterando toda campanha em `backend/data/campanhas/*/` — **não** é uma migração Alembic (nenhuma coluna nova), é um backfill de linhas.
- **Frontend `frontend-v2/`**: `frontend-v2/src/routes/rota.tsx` (nova interação para mover um nó existente no editor de Rede de rotas — hoje só cria nós novos), `frontend-v2/src/components/codex/WorldMap.tsx` (os segmentos conectados a um nó movido precisam re-renderizar na nova posição, já deveria funcionar automaticamente via re-fetch, confirmar).
- **Frontend `frontend/` (produção)**: o backend é compartilhado — `create_local`/`update_local` mudam de comportamento para quem usa `frontend/` também (toda Localidade nova em produção passa a ganhar um Waypoint automático; reposicionar um Local vinculado passa a funcionar de verdade onde antes era um no-op silencioso). Isso é uma correção de bug para `frontend/`, não uma mudança de UI — `frontend/` não precisa de nenhuma edição de código para se beneficiar, mas o comportamento muda assim que o backend for deployado.
- **Dados/migração**: backfill (não Alembic) criando um Waypoint para toda Localidade sem um hoje, em toda campanha (dev e produção) — precisa rodar contra cada `campanha.db` individualmente, não contra `control.db`.
- **Descontinuação**: nenhuma.
