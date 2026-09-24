# Quickstart: Aposentar nocturne.css (117)

## Prerequisites

- Specs **114–116** no branch (chrome + mapa + relações/rota).
- Backend + frontend locais; campanha `wfrp`.

## 1. Inventory refresh

1. Re-run grep patterns from [contracts/removal-gates.md](./contracts/removal-gates.md) Gate A **before** coding to refresh the file list.
2. Confirm every hit has a row in [contracts/migration-map.md](./contracts/migration-map.md) / [research.md](./research.md).

## 2. After kit extensions + migrations (before delete)

1. Gate A = empty.
2. Gate B = empty (kit).
3. Spot-check: login/register, Painel, Map, Relações, Rota, one FormDrawer (local/NPC), digitizer open if used — controls clickable, no unstyled raw buttons.

## 3. Delete nocturne

1. Move remaining globals / form-chrome CSS out of nocturne.
2. Remove import from `frontend/src/main.tsx`.
3. Delete `frontend/src/styles/nocturne.css`.
4. `npx tsc -p tsconfig.app.json --noEmit` in `frontend/`.
5. Hard refresh; claro + escuro smoke (&lt; 15 min) on auth, mapa, relações, rota, painel (SC-004).

## 4. Done criteria

- [ ] Grep Gate A/B clean  
- [ ] File absent + no import  
- [ ] tsc clean  
- [ ] Visual smoke OK  
