# Implementation Plan: Estilo das linhas de conexão

**Branch**: `019-connection-line-style` | **Date**: 2026-08-03 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/019-connection-line-style/spec.md` (vermelho família visitado mais claro; opacidade ~55–65%; sombra suave; regras de visibilidade 017 intactas).

## Summary

Restilizar as linhas SVG de conexão de saída (017) em `CampaignMap.css`: sair do accent roxo e aplicar **vermelho claro da família visitado** (`#e5484d`), com **opacidade moderada (~55–65%)** e **drop-shadow suave**. Sem mudanças de dados, API, JSX de segmentos ou quando as linhas aparecem.

## Technical Context

**Language/Version**: TypeScript / React + CSS (frontend existente)

**Primary Dependencies**: `CampaignMap.css` (classe `.campaign-map__connection-line`); markup SVG já em `CampaignMap.tsx` (017)

**Storage**: N/A

**Testing**: Validação visual via [quickstart.md](./quickstart.md)

**Target Platform**: Browsers modernos (mesmo do Codex)

**Project Type**: Web application (ajuste visual pontual)

**Performance Goals**: Inalterado; overlay SVG leve

**Constraints**:
- Cor: família visitado, mais clara que o pin sólido (clarificação)
- Opacidade alvo ~55–65% (clarificação)
- Sombra suave/discreta, sem glow (clarificação)
- Visibilidade 017 intacta; pins/grupo intactos
- Sem setas, rótulos ou cores por destino

**Scale/Scope**: Principalmente 1 arquivo CSS (`CampaignMap.css`); JSX só se filtro/sombra exigir wrapper (não esperado)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Constitution placeholder. Gates informais:

| Gate | Status |
|------|--------|
| Spec clarificada (cor / opacidade / sombra) | PASS |
| Sem API/schema | PASS |
| Escopo só estilo da linha de conexão | PASS |
| Constitution template placeholder | PASS (N/A) |

**Post-design re-check**: PASS — UI contract + invariantes visuais; sem dados persistidos.

## Project Structure

### Documentation (this feature)

```text
specs/019-connection-line-style/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── ui-connection-line-style.md
└── tasks.md              # /speckit-tasks
```

### Source Code (repository root)

```text
frontend/src/components/map/
├── CampaignMap.css          # .campaign-map__connection-line (stroke, opacity, shadow)
└── CampaignMap.tsx          # sem mudança esperada (classe já existe)
```

**Structure Decision**: Alteração cirúrgica de CSS na linha de conexão; sem novos componentes nem backend.

## Complexity Tracking

> Sem violações a justificar.
