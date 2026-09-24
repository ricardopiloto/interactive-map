# Implementation Plan: Componentes base e ícones

**Branch**: `101-componentes-base-icones` | **Date**: 2026-09-20 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/101-componentes-base-icones/spec.md`

**Release**: `0.19.1` + CHANGELOG `[Unreleased]`. Sem `/opt`.

**Depends on**: UX-1 (100) Implemented; clarifications 2026-09-20 (own overlays; coexist legacy CSS; imperative toast; pointer:coarse 44px; Drawer demo-only).

## Summary

Biblioteca de primitivos React sobre tokens UX-1 + `@tabler/icons-react` (MIT, imports por ícone). Dialog/Drawer/ConfirmDialog próprios (Esc, focus trap, restore, aria-modal, scroll lock). Toast imperativo + Provider. Substituir 10 `window.confirm`/`alert`. Demo no `/__styleguide`. Sem redesenhar ecrãs; CSS legado pode coexistir. Ver [research.md](./research.md).

## Technical Context

**Language/Version**: TypeScript / React 19 / Vite  
**Primary Dependencies**: `@tabler/icons-react` (nova); sem Radix/Headless UI  
**Storage**: N/A  
**Testing**: script/checklist zero `window.confirm|alert` em `frontend/src`; smoke manual Esc/foco; bundle note no CHANGELOG  
**Target Platform**: SPA  
**Project Type**: web frontend  
**Performance Goals**: tree-shake icons; document bundle delta  
**Constraints**: max 1 primary Button/vista; 40/44 px; tokens only  
**Scale/Scope**: ~15 componentes + 10 call sites + styleguide demos  

## Constitution Check

- **I**: N/A conteúdo. **PASS**
- **II**: gate ausência confirm/alert; Esc/foco checklist. **PASS**
- **III**: Zero `/opt`. **PASS**
- **IV**: só Tabler + impl própria. **PASS**
- **V**: pt-BR/en para copy nova. **PASS**
- **VI**: N/A. **PASS**

**Post-Phase 1**: Unchanged.

## Project Structure

### Documentation

```text
specs/101-componentes-base-icones/
├── plan.md, research.md, data-model.md, quickstart.md
├── contracts/ {components-api.md, confirm-alert-migration.md, toast-api.md}
└── tasks.md
```

### Source Code

```text
frontend/src/components/ui/     # Button, IconButton, Input, Select, Textarea,
                                # Tabs, Chip, Card, DropdownMenu, Tooltip,
                                # EmptyState, Skeleton, Dialog, Drawer,
                                # ConfirmDialog, ToastProvider + toast.ts
frontend/src/main.tsx           # wrap ToastProvider
frontend/src/pages/StyleGuidePage.tsx  # demos
frontend/src/{pages,components}/…      # migrate 10 call sites
frontend/package.json           # @tabler/icons-react
CHANGELOG.md
```

**Structure Decision**: Pasta `ui/` nova; ConfirmDialog usa Dialog; Toast = module + portal.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| (none) | — | — |
