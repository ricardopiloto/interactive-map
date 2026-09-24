# Quickstart: Revelação progressiva (Local e Arco)

**Feature**: `113-revelacao-progressiva`

## Prerequisites

Backend + frontend running; campaign with map and at least two locais.

## 1. Schema

```bash
cd backend
uv run pytest tests/test_visibility_local_arco.py -q
```

**Expect**: migration adds flags; existing seed rows remain `visivel_para_todos=true`.

## 2. Leak matrix (SC-001)

1. Create local A (visible) with saída to B; B hidden; NPC Elara linked to B only; Elara visible.
2. As anonymous: `GET …/locais` — no B; `GET …/locais/{A}` — `saida_ids` without B; `GET …/npcs` Elara — `local_ids` without B; `GET …/locais/{B}` → 404.
3. As GM / admin list — B present with `visivel_para_todos=false`.

## 3. Hidden arco (SC-002)

1. Local D visible, arco C hidden, D.arco_id = C.
2. Anonymous: D in list with `arco_id: null`; C absent from `GET …/arcos`.
3. UI: D shows «Sem arco» (or equivalent i18n); Edit Mode shows C with oculto badge.

## 4. Edit Mode badge + toggle

1. Enable Edit Mode; hide a local and an arco via form checkbox; save.
2. Confirm badge matches NPC oculto treatment on lists.
3. Disable Edit Mode — public map/list hide those items.

## 5. Media

1. Upload image only on hidden local.
2. Anonymous `GET …/media/locals/{file}` → denied; member → OK.

## 6. Export

```bash
uv run pytest tests/test_import_roundtrip.py -q
```

**Expect**: flags survive round-trip; old packages without field import as visible.
