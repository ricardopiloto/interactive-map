# Implementation Plan: Listas e edição no mapa

**Branch**: `104-listas-edicao-mapa` | **Date**: 2026-09-21 | **Spec**: [spec.md](./spec.md)

**Release**: `0.19.1` + CHANGELOG `[Unreleased]`. Sem `/opt`.

**Depends on**: UX-2/3/4 Implemented; clarifications (secções expandidas; hover+⋮; admin lists reestilizadas; Locais+NPCs+Arcos; status ponto+texto).

## Summary

Coluna do mapa: lista de leitura com locais por arco (recolhíveis, iniciam abertas, linhas compactas), NPCs com avatar + status ponto+texto, EmptyState. Com Modo edição: continuar `LocalAdminList` / `NpcAdminList` / `ArcoAdminList` reestilizados (linhas, hover+⋮, ConfirmDialog). Sem API nova.

## Technical Context

**Language/Version**: TypeScript / React 19  
**Primary Dependencies**: UX-2 ConfirmDialog, DropdownMenu, EmptyState, IconButton; EditMode from UX-3  
**Storage**: N/A (collapse state local React)  
**Testing**: checklist SC-001–005; lint:tokens  
**Constraints**: sem API; zero `/opt`

## Constitution Check

I–VI: **PASS** (UI-only; i18n; ConfirmDialog).

## Project Structure

```text
frontend/src/components/sidebar/SideMenu.tsx|.css
frontend/src/components/admin/{Local,Npc,Arco}AdminList.tsx
frontend/src/components/admin/adminList.css  # shared compact rows
frontend/src/locales/{pt-BR,en}/mapa.json + admin.json
CHANGELOG.md
```

## Complexity Tracking

(none)
