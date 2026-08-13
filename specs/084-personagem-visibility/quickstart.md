# Quickstart: Visibilidade de Personagem (GM)

**Feature**: `084-personagem-visibility`  
**Purpose**: Validate GM-only characters and cascaded edge hiding ([spec.md](./spec.md), [contracts/](./contracts/)).

## Prerequisites

- Backend + frontend running on a DB that has run the new migration (restart backend after pull)
- GM password available; second browser/profile or logout GM for player view

## Scenarios

### 1. Create hidden character (US1)

1. Modo GM → Relações → adicionar personagem.
2. Uncheck **Visível para todos**; save.
3. **Expect**: Node visible to GM with hidden badge; form shows hidden helper when editing.
4. Create a public connection from this character to a visible character.
5. Exit GM (player view) or open Relações without credentials.
6. **Expect**: Hidden character absent; connecting edge absent; other public characters/edges unchanged.

### 2. Reveal character (US2)

1. As GM, edit the hidden character; check **Visível para todos**; save.
2. As player, refresh Relacoes.
3. **Expect**: Character appears; edges appear only if still allowed by existing vínculo visibility (`publico` / conhecido).

### 3. Defaults / legacy (US3)

1. Characters created before the feature (or new character leaving the checkbox on).
2. **Expect**: Visible to players; no surprise disappearances after migrate.

### 4. Map coherence (FR-008)

1. As GM, link a hidden personagem to a local (map pin).
2. As player, open that pin’s detail.
3. **Expect**: Hidden NPC not listed (no generic placeholder).
4. As GM, same pin still shows the NPC in admin/edit flows.

### 5. API smoke (optional)

```bash
# Player: hidden id must 404 / be absent from list
curl -s localhost:8000/api/personagens | jq 'map(.visivel_para_todos) | unique'
# After creating a hidden one via admin, public list length should not include it
```

### 6. Build

```bash
cd frontend && npm run build
```

**Expect**: Typecheck/build success.
