# Contract: Removal gates (117)

**Feature**: `117-aposentar-nocturne`

Delete `frontend/src/styles/nocturne.css` and remove its import from `frontend/src/main.tsx` **only if all gates pass**.

## Gate A — Grep clean (outside kit)

From repo root, searches over `frontend/src` excluding `frontend/src/components/ui/**` MUST find **no** matches for target tokens in [migration-map.md](./migration-map.md).

Suggested checks (adjust if false positives; document exceptions in PR):

```bash
rg -n 'btn-primary|btn-secondary|btn-ghost|btn-danger|btn-icon|btn-block|btn-sm' frontend/src --glob '!**/components/ui/**'
rg -n 'className="[^"]*\bbtn\b|className=\{`[^`]*\bbtn\b|className=\{[^}]*\bbtn\b' frontend/src --glob '!**/components/ui/**'
rg -n 'className="input"|className=\{`input|className=\{[^}]*\binput\b' frontend/src --glob '!**/components/ui/**'
rg -n '\bseg-opt\b|\bclassName="seg"|className=\{`seg' frontend/src --glob '!**/components/ui/**'
rg -n '\btag-accent\b|\btag-outline\b|\btag-neutral\b|className="tag"|className=\{`tag' frontend/src --glob '!**/components/ui/**'
rg -n 'dialog-backdrop|className="dialog"|dialog-title|dialog-actions|dialog-body|dialog__' frontend/src --glob '!**/components/ui/**'
rg -n 'className="card"|card-meta|elev-sm|elev-md|elev-lg' frontend/src --glob '!**/components/ui/**'
```

## Gate B — Kit self-contained

```bash
rg -n 'dialog-body|dialog-backdrop|className="btn |className="input"|className="tag |className="seg' frontend/src/components/ui
```

MUST be empty (or only comments). Kit styles live in `ui.css` / component CSS with `ui-` prefix.

## Gate C — Globals absorbed

`global.css` (or other always-loaded stylesheet besides deleted nocturne) includes necessary:

- body / heading font stack already from tokens
- `:focus-visible` / `::selection` if still required
- `.text-muted` if still referenced
- `.field > label` if forms still use `.field` wrappers

Form-specific portrait/image rules formerly in nocturne MUST live under form/media CSS.

## Gate D — Build

```bash
cd frontend && npx tsc -p tsconfig.app.json --noEmit
```

Exit 0.

## Gate E — File gone

- `frontend/src/styles/nocturne.css` does not exist
- `frontend/src/main.tsx` has no `nocturne` import
- App boots; smoke per [quickstart.md](../quickstart.md)
