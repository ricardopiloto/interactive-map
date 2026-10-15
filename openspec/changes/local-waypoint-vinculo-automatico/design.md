# Design

## Context

Ver `proposal.md` - Why/What Changes para a motivação completa. Estado atual relevante (confirmado por investigação de código):

- **Modelo** (`backend/app/models/waypoint.py`): `Waypoint.local_id: Optional[int]` (FK pra `local.id`, `unique=True` — no máximo um Waypoint por Local). `Local` (`backend/app/models/local.py`) não tem coluna `waypoint_id`; o campo `waypoint_id` que aparece em `LocalRead` é derivado em runtime (`waypoint_id_for_local`, `backend/app/services/waypoint_local_link.py:103-105`), não é persistido ali.
- **Sincronização hoje** (`backend/app/services/waypoint_local_link.py`): `snap_local_to_waypoint(local, waypoint)` (linhas 13-15) copia `waypoint.x/y` pra `local.x/y`. É chamada por `set_waypoint_local_id` (ao vincular pelo lado do Waypoint) e `set_local_waypoint_id` (ao vincular pelo lado do Local) — sempre na direção Waypoint → Local, só no instante do vínculo.
- **Bug confirmado**: `update_local` (`backend/app/routers/admin/locais.py:137-168`) sempre recebe `waypoint_id` no payload (o frontend sempre reenvia, `frontend-v2/src/api/map.ts::localPayload`), então toda vez que um Local vinculado é salvo — mesmo só pra mudar `x`/`y` via "Reposicionar" — `set_local_waypoint_id` é chamado de novo e resnapa `local.x/y` de volta pra posição do Waypoint, descartando a reposição.
- **Criação de Local** (`create_local`, mesmo arquivo, linhas 104-131): só vincula a um Waypoint se `payload.waypoint_id is not None` — hoje o vínculo é opcional na criação.
- **Exclusão de Local** (`delete_local`, linhas 170-187): já desvincula (não apaga) o Waypoint associado — comportamento correto, preservado sem mudança.
- **Mover um Waypoint já existente**: não existe nenhuma chamada no frontend pra `PUT /waypoints/{id}` com `x`/`y` novos — só criação de nó (`place-node`) e vínculo/rename. O schema/router já aceitam `x`/`y` no PUT (`backend/app/schemas/routes.py`, `backend/app/routers/admin/waypoints.py:42-68`), só falta UI.
- **Local e Waypoint vivem na mesma campaign.db** (schema `alembic_campaign`), não em `control.db` — qualquer migração/backfill de dados precisa iterar toda campanha individualmente, em `backend/data/campanhas/*/campanha.db` (dev e produção).
- **`RouteSegment.distancia_milhas` é denormalizada** (gravada em `backend/app/routers/admin/route_segments.py:48,88`) e `backend/app/services/route_planner.py:249-255` consome o valor armazenado (não recalculado em runtime) pra tempo/custo/pernoites de cada alternativa de rota. Já existe `recompute_all_distances` (`route_planner.py:646`), hoje chamada só por `update_scale` (quando a escala do mapa muda). Mover um Waypoint muda a geometria dos segmentos conectados a ele sem que nada recalcule essa distância — ponto relevante pra Decision 3 abaixo.
- `frontend-v2/src/api/map.ts::localPayload` (linhas ~101-118) **sempre** inclui `x`, `y` e `waypoint_id` em todo update de Local, mesmo quando só o nome ou a cor mudaram — isso é relevante pra Decision 1 (a condição não pode ser só "o campo veio no payload").
- `backend/app/migrate_slugs.py`, citado informalmente como "padrão já usado" numa versão anterior deste design, **não existe mais** (foi removido no revert da iteração anterior de `campanha-slug-com-id`) — o padrão de script de um uso a seguir é `backend/app/cli.py`.

## Goals / Non-Goals

**Goals:**
- Toda Localidade tem sempre um Waypoint associado (criado automaticamente quando não informado).
- Posição sincronizada nas duas direções enquanto o vínculo existir: mover o Local move o Waypoint (e os segmentos conectados a ele), mover o Waypoint move o Local.
- Backfill de dados pra toda Localidade já existente sem Waypoint, em toda campanha (dev e produção).
- UI para mover um Waypoint já existente no editor de Rede de rotas (hoje inexistente).

**Non-Goals:**
- Não é escopo impedir o dono de desvincular manualmente um Local do seu Waypoint pela UI já existente (`linkNode(id, null)`) — se isso acontecer, o Local fica sem Waypoint até alguém vinculá-lo a outro; não adicionamos uma trava pra impedir isso nesta change (seria uma regra de UX adicional, fora do pedido original). Por isso a garantia "Localidade sempre tem Waypoint" (Requirement em `specs/local-node-vinculo/spec.md`) vale **no momento da criação e do backfill**, não como uma invariante de banco impossível de violar via desvínculo manual explícito — ver nota no spec.
- Não é mudança de schema (nenhuma coluna nova) — é comportamento de API + um backfill de dados.
- Não muda a lógica de cálculo de rota em si — só garante que a distância armazenada de um segmento cujo Waypoint foi movido é recalculada (Decision 3), não que o algoritmo de planejamento muda.

## Decisions

### 1. Direção da sincronização decidida por "a posição mudou de verdade", não por "o campo veio no payload"
**Decisão**: ao salvar um Local (`update_local`) com `waypoint_id` no payload:
- Se o `waypoint_id` enviado é **diferente** do vínculo atual do Local (vínculo novo ou trocado) → comportamento já existente: o Local adota a posição do Waypoint recém-vinculado (`snap_local_to_waypoint`, direção Waypoint → Local).
- Se o `waypoint_id` enviado é **igual** ao vínculo atual (vínculo inalterado) **e** o `x`/`y` enviado é **diferente** do `x`/`y` atualmente salvo no Local (reposição de verdade) → nova direção: propagar `local.x/y` pro Waypoint vinculado (`snap_waypoint_to_local`, direção Local → Waypoint).
- Caso contrário (vínculo inalterado e posição inalterada — ex. só o nome ou a cor do pin mudaram) → nenhum snap em nenhuma direção.
- Simetricamente, `PUT /waypoints/{id}`: se `x`/`y` vieram no payload e são diferentes da posição atual do Waypoint, e ele tem um Local vinculado, propaga a nova posição pro Local; se `local_id` não veio no payload mas o Waypoint já tem um Local vinculado e `x`/`y` mudou, propaga do mesmo jeito (hoje o código só propaga quando `local_id` é reenviado — essa lacuna é coberta pela task 1.3).
**Por quê**: `frontend-v2/src/api/map.ts::localPayload` sempre inclui `x`, `y` e `waypoint_id` em **todo** update de Local, então usar só "o campo veio no payload" como condição faria até uma edição de nome disparar snap — comparar contra o valor atualmente salvo é a única forma de distinguir "o usuário realmente moveu isto" de "o campo foi reenviado sem mudar".
**Alternativa considerada**: sempre que ambos os campos (`waypoint_id` e `x`/`y`) vierem juntos, ignorar `x`/`y` e só aplicar o snap Waypoint→Local (comportamento atual, sem o fix). Rejeitada — é exatamente o bug que motiva esta change.

### 2. Backfill de dados, não migração de schema
**Decisão**: um script (um uso, seguindo o padrão de `backend/app/cli.py`) enumera as campanhas pelo catálogo em `control.db` (não por `glob` em `backend/data/campanhas/*/`, que incluiria campanhas inativas/descontinuadas sem necessidade) e, para cada uma, abre a sessão da campanha pelo caminho normal de resolução (`resolve_campaign_session`/`get_campaign_engine`, **não** `sqlite3.connect` cru) — isso garante que o schema da campanha já está atualizado (`ensure_campaign_schema` roda como parte da resolução) antes do backfill tentar ler a tabela `waypoint`. Para cada Local sem Waypoint vinculado, cria um Waypoint novo na posição atual do Local e vincula. Idempotente (pula Locais que já têm Waypoint).
**Por quê**: a relação já existe no schema (`Waypoint.local_id`); só faltam linhas, não uma coluna nova. Abrir a campanha pelo caminho normal de resolução evita assumir que toda `campanha.db` já está na revisão mais recente (nem sempre é — ver a contaminação de `feature/game-prep` encontrada e corrigida mais cedo hoje, que é exatamente esse tipo de suposição errada).
**Alternativa considerada**: criar o Waypoint ausente sob demanda, na primeira vez que o Local for lido/editado (lazy backfill). Rejeitada — mais complexidade espalhada pelo código de leitura, e deixaria o problema resolvido "aos poucos" em vez de de uma vez; um script de backfill único é mais simples de auditar e rodar contra produção com confiança.

### 3. Mover um Waypoint recalcula a distância dos segmentos conectados, não só a posição visual
**Decisão**: depois de propagar uma nova posição de Waypoint (por qualquer uma das duas direções da Decision 1), recalcular `distancia_milhas` de todo `RouteSegment` cujo `waypoint_a_id` ou `waypoint_b_id` seja o nó movido, reaproveitando `recompute_all_distances`/a mesma lógica de cálculo já usada por `update_scale` (`backend/app/services/route_planner.py:646`), escopando ao(s) segmento(s) afetado(s) em vez de recalcular a rede inteira.
**Por quê**: `RouteSegment.distancia_milhas` é denormalizada e é o valor que `route_planner.py` usa pra tempo/custo/pernoites de cada alternativa — mover um nó sem recalcular deixaria distâncias erradas armazenadas, silenciosamente, até a próxima mudança de escala do mapa (que é o único gatilho de recálculo hoje).
**Alternativa considerada**: só redesenhar visualmente o segmento no mapa, sem recalcular a distância armazenada. Rejeitada — o objetivo da change é manter a rede de rotas geograficamente consistente; deixar a distância dessincronizada da geometria real contradiz esse objetivo.

## Risks / Trade-offs

- **"Localidade sempre tem Waypoint" não é uma invariante de banco, é garantida só na criação/backfill** → ver Non-Goals; aceito, documentado explicitamente no Requirement (ver spec) pra não prometer mais do que a change entrega.
- **Script de backfill roda contra toda campanha de produção, com o serviço no ar** → escrita concorrente num SQLite enquanto o backfill roda, e o backend mantém engines de campanha em cache (`get_campaign_engine`) que podem conviver com a sessão que o backfill abriu — mitigado exigindo uma janela com o serviço de backend parado (ou pelo menos sem tráfego de escrita) durante o backfill real em produção, não só durante o teste numa cópia.
- **Cópia de um `campanha.db` em modo WAL enquanto o serviço está no ar pode capturar um estado inconsistente** (um `cp` simples não é atômico em relação ao WAL) → usar `sqlite3 <arquivo> ".backup <destino>"` em vez de `cp` pra qualquer backup feito com o serviço rodando; se o serviço estiver parado durante o backfill (ver item acima), um `cp` simples já é seguro.
- **Criar um Waypoint pra todo Local existente pode poluir visualmente o editor de Rede de rotas** (hoje só nós "relevantes" pra rota tendem a existir) → aceito; é exatamente o comportamento pedido pelo usuário. O dono pode optar por não ligar esses Waypoints a nenhum segmento de rota — eles só passam a existir, não são forçados a fazer parte de nenhuma rota calculada.
- **Mover um Waypoint vinculado desloca segmentos conectados a ele e recalcula a distância armazenada** → comportamento aceito explicitamente pelo usuário (Decision 3); é o resultado esperado de uma rede de rotas geograficamente consistente.
- **`pontos_intermediarios` de um segmento são coordenadas absolutas, não relativas ao Waypoint** → mover um Waypoint não move os pontos intermediários do segmento conectado a ele, o que pode deixar um "vinco" visual perto do nó movido (a reta final entre o último ponto intermediário e o nó muda de ângulo, mas o traçado intermediário em si não se redesenha). Aceito como limitação conhecida desta change — redesenhar o traçado intermediário automaticamente exigiria uma heurística de geometria fora de escopo aqui; o dono pode ajustar manualmente os pontos intermediários depois de mover um nó, se precisar.

## Migration Plan

1. Implementar a Decision 1 (sincronização bidirecional, pela diferença real de posição) em `update_local` e `update_waypoint`, incluindo a Decision 3 (recálculo de distância dos segmentos afetados).
2. Implementar a auto-criação de Waypoint em `create_local` quando `waypoint_id` não é informado.
3. Escrever e rodar o script de backfill (Decision 2) contra `backend/data/` de desenvolvimento, com backup antes (`sqlite3 .backup` se o backend estiver rodando, `cp` se estiver parado).
4. Implementar a UI de mover um Waypoint existente no editor de Rede de rotas (`frontend-v2/`) — ver task 4.1 para as decisões de interação pendentes (modo de edição, tratamento dos pontos intermediários).
5. Validar manualmente: criar um Local sem vincular nó (deve ganhar um Waypoint automático); mover esse Local (deve mover o Waypoint e qualquer segmento conectado, com distância recalculada); mover o Waypoint pelo editor de rotas (deve mover o Local de volta).
6. Antes de produção: parar (ou isolar de escrita) o backend, backup de `backend/data/campanhas/*/campanha.db` de produção, rodar o backfill numa cópia primeiro, confirmar por amostragem, só então rodar no ambiente real.

**Rollback**: reverter o código; o backfill de dados (Waypoints novos criados) não precisa ser desfeito — Waypoints extras sem nenhum segmento conectado não têm efeito negativo mesmo se o código for revertido.
