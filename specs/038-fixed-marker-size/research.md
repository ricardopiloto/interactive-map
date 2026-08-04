# Research: Marcadores menores com tamanho fixo no zoom

**Feature**: `038-fixed-marker-size` | **Date**: 2026-08-04

## 1. Porque os pins crescem com o zoom

**Decision**: Tratar como efeito esperado de marcadores **dentro** de `TransformComponent` (transform CSS no content).

**Rationale**: Pins, party e `__wp` são filhos do conteúdo transformado; `width`/`height` em px escalam com `scale` do zoom.

## 2. Estratégia: counter-scale vs overlay externo

**Decision**: Counter-scale — aplicar `scale(calc(1 / var(--map-zoom, 1)))` (combinado com `rotate` nos pins) e actualizar `--map-zoom` a partir do zoom actual do `TransformWrapper`.

**Rationale**: Mantém `%` left/top e handlers de clique intactos; mudança localizada. Overlay de markers fora do transform exigiria projectar coordenadas e reimplementar pan sync.

**Alternatives considered**:
- Só reduzir CSS sem counter-scale — falha FR-004
- Markers em layer HTML absoluta sobre o viewport — mais código, risco de desalinhamento
- `vectorEffect` — só SVG stroke, não botões HTML

## 3. Como obter o zoom

**Decision**: Usar API do `react-zoom-pan-pinch`: `onTransformed` / `useTransformEffect` / estado no wrapper para escrever `--map-zoom` no stage (ou root do mapa). Valor = `state.scale` (ou equivalente da versão instalada).

**Rationale**: Fonte única de verdade; actualiza em wheel/botões/+focus pin.

**Caveat**: Combinar transforms CSS com cuidado — ordem típica: `rotate(-45deg) scale(calc(1 / var(--map-zoom)))` e estados selected: multiplicar ênfase, e.g. `scale(calc(1.3 / var(--map-zoom)))`, para a ênfase ser relativa ao ecrã, não ao mapa.

## 4. Dimensões base (≤60% área)

**Decision**: Factor linear ≈ `√0.6 ≈ 0.775`.

| Marker | Actual (aprox.) | Novo alvo (aprox.) |
|--------|-----------------|--------------------|
| Pin local | 24×24 | ~18×18 (margins −9 / tip ajustado) |
| Party bandeira | 24×32 | ~18×24 |
| Party brasao | 22×22 | ~17×17 |
| Digitizer `__wp` | 14×14, margin −7 | ~11×11, margin −5.5 (ou 10×10 / −5) |

Ajustar `margin-left`/`margin-top` para preservar âncora (tip do pin / centro do nó).

**Rationale**: Cumpre SC-001/002 (clarification redução moderada).

## 5. Âmbito digitizer

**Decision**: Mesmo padrão de `--map-zoom` + base menor em `RouteDigitizer` (clarification A). Segmentos SVG podem manter stroke com `vectorEffect="non-scaling-stroke"` (já presente) — fora do requisito de “nós”.

## 6. Route overlay no mapa

**Decision**: Sem mudança obrigatória — só polylines, sem discos de nó. Se no futuro houver markers de nó no mapa principal, reutilizar a mesma variável.

## 7. Legenda

**Decision**: Opcional encolher ícones da legenda para harmonia visual; não precisa de counter-scale (fora do transform).

## 8. Backend

**Decision**: Sem alterações.
