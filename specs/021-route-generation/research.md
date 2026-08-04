# Research: 021-route-generation

## 1. Persistência do grafo

**Decision**: Tabelas SQLModel `Waypoint` e `RouteSegment` (nova feature), registradas em `models/__init__.py` para `create_all`. Pontos intermediários como JSON (`list[{x,y}]`) na coluna do segmento. `local_id` opcional em Waypoint com unicidade parcial (um Local → no máximo um Waypoint).

**Rationale**: Espelha padrão Local/links; desacopla de `LocalConexaoLink` (saídas narrativas).

**Alternatives considered**:
- Reusar `saida_ids` — rejeitado (significado diferente; FR/assumptions)
- Só JSON estático — rejeitado (GM precisa CRUD persistido)

## 2. Bidirecionalidade

**Decision**: Armazenar um `RouteSegment` com `waypoint_a_id` / `waypoint_b_id` (ordem = sentido do traçado desenhado). No grafo em memória, adicionar **duas** arestas (A→B e B→A) com o mesmo peso de tempo/distância.

**Rationale**: Clarificação A; GM digitaliza uma vez.

**Alternatives considered**: Arestas dirigidas — rejeitado no clarify.

## 3. Algoritmo de rotas

**Decision**: Adicionar `networkx` ao backend. Montar `Graph` (não DiGraph) ou DiGraph com arestas simétricas; `networkx.shortest_simple_paths(..., weight="tempo")` e tomar até **k=5** caminhos. Ordenação já crescente por peso.

**Rationale**: PRD §12.3; cumpre múltiplas rotas sem implementar Yen do zero.

**Alternatives considered**:
- Só Dijkstra — falha FR-007
- Yen manual — risco/retrabalho
- Cálculo no browser — duplicaria regras de escala/ritmo; auth/dados no servidor já existem

## 4. Escala e distância

**Decision**: Tabela/config `MapScale` (singleton): `miles_per_map_unit` (float). Distância de um segmento = comprimento da polilinha em “map units” × fator. Map unit: soma das distâncias euclidianas entre pontos consecutivos em coords 0–1; opcionalmente corrigir `dy` pela razão de aspecto da imagem do mapa (largura/altura) para milhas mais fiéis — se a imagem aspect for conhecida no backend (URL/mapa) ou fixar aspect do mapa Glorious Reikland no seed.

**Rationale**: FR-009; calibração GM/seed (duas cidades do lore), não fluxo jogador.

**Alternatives considered**: Distância só em pixels na upload — frágil a re-crop; fator relativo 0–1 é estável com pins.

## 5. Ritmos e modificadores de tipo

**Decision**: Constantes no serviço (não editáveis no MVP UI):

| Ritmo | Velocidade base (milhas/hora efetivas)* |
|-------|----------------------------------------|
| cauteloso | menor |
| normal | média |
| arriscado | maior |

\*Valores exatos no código alinhados a ordens de grandeza WFRP (viagem diária → horas); documentar no quickstart o trio usado nos testes.

Modificadores padrão por tipo: estrada `1.0`, rio `1.5`, trilha `0.5` (como PRD), overridáveis por campo opcional no segmento se útil.

Tempo aresta = `distancia_milhas / (velocidade_ritmo * modificador)`.

**Rationale**: FR-010 / US3; um ritmo por request.

## 6. API

**Decision**:
- Público: `GET /api/routes/plan?origem_local_id=&destino_local_id=&ritmo=` (IDs de **Local**, resolvidos para waypoints vinculados)
- Público (opcional): `GET /api/waypoints?linked_only=1` para popular seletores
- Admin: CRUD `/api/admin/waypoints`, `/api/admin/route-segments`; `PUT` escala se necessário

**Rationale**: Jogador só escolhe Locais conhecidos (FR-006); nós cruzamento ficam só no grafo.

## 7. UI jogador

**Decision**: Painel “Calcular rota” na experiência do mapa (sidebar item ou drawer) — De/Para/ritmo → chama plan → lista; auto-seleciona índice 0; `RouteOverlay` no stage com polilinha da rota selecionada (`solid`/espessa) e alternativas (`dashed`/opacas). Não misturar com SVG de `saida_ids`.

**Rationale**: Clarificações overlay + auto-select; mesma tela (FR-006).

## 8. UI GM digitização

**Decision**: Flag/modo `routeDigitizer` em MapPage (só `isGm`): esconde pins de lore; mostra waypoints/segmentos; cliques no stage criam nós / traçam segmento (fluxo PRD: extremo → intermediários → extremo → tipo → save). Entrada: botão/ação no Modo GM (“Rede de rotas”).

**Rationale**: Clarificação B; reutiliza `onMapClickRelative` e TransformWrapper.

**Alternatives considered**: Rota React `/admin/rotas` separada — possível depois; MVP = modo in-page.

## 9. Convivência com 017

**Decision**: Dois overlays independentes; regras de visibilidade inalteradas para saídas narrativas. Overlay de viagem só quando há resultado de plan ativo (ou limpar ao fechar o painel).

**Rationale**: Spec edge case / assumptions.
