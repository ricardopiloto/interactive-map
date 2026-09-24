# Contract: Entry relocation (118)

**Feature**: `118-rede-rotas-entrada`  
**Related**: [digitizer-shell.md](./digitizer-shell.md)

## Map page (remove)

| Before | After |
|--------|--------|
| `map-page__gm-menu` includes menuitem that sets `routeDigitizerOpen` | That menuitem **absent** |
| `RouteDigitizerView` mounted from `MapPage` when open | **Not** mounted from `MapPage` |
| GM tools button + menu for other actions | **Unchanged** |

Verification: `rg -n 'routeDigitizer|RouteDigitizer|routeNetwork' frontend/src/pages/MapPage.tsx` → no open path (i18n key may remain unused here).

## Rota page (add)

| Rule | Detail |
|------|--------|
| Control | Button labeled via `mapPage.routeNetwork` (pt-BR «Rede de rotas» / en «Route network») |
| Visibility | Only when edit mode / GM flag used by Rota for editing is true |
| Placement | Absolute top of map stage (prototype: top-right, `z-index` above map, below header) |
| Action | `digitizerOpen = true` |
| Overlay | Same `RouteDigitizerView` props pattern as former MapPage mount (`mapUrl`, `locais`, campaign refresh, `onClose`) |
| Non-GM | Button not in DOM (or not visible / not focusable) |

## MUST NOT

- Second digitizer component or route
- Remove GM menu solely because route-network left
- Change digitizer open/close semantics beyond call-site move
