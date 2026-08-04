# UI Contract: Marcadores menores com tamanho fixo no zoom

**Feature**: `038-fixed-marker-size`  
**Surfaces**: `CampaignMap` (pins + grupo); `RouteDigitizerView` (`__wp`)  
**Date**: 2026-08-04

## Scope

Apresentação e hit-targets visuais. Sem HTTP. `RouteOverlay` (só linhas) fora do âmbito de “nós”.

## Size

| Aspect | Contract |
|--------|----------|
| Base local pin | ~≤60% área vs 24×24 actual (≈18×18) |
| Grupo | Mesma redução relativa |
| Digitizer nó | Mesma redução relativa vs 14×14 |
| Zoom stability | Largura aparente no ecrã Δ &lt; 10% entre min e max zoom |
| Selected/hover | Aumento perceptível de escala a partir do base novo; base continua counter-scaled ao zoom |

## Behaviour

| Aspect | Contract |
|--------|----------|
| Position | `%` left/top inalterados; âncora tip/centro preservada via margins |
| Click/touch | Continuam a seleccionar o marcador correcto |
| Segments/routes | Podem escalar / non-scaling-stroke; não precisam de counter-scale de nós inexistentes no overlay |
| Data | Sem mudança de coordenadas persistidas |

## Acceptance mapping

| Spec | Contract |
|------|----------|
| FR-001–003, SC-001–002 | Base menor |
| FR-004, SC-003, SC-005 | Counter-scale / fixed screen size |
| FR-006, FR-010 | Selected/hover scale on new base |
| FR-009 | Campaign + digitizer |
| FR-005, FR-008 | Alignment + no DB rewrite |
| FR-007, SC-004 | Usability |
