# Quickstart: Rede de rotas — entrada e casca (118)

Validate [spec.md](./spec.md) SC-001–005 and contracts [entry-relocation.md](./contracts/entry-relocation.md), [digitizer-shell.md](./contracts/digitizer-shell.md).

## Prerequisites

- Backend + `frontend` dev servers running; campaign with map image and GM account
- Modo edição available in header
- Optional: open prototype digitizer side-by-side (`frontend-next`) for visual compare

## 1. Entry relocation

1. Log in as GM → open `/c/{slug}` (Mapa) → enable Modo edição.
2. Open GM tools menu → confirm **no** «Rede de rotas» / «Route network»; other items still present.
3. Open `/c/{slug}/rota` → confirm button «Rede de rotas» top of map stage.
4. Disable Modo edição (or use non-GM session) → button **absent**.
5. Re-enable Modo edição → click button → digitizer fullscreen; **Sair** returns to Rota planner.

## 2. Shell parity (visual)

1. With digitizer open (claro + escuro): capture toolbar (chips), zoom controls, list/search, scale field.
2. Compare to prototype `RouteDigitizer` and to Map page zoom pills — circular/translucent zoom, chip modes, soft list chrome.
3. Pass if no obvious legacy square chrome / old radius on those controls.

## 3. Behavior regression (must not change)

1. Create a waypoint (Novo nó).
2. Traçar segmento **with at least one intermediate point** (product behavior) → save.
3. Adjust map scale → save → reload Rota planner still sees network.
4. Fail if any of these steps differ from pre-feature behavior (beyond looks).

## 4. Build gate

```bash
cd frontend && npx tsc -p tsconfig.app.json --noEmit
```

Exit 0.

## 5. Grep sanity

```bash
rg -n 'setRouteDigitizerOpen|RouteDigitizerView' frontend/src/pages/MapPage.tsx || true
rg -n 'RouteDigitizerView|routeNetwork|digitizerOpen' frontend/src/pages/RotaPage.tsx
```

Expect: MapPage has no digitizer open path; RotaPage wires the view + label.
