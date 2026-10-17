# Proposal

## Why

O usuário notou que a tela de Rota em `frontend-v2/` perdeu o marcador de pernoite (onde o grupo dorme em cada noite de uma viagem de vários dias) que existia no `frontend/` legado.

Investigação (subagente, read-only) trouxe uma surpresa boa: **o motor de cálculo já existe inteiro no backend, já funcionando**. `backend/app/services/overnight.py` (`simulate_overnights_and_fatigue`) já calcula, pra cada dia de viagem, se o grupo dorme num nó vinculado a um Local (`Pernoite(tipo="local", local_id=..., nome=...)`) ou ao relento (`Pernoite(tipo="relento", x=..., y=...)` interpolado ao longo da rota), junto com fadiga acumulada do ritmo "intenso" e fatias de geometria por dia (`dias_visuais`) pra colorir o traçado. Tudo isso já é devolvido por `GET /api/c/{slug}/routes/plan` e já está tipado em `frontend-v2/src/api/routes.ts` — **`frontend-v2/` só não desenha nada disso no mapa**: hoje só existe uma lista de texto no painel ("Noite N · {Local | ao relento}"), sem nenhum pin ou coloração no `WorldMap`. `frontend-v2-paper-parchment/design.md` (Decision 4) e `tasks.md` (task 5.1) já citavam "pernoites" como parte do que `/routes/plan` devolve, e o checklist de paridade marcou a tela de Rota como ✅ sem ressalva — um esquecimento silencioso contra a própria meta de paridade, do mesmo tipo já achado hoje em retratos de Personagem e na tela de Itens.

**O pedido novo do usuário não existe nem no legado**: hoje, um pernoite só vira `tipo="local"` quando o ponto ideal do dia cai, por coincidência, bem perto de um nó da rota que já está vinculado 1:1 a um Local (`Waypoint.local_id`) — não existe nenhuma checagem de proximidade/raio contra a posição de um Local. Um ponto "ao relento" pode, na prática, cair geograficamente muito perto de uma cidade sem nunca ser reclassificado, porque o algoritmo nunca compara a posição interpolada com a posição de nenhum Local. O usuário pediu explicitamente essa regra nova: quando o pernoite cai dentro do raio de uma cidade, ele não deve ser "ao relento".

**Decisão de produto já tomada com o usuário**: o raio que define "dentro do alcance de uma cidade" é derivado da escala do mapa — um valor fixo em unidades de mapa (o mesmo espaço de coordenadas 0–1 já usado por `Local.x`/`Local.y`/`Waypoint.x`/`Waypoint.y`), não uma constante fixa em milhas nem um campo configurável por Local. Isso mantém o "tamanho visual" da zona de influência de uma cidade consistente entre campanhas, não importa a escala real que cada uma configurou.

## What Changes

### Backend (lógica nova)
- Em `backend/app/services/overnight.py`, `simulate_overnights_and_fatigue`: antes de criar um `Pernoite(tipo="relento", ...)` no ramo onde nenhum nó vinculado a Local foi encontrado dentro da tolerância do dia, comparar a posição interpolada `(x, y)` com a posição de **todos** os Locais da campanha (não só os que estão na rota calculada); se a distância até o Local mais próximo for menor ou igual a um novo raio configurável (em unidades de mapa, não milhas), criar o pernoite como `tipo="local"` com o `local_id`/`nome` desse Local, mantendo `x`/`y` no ponto interpolado (não encaixado na posição exata do Local).
- Novo valor em `backend/app/config.py` (`settings`), ao lado de `tolerancia_pernoite_pct`: o raio, em unidades de mapa (mesmo espaço 0–1 de `x`/`y`).
- `plan_routes` passa a buscar a posição de todos os Locais da campanha (mesmo padrão já usado pra `local_names`) e repassar pra `item_from_edges`/`simulate_overnights_and_fatigue`.

### Frontend (porte do que já existia no legado)
- Pin dedicado "ao relento" no mapa, desenhado na posição interpolada de cada pernoite com `tipo="relento"` da rota selecionada — equivalente ao `campaign-map__pin--relento` do `frontend/` legado, adaptado pro `overlay` SVG já usado em `frontend-v2/src/routes/rota.tsx`/`WorldMap.tsx` (não é mais HTML/CSS absoluto como no legado).
- Destaque visual no pin já existente do nó/Local, quando esse nó é onde o grupo pernoita (`tipo="local"`) — equivalente ao `campaign-map__pin--pernoite` do legado.
- Coloração do traçado da rota por dia de viagem, usando `dias_visuais` (já tipado no backend, mas **nunca tipado nem recebido** em `frontend-v2/src/api/routes.ts`) — trechos com fadiga residual (ritmo intenso, saldo acumulado) ganham uma cor de alerta, equivalente ao `campaign-map__travel-route--fadiga-N` do `RouteOverlay.tsx` legado.
- Estender `RoutePlanItem` em `frontend-v2/src/api/routes.ts` com os campos que o backend já devolve e o tipo atual não tem: `fadiga_saldo`, `fadiga_pico`, `fadiga_aviso`, `fadiga_morte`, `dias_visuais` (tipo `DiaVisual[]`).

## Capabilities

### New Capabilities
- `pernoite-rota`: cobre o cálculo (incluindo a regra de raio) e a exibição de onde o grupo pernoita numa rota de vários dias — não existia nenhuma spec cobrindo essa funcionalidade antes.

### Modified Capabilities
(nenhuma — não há capability OpenSpec existente cobrindo o planejador de rotas pra modificar; `frontend-v2-paper-parchment` não precisa de edição, essa proposta fecha uma lacuna contra a meta de paridade já declarada lá)

## Impact

- **Backend (`backend/app/services/overnight.py`, `route_planner.py`, `config.py`)**: nova checagem de proximidade no ramo "ao relento"; nenhuma mudança de schema (`Pernoite`/`RoutePlanItem` continuam com os mesmos campos, só o critério de classificação muda).
- **Frontend (`frontend-v2/`)**: `src/api/routes.ts` (tipos novos), `src/routes/rota.tsx` (overlay: pin de relento + destaque de pernoite no pin do nó + coloração por fadiga), possivelmente `src/components/codex/WorldMap.tsx` se o destaque do pin precisar de uma prop nova no `MapPin`.
- **Dados/migração**: nenhuma — `settings` ganha um valor novo com default, sem migração de banco.
- **Testes de backend existentes** (`backend/tests/` — a suíte de rota/overnight já existente): precisam continuar passando; o novo raio deve ser testado com casos explícitos (pernoite perto de uma cidade fora da rota, pernoite longe de qualquer cidade).
