# Implementation Plan: Mapa

**Branch**: `103-mapa` | **Date**: 2026-09-21 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/103-mapa/spec.md`

**Release**: `0.19.1` + CHANGELOG `[Unreleased]`. Sem `/opt`.

**Depends on**: UX-1/2/3 Implemented; clarifications 2026-09-20/21 (nomes limiar+hover; zoom bottom-right; legenda fechada bottom-left; fechar Esc/fora/botão).

## Summary

Apresentação do mapa: painel translúcido legível (canto inferior direito), pinos com forma=estado e cor do mestre, nomes no limiar de zoom e hover, popover ancorado sem dimming e sem «Sem descrição.», legenda recolhível (canto inferior esquerdo, inicia fechada). Sem mudanças de API/dados. Ver [research.md](./research.md).

## Technical Context

**Language/Version**: TypeScript / React 19 / Vite  
**Primary Dependencies**: `react-zoom-pan-pinch`, Tabler icons, tokens UX-1, IconButton UX-2  
**Storage**: N/A (legenda sem persistir)  
**Testing**: checklist visual quickstart; `lint:tokens` / `test:contrast`  
**Target Platform**: SPA  
**Project Type**: web frontend  
**Performance Goals**: N/A  
**Constraints**: sem API/schema; hex só em cor dinâmica do mestre; zero `/opt`  
**Scale/Scope**: `CampaignMap`, `PinModal`, CSS mapa, locales `mapa`

## Constitution Check

- **I**: N/A conteúdo. **PASS**
- **II**: checklist legibilidade + sem overlay. **PASS**
- **III**: Zero `/opt`. **PASS**
- **IV**: sem lib de mapa nova. **PASS**
- **V**: i18n controlos/legenda. **PASS**
- **VI**: N/A. **PASS**

**Post-Phase 1**: Unchanged.

## Project Structure

### Documentation

```text
specs/103-mapa/
├── plan.md, research.md, data-model.md, quickstart.md
├── contracts/ {map-controls.md, pin-visual.md, pin-popover.md}
└── tasks.md
```

### Source Code

```text
frontend/src/components/map/CampaignMap.tsx|.css
frontend/src/components/common/PinModal.tsx|.css
frontend/src/locales/{pt-BR,en}/mapa.json
CHANGELOG.md
```

**Structure Decision**: Evoluir CampaignMap + PinModal in-place.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| (none) | — | — |
