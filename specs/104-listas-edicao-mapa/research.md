# Research: Listas e edição no mapa

**Feature**: `104-listas-edicao-mapa`

## 1. Admin vs read lists

**Decision**: Keep swap to Local/Npc/ArcoAdminList when edit mode on (clarify B); restyle those components. Read SideMenu gets arco grouping + compact + EmptyState independently.

## 2. Row actions

**Decision**: Hover reveals Edit/Delete IconButtons (`pointer: fine`); DropdownMenu ⋮ always when edit mode. Danger only on ConfirmDialog.

## 3. Status

**Decision**: Dot + text label; CSS classes mapped to status keys using tokens (visited/accent/info/muted).

## 4. Arco sections

**Decision**: Group by `arco_id`; null → «Sem arco» i18n; all expanded by default; collapse toggles local Set/Map state.
