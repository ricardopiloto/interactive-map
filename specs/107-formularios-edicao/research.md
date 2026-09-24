# Research: Formulários e edição

## 1. Shell

**Decision**: `FormDrawer` wraps UX-2 `Drawer` + ConfirmDialog for dirty close; CSS bottom sheet ≤800px.

## 2. Markdown

**Decision**: `MarkdownField` with Tabs Escrever/Pré-visualizar; `MarkdownSafe` for preview.

## 3. Validation

**Decision**: errors map on save; clear field error on change after first submit.

## 4. Dirty / switch entity

**Decision**: dirty via JSON snapshot of draft on mount; close paths go through FormDrawer. Parent closes one form before opening another (existing XOR state); if replacing same dialog type, remount via `key`.
