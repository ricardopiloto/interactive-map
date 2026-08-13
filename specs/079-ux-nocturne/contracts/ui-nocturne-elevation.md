# UI Contract: Elevação Nocturne

**Feature**: `079-ux-nocturne`  
**Stylesheet**: `frontend/src/styles/nocturne.css` + component CSS overrides

## Principle

Separação entre camadas via **sombra/elevação**, não `border` grosso delimitando painéis. Paleta dark + accent blurple **inalterada**.

## Token layers

| Token | Typical use | vs lower layer |
|-------|-------------|----------------|
| `--elevation-column` | Colunas fixas 236px (Mapa, Relações, digitalização) | Sombra lateral suave; remove `border-right` principal |
| `--elevation-panel` | Painel detalhe, PinModal | Sombra mais forte que coluna |
| `--elevation-modal` | `.dialog` GM | Sombra mais forte que painel + backdrop escurecido |

Implementação pode mapear para `--shadow-md` / `--shadow-lg` retuned (menos hairline 1px dominante, mais blur ambiente).

## Surfaces in scope

| Surface | File(s) | Structural change |
|---------|---------|-------------------|
| Mapa — coluna lateral | `SideMenu.css` | Visual only |
| Relações — coluna | `RelacoesSideColumn.css` | Visual only; mobile layout **unchanged** |
| Relações — painel detalhe | `RelacoesDetailPanel.css` | Stronger elevation |
| Digitalização — coluna | `RouteDigitizer.css` | New column + elevation |
| Modal pin local | `PinModal.css` | Elevation bump |

## Accent blurple (FR-008)

Permitted on:

- Primary/ghost buttons
- Selected/active chips and tabs
- Selected graph node ring
- Focus rings (`:focus-visible`)

**Not** on:

- Static headings, labels, dividers, decorative icons
- Non-interactive list rows (except selected state)

## Reference

- Google Maps: **disposição** de camadas flutuantes — **not** light theme.

## Verification (SC-003)

Side-by-side before/after: coluna Mapa/Relações sem contorno pesado visível; separação perceptível por sombra.

## Out of scope

- Hub estático (`hub/` — frente 078)
- Typography / radius token changes
- Converting fixed columns to floating panels
