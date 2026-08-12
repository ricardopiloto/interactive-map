# Quickstart: Relationship Network

**Feature**: `066-relationship-network`  
**Purpose**: Validate end-to-end against [spec.md](./spec.md) after implement.

## Prerequisites

- Backend `.env` with `ADMIN_USER` / `ADMIN_PASSWORD` (CWD-aware; see prior GM setup notes)
- Seed allowed (`ALLOW_SEED` not `0`)
- Frontend + backend running (typical: `uv run uvicorn` from `backend/`, `npm run dev` from `frontend/`)

## Setup

```bash
# from backend/
uv run python -m app.seed
```

Confirm seed includes PJs, NPCs, and vínculos with a mix of `publico` true/false (see [data-model.md](./data-model.md)).

## Smoke checks

### 1. Navigation (US3)

1. Open `/` — map loads; header shows Mapa | Relações.
2. Click **Relações** → `/relacoes`, no map background; Relações marked active.
3. Click **Mapa** → back to campaign map within ~3s perceived.

### 2. Player graph (US1 + SC-001a)

1. On `/relacoes` **without** GM mode.
2. Initial view: PJs inner, NPCs outer, **no** lines.
3. Select a character with mixed public/private links (seed).
4. After ~0.6s animation, lines appear only for **public** edges; private edges absent from stage and detail list.
5. Deselect (bg / same node / ×) → clean rings, no lines.

### 3. Filters & detail (US2)

1. Search by name → find character.
2. Toggle type chips → edges of other types hide.
3. Isolar selecção → only focus + directs.
4. Click another name in vínculos list → focus switches.

### 4. GM CRUD & visibility (US4)

1. Enter GM (`/?gm=1` or header toggle + Basic Auth).
2. On Relações, load should include **private** edges.
3. `+ Conexão` → new vínculo; confirm `publico` defaults off; player session must not see it until marked public.
4. Edit line click / list Edit → change tipo/nota/público.
5. Update portrait on an NPC personagem → same image on map PinModal / NPC list ([SC-006](./spec.md)).
6. Delete personagem → gone from graph and map; vínculos involving them removed.

### 5. API spot-check

```bash
curl -s "$API/api/personagens" | head
curl -s "$API/api/vinculos"   # only publico
curl -s -u "$ADMIN_USER:$ADMIN_PASSWORD" "$API/api/admin/vinculos"  # all
```

## Pass criteria

- SC-001 / SC-001a / SC-002 / SC-004 / SC-005 / SC-006 observable as above
- Contracts: [api-personagens.md](./contracts/api-personagens.md), [api-vinculos.md](./contracts/api-vinculos.md), [ui-relacoes.md](./contracts/ui-relacoes.md)
