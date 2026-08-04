# Research: 023-segment-finish-zone

## 1. Valores numéricos dos raios

**Decision**: Constantes nomeadas (ou literais claros) em `RouteDigitizerView`:
- `ORIGIN_SNAP = 0.03` — seleção de origem (atual / inalterado)
- `FINISH_SNAP = 0.01` — finalização no destino (≈⅓ de 0.03)

**Rationale**: Clarificações B + A; `0.03` já é o default de `nearestWaypoint`; ⅓ → `0.01`. Coordenadas normalizadas 0–1 do stage.

**Alternatives considered**:
- `0.015` (½) — rejeitado (clarificação B = ⅓)
- Um único raio menor para ambos — rejeitado (clarificação A: origem intacta)
- Raio em pixels de tela — rejeitado (spec: independente do zoom visual)

## 2. Como aplicar raios distintos no fluxo

**Decision**: Em `onStageClick` com `mode === 'draw-seg'`:
- Se `draftA == null` → `nearestWaypoint(x, y, ORIGIN_SNAP)`
- Se `draftA != null` → `nearestWaypoint(x, y, FINISH_SNAP)` para decidir se fecha; se não houver hit, adicionar intermediário

**Rationale**: Mesma função, parâmetro `maxDist` já existe; mudança mínima.

**Alternatives considered**: Duas funções separadas — desnecessário; filtros por id — overkill.

## 3. Clique no marcador do nó

**Decision**: Manter handlers `onClick` nos botões `.route-digitizer__wp` que fecham o segmento ao clicar no destino; não reduzir o alvo do botão nesta feature (FR-004).

**Rationale**: Atalho explícito; o problema reportado é o snap por proximidade no clique do stage (`nearestWaypoint`), não o pin de 14px.

**Alternatives considered**: Encolher CSS do pin — fora do escopo principal; pode atrapalhar origem.

## 4. Dica de UI (US3)

**Decision**: Ajuste leve do texto de hint quando origem já está escolhida (ex.: enfatizar “clique **no nó** de destino ou bem junto a ele”), sem modal/erro novo em clique longe.

**Rationale**: Spec P3; comportamento previsível + dica curta; FR já diz sem erro alarmante.

**Alternatives considered**: Sem mudança de copy — aceitável se comportamento basta; plano inclui tweak mínimo.
