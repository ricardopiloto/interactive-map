# Implementation Plan: Reverter offset/tamanho de pins (030)

**Branch**: `034-revert-pin-offset` | **Date**: 2026-08-03 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/034-revert-pin-offset/spec.md`

## Summary

A âncora/tamanho introduzidos pela 030 (`--pin-size`, `transform-origin: 100% 100%`, margens `calc(-1 * size)`, media `799px`) deslocam o pin relativamente ao ponto de reposicionamento. Reverter só a apresentação de pin/grupo em `CampaignMap.css` ao baseline **pré-030** (`margin-left: -12px`, `margin-top: -22px`, sem media de tamanho móvel). Marcar `specs/030-pin-size-offset` como **Deferred / Staged**. Ajustar CHANGELOG para não apresentar a 030 como shipped. Preservar 032/033 e restantes estilos do mapa (banner Cancelar, conexões, etc.).

## Technical Context

**Language/Version**: CSS (+ docs markdown); TypeScript/React inalterados

**Primary Dependencies**: `CampaignMap.css`; artefactos Speckit da 030

**Storage**: N/A

**Testing**: Validação manual via [quickstart.md](./quickstart.md)

**Target Platform**: Browsers modernos

**Project Type**: Web application (reversão de apresentação + status de feature)

**Performance Goals**: Inalterado

**Constraints**:
- Restaurar âncora/tamanho pré-030 (FR-001–FR-003)
- Sem alterar coordenadas/API (FR-004)
- 030 docs → Deferred/Staged; produto sem visual 030 (FR-005; clarificação A)
- Não regredir 032/033 (FR-006–007)

**Scale/Scope**: `frontend/src/components/map/CampaignMap.css` (blocos pin/party + media 799); `specs/030-pin-size-offset/spec.md` (Status); `CHANGELOG.md` (remover claims 030 activos)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Status |
|------|--------|
| Só apresentação pin/grupo; sem dados | PASS |
| 030 diferida, não apagada | PASS |
| 032/033 preservados | PASS |
| Baseline pré-030 identificável (HEAD / research 030) | PASS |

**Post-design re-check**: PASS — contrato UI de reversão; data-model = estado de feature; sem API.

## Project Structure

### Documentation (this feature)

```text
specs/034-revert-pin-offset/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── ui-revert-pin-030.md
└── tasks.md
```

### Source Code / docs touched

```text
frontend/src/components/map/CampaignMap.css   # restaurar pin/party pré-030; remover @media 799 pin sizes
specs/030-pin-size-offset/spec.md            # Status: Deferred / Staged (+ nota)
CHANGELOG.md                                 # retirar bullets 030 como shipped (0.6.0 Changed/Fixed)
```

**Structure Decision**: Reversão cirúrgica no CSS de pin/grupo. Não reescrever o ficheiro inteiro a partir de `git checkout` cego (há estilos pós-030 a manter: banner Cancelar, etc.).

## Complexity Tracking

Sem violações.
