# Quickstart: Acesso ao Mapa Sem Imagem (GM)

**Feature**: `083-map-absent-gm-access`  
**Purpose**: Validate map nav/routing when the campaign map image is missing ([spec.md](./spec.md), [contracts/ui-map-nav-access.md](./contracts/ui-map-nav-access.md)).

## Prerequisites

- Backend + frontend running (`backend` + `frontend` `npm run dev`)
- Ability to toggle map presence for the instance (e.g. rename/remove `campaign-map.webp` under the instance uploads map dir, then restart or wait for config that re-reads disk — `has_map_image` comes from server filesystem check)
- Clear GM session between player tests: use «Sair do modo GM» or clear site `sessionStorage`

## Scenarios

### 1. Player / visitor without map (US1, FR-001, FR-002)

1. Ensure instance has **no** map image (`has_map_image: false` via `GET /api/config`).
2. Open `/` in a clean session (no GM).
3. **Expect**: Land on `/relacoes`; header shows **Relações** only (no «Mapa»).
4. Open `/?gm=1`, then `/admin`, then a nonsense path.
5. **Expect**: Each ends on `/relacoes`; **no** GM password dialog auto-opens; still no «Mapa» link.

### 2. GM unlock then open Map (US2, FR-003, FR-004, FR-008)

1. Still no map image; on `/relacoes`.
2. Click «Acesso restrito» / restricted access; enter GM password.
3. **Expect**: Mode GM on; **«Mapa»** appears in the header.
4. Click «Mapa».
5. **Expect**: `/` opens Map page (placeholder / upload UI) within ~3 s; not bounced to Relações.

### 3. GM logout on Map without image (US2.4, FR-007)

1. From scenario 2, on Map without image, exit GM mode.
2. **Expect**: Immediate navigation to `/relacoes`; «Mapa» hidden again.

### 4. Upload restores normal nav (US2.3, US3, SC-004)

1. As GM without map, open Map; upload a valid map image (existing UI).
2. Refresh or wait for config refresh if implemented.
3. **Expect**: `has_map_image` true; as player (logout GM), «Mapa» visible; `/` opens Map with image.

### 5. Regression with map present (US3, SC-003)

1. Instance **with** map image.
2. As player: header shows Mapa + Relações; `/` is Map.
3. As GM: same nav; `/admin` still goes to map with gate (`/?gm=1`).

### 6. Build

```bash
cd frontend && npm run build
```

**Expect**: Typecheck/build success.
