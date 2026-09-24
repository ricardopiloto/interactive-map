# Implementation Plan: Aposentar nocturne.css

**Branch**: `117-aposentar-nocturne` | **Date**: 2026-09-22 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/117-aposentar-nocturne/spec.md`

## Summary

Inventariar e migrar todos os usos das classes do design system pré-redesign (`.btn*`, `.input`, `.seg*`, `.card*`, `.tag*`, `.dialog*`) para o kit `frontend/src/components/ui`. Alargar o kit onde faltar (SegmentedControl, Chip variants, Button block/icon/sm). Absorver resets/utilitários globais de `nocturne.css` em `global.css`. Remover o import em `main.tsx` e apagar `nocturne.css` só com grep zerado + `tsc` limpo. Depende de 114–116.

## Technical Context

**Language/Version**: TypeScript / React (Vite); CSS tokens 110

**Primary Dependencies**: `components/ui` (Button, Field, Chip, Card, Dialog, Drawer, ConfirmDialog, IconButton, Tabs, Menu, Toast); `styles/global.css`; `styles/nocturne.css` (a remover)

**Storage**: N/A

**Testing**: Inventário grep + [quickstart.md](./quickstart.md) smoke visual; `npx tsc -p tsconfig.app.json --noEmit`; sem pytest

**Target Platform**: Browser (claro/escuro)

**Project Type**: web app frontend

**Performance Goals**: N/A

**Constraints**: MUST NOT criar segundo design system; MUST NOT mudar API/schema/fluxos; MUST NOT apagar nocturne com classes órfãs; kit MUST NOT depender de selectors só definidos em nocturne

**Scale/Scope**: ~25+ ficheiros consumidores (auth, painel, admin forms, digitizer, mapa/relações restos, LanguageSelector, FadigaWidget, AdminGateDialog, …); extensões mínimas do kit; delete de um CSS global

## Constitution Check

*GATE: before Phase 0 — re-check after Phase 1*

- **I. Isolamento**: Sem API nova. **N/A**. **PASS**
- **II. Testes primeiro**: UI polish — grep gate + quickstart. **PASS**
- **III. Produção legada**: Só `frontend/`. **PASS**
- **IV. Simplicidade**: Um kit; sem nocturne-2. **PASS**
- **V. i18n**: Sem copy nova obrigatória. **PASS**
- **VI. Migrações**: N/A. **PASS**

Post-design: unchanged. **PASS**

## Project Structure

### Documentation (this feature)

```text
specs/117-aposentar-nocturne/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── migration-map.md
│   ├── kit-extensions.md
│   └── removal-gates.md
└── tasks.md            # /speckit-tasks
```

### Source Code (repository root)

```text
frontend/src/main.tsx                          # remove nocturne import (last)
frontend/src/styles/nocturne.css               # DELETE after gates
frontend/src/styles/global.css                 # absorb body/typography/focus/text-muted/… 
frontend/src/components/ui/Button.tsx + ui.css # block / size / icon variants as needed
frontend/src/components/ui/Misc.tsx + ui.css   # Chip variants (accent/outline/neutral)
frontend/src/components/ui/SegmentedControl.tsx  # NEW — replace .seg/.seg-opt
frontend/src/components/ui/ConfirmDialog.tsx   # drop dialog-body → ui-* class
frontend/src/components/ui/index.ts            # export extensions
frontend/src/pages/AuthPages.tsx
frontend/src/pages/PainelPage.tsx
frontend/src/pages/SessoesPage.tsx
frontend/src/pages/MapPage.tsx                 # residual .btn/.tag only
frontend/src/pages/RelacoesPage.tsx
frontend/src/components/admin/*.tsx
frontend/src/components/gm/*.tsx
frontend/src/components/relacoes/*.tsx
frontend/src/components/routes/*.tsx
frontend/src/components/map/CampaignMap.tsx
frontend/src/components/layout/LanguageSelector.tsx
frontend/src/modules/fadiga/FadigaWidget.tsx
# + formShell / PinModal / MarkdownSafe if still referencing dialog-body
```

**Structure Decision**: Produção `frontend/` only.

## Complexity Tracking

Nenhuma violação.
