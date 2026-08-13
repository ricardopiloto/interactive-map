# Quickstart: Internacionalização da Interface

**Feature**: `080-i18n-interface`  
**Purpose**: Validate locale detection, UI coverage, API error localization ([spec.md](./spec.md)).

## Prerequisites

- Backend + frontend running (`uv run uvicorn …`, `npm run dev`)
- Branch `080-i18n-interface` with i18n wired
- Browser devtools → Application → localStorage (clear `i18nextLng` between detection tests)
- Optional: Chrome language override for EN/PT scenarios

## Scenarios

### 1. Browser detection — English (US1)

1. Clear localStorage language keys.
2. Set browser language to `en-US` (or use profile with English primary).
3. Open `/`.
4. **Expect**: Header nav in English (`Map`, `Relations` or equivalent keys); GM toggle English.

### 2. Browser detection — Portuguese variants (US1, Clarify Q4)

1. Clear localStorage; set browser to `pt-PT`.
2. Open `/`.
3. **Expect**: UI PT-BR (not fallback confusion with EN).

### 3. Unsupported language fallback (US1)

1. Clear localStorage; set browser to `fr-FR`.
2. Open `/`.
3. **Expect**: UI PT-BR.

### 4. Manual override persists (US1, FR-003)

1. Open app; click selector → **EN**.
2. Reload page.
3. **Expect**: Still EN.
4. Switch to **PT**; reload → PT-BR.

### 5. Instant switch without reload (SC-004)

1. Open `/relacoes` in PT.
2. Switch to EN via selector.
3. **Expect**: Column labels, buttons update within 1 s; no full navigation reload.

### 6. Main surfaces EN coverage (US2, SC-001)

With UI **EN**, complete:

1. **Mapa** — sidebar, pin modal open (UI chrome only)
2. **Relações** — column, open personagem detail, open GM edit dialog
3. **Digitalização** — GM → open route digitizer; column search, Waypoints/Arestas sections, mobile sheet ≤800px if available

**Expect**: No visible hardcoded Portuguese in UI chrome. Master-written names/descriptions **unchanged** (still Portuguese if campaign is PT).

### 7. Master content unchanged (FR-004)

1. Note a local description in PT from GM data.
2. Toggle EN ↔ PT.
3. **Expect**: Description text identical; only surrounding UI labels change.

### 8. Upload error localized (US3, SC-003)

1. UI **EN**; GM upload image &gt; limit (or use test file).
2. **Expect**: English error message with size limit; network response `detail.erro = ARQUIVO_EXCEDE_TAMANHO_MAXIMO`.
3. Repeat with UI **PT** → Portuguese equivalent.

### 9. AdminGate auth errors (US3)

1. UI **EN**; open GM gate; enter wrong password.
2. **Expect**: English invalid-credentials message (not PT server string).
3. Response uses `CREDENCIAIS_INVALIDAS` code.

### 10. Unknown API code (US3 edge)

1. Temporarily mock client to receive `{ erro: "TESTE_DESCONHECIDO" }`.
2. **Expect**: Generic localized error; no crash; no raw JSON shown.

### 11. Hub out of scope

1. Open `hub/index.html` (static).
2. **Expect**: Still PT-only (no regression required in 080).

## Audit (SC-002)

```bash
# Heuristic: Portuguese UI literals in src (tune allowlist as needed)
rg -n "[ÁÉÍÓÚáéíóúãõç]" frontend/src --glob '*.tsx' --glob '!**/locales/**'
cd frontend && npm run build
```

**Expect**: ≥95% of main-surface strings use `t()`; grep hits trend to zero in covered components.

## Contracts

- [api-error-codes.md](./contracts/api-error-codes.md)
- [ui-locale-detection.md](./contracts/ui-locale-detection.md)
- [ui-language-selector.md](./contracts/ui-language-selector.md)
- [ui-translation-namespaces.md](./contracts/ui-translation-namespaces.md)

## Typecheck

```bash
cd frontend && npm run build
```
