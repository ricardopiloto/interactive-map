# Contract: UI — Hub índice

**Feature**: `078-multideploy-hub`

## Surface

Public static page. No login, no GM mode.

## Layout

- Header: site title (ex. “Codex”)
- Grid of **cards**, one per valid JSON entry
- Each card: `nome` (heading), `sistema`, `mestre`, optional cover, link “Abrir campanha” → `url`

## States

| State | UI |
|-------|-----|
| Loading | Brief placeholder / “A carregar…” |
| Empty array | Message that the list is empty |
| Fetch/parse error | Message to retry; no stack traces |
| Partial invalid entries | Skip bad rows; show the rest |

## Visual

- Dark palette compatible with Codex Nocturne (reuse CSS variables if copied; no React)
- Cover optional; missing image does not break grid
- No robots.txt blocking (omit file or `Allow: /`)

## Out of scope

- i18n (080)
- Auto-register from instances
