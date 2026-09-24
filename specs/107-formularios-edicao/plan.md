# Implementation Plan: Formulários e edição

**Branch**: `107-formularios-edicao` | **Date**: 2026-09-21 | **Spec**: [spec.md](./spec.md)

**Release**: `0.19.1` + CHANGELOG `[Unreleased]`.

## Summary

Local/NPC/arco/vínculo/personagem em Drawer (direita / bottom mobile); secções; validação inline ao Guardar; ConfirmDialog se sujo; Markdown tabs em descrições local+personagem/NPC; ImageSlot DnD+Toast (já existe).

## Technical Context

**Language/Version**: TS/React  
**Primary Dependencies**: Drawer, ConfirmDialog, Toast, MarkdownSafe, ImageSlot  
**Testing**: checklist manual  
**Constraints**: sem API/schema novos

## Constitution Check

PASS (I–VI).

## Project Structure

```text
frontend/src/components/ui/Drawer.tsx|.css   # mobile bottom sheet
frontend/src/components/forms/MarkdownField.tsx
frontend/src/components/forms/FormDrawer.tsx  # dirty + ConfirmDialog
frontend/src/components/admin/LocalFormDialog.tsx
frontend/src/components/admin/NpcAdminList.tsx (NpcFormDialog)
frontend/src/components/admin/ArcoAdminList.tsx (ArcoFormDialog)
frontend/src/components/relacoes/PersonagemFormDialog.tsx
frontend/src/components/relacoes/VinculoFormDialog.tsx
locales + CHANGELOG
```

## Complexity Tracking

(none)
