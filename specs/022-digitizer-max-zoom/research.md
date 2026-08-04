# Research: 022-digitizer-max-zoom

## 1. Valor numérico de `maxScale`

**Decision**: `maxScale={12}` no `TransformWrapper` de `RouteDigitizerView` (mapa da campanha permanece em `maxScale={4}` → fator 3×).

**Rationale**: Clarificação B exige ~3× o teto do mapa normal. Hoje ambos usam 4; 4 × 3 = 12. Simples, testável, sem constante mágica espalhada.

**Alternatives considered**:
- `maxScale={8}` (2×) — rejeitado pela clarificação B
- `maxScale={16}` (~4×) — rejeitado (opção C não escolhida); pixelização excessiva
- Constante `CAMPAIGN_MAX * 3` em módulo compartilhado — opcional; YAGNI se só um call site muda

## 2. Controles de zoom

**Decision**: Não adicionar botões +/− / reset; manter `wheel` (e pinça nativa do `react-zoom-pan-pinch` se disponível).

**Rationale**: Clarificação A; reduz escopo e UI.

**Alternatives considered**: Controles visíveis — rejeitados na clarificação.

## 3. Passo da roda (`wheel.step`)

**Decision**: Aumentar levemente o passo da roda **só na digitalização** (ex.: de `0.1` para `0.2` ou `0.15`) se, com `maxScale={12}`, for lento demais atingir o máximo em &lt;5s (SC-002). Começar com `0.2`; validar no quickstart.

**Rationale**: Com step 0.1, ir de 1→12 exige muitos notches; SC-002 pede poucos segundos sem novos botões.

**Alternatives considered**: Manter 0.1 — risco de falhar SC-002; step muito alto (0.5) — perde fineza ao traçar.

## 4. Escala / coordenadas

**Decision**: Nenhuma mudança em `MapScale`, geometria de segmentos ou conversão km↔px. Zoom é só CSS transform / viewport.

**Rationale**: FR-003 / SC-003 — zoom visual não deve “inflar” quilômetros.

## 5. Escopo do mapa do jogador

**Decision**: `CampaignMap.tsx` permanece `maxScale={4}`.

**Rationale**: FR-005 e Out of Scope; jogadores não precisam do zoom de digitalização nesta entrega.
