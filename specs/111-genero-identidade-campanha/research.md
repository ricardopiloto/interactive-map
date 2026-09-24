# Research: Gênero como identidade da campanha

**Feature**: `111-genero-identidade-campanha`  
**Date**: 2026-09-22

## 1. Attribute model: `genero` replaces `acento_id`

**Decision**: Add NOT NULL `genero` (`fantasia|gotico|scifi|urbano`); drop `acento_id` in the same Alembic control revision after backfill.

**Rationale**: Spec retires loose accent entirely; keeping a dead column invites dual sources of truth.

**Alternatives considered**: Keep `acento_id` nullable unused — rejected (simplicity). Soft-deprecate without drop — rejected.

## 2. Backfill mapping

**Decision** (order):

1. If `sistema == "wfrp4e"` and (`acento_id` in `{None, "", "latao"}`) → `fantasia`
2. If `sistema == "wod"` and `acento_id == "vinho"` → `gotico`
3. Else if `acento_id == "vinho"` → `gotico`
4. Else → `fantasia`

**Rationale**: Matches product prompt / production WFRP+WoD; safety net for other accents.

**Alternatives considered**: Map only by sistema — rejected (prompt includes accent fallback). Map verde/azul/cobre to other genres — rejected (out of scope; no production cases).

## 3. Tokens: `data-genre` + existing `data-theme`

**Decision**: Port prototype genre palettes into `frontend/src/styles/tokens.css` using `html[data-genre='…']`, keeping **app token names** (`--color-text`, `--color-column`, `--color-accent-fill`, vínculo aliases). Keep `data-theme='light'|'dark'` for user preference. Remove `data-campaign-accent=*`. Shell (home/painel fora da mesa) defaults to `data-genre='fantasia'` (product chrome).

**Rationale**: Spec 110 left fantasia-as-base under `data-theme` only; 111 completes four skins. Avoid renaming hundreds of `--color-text` refs to `--color-text-1`.

**Alternatives considered**: Rename to prototype `data-mode` — rejected this phase (churn). Keep accent overlays — rejected by FR-004.

## 4. Light mode vs genres without light

**Decision**: `supportsLight` only for `fantasia`. On campaign routes (`/c/:slug…`), if genre is gotico|scifi|urbano, force `data-theme='dark'` for the session of that page (do not overwrite persisted user preference for other routes). Creation form live preview: same rule when previewing those genres.

**Rationale**: Clarify default A; matches prototype `supportsLight: false`.

**Alternatives considered**: Invent light palettes for three genres — rejected (contrast work + out of clarify default).

## 5. Capa API

**Decision**: Replace `PATCH /api/campanhas/{slug}/identidade` with `PATCH /api/campanhas/{slug}/capa` body `{ capa_arquivo?: string, limpar_capa?: bool }`. Remove accent fields from create/catalog/painel/config.

**Rationale**: Clarify default A; capa remains editable; accent gone.

**Alternatives considered**: Keep identidade endpoint without accent — rejected (naming confusion). Capa create-only — rejected.

## 6. Export / import

**Decision**: Manifest writes `genero` (required for new packages). On import: if `genero` present and valid → use it; else derive from `acento_id` (+ `sistema` when available) via the same backfill function; refuse unknown `genero`. Stop writing `acento_id` on new exports (old packages may still have it).

**Rationale**: Clarify default A; SC-003 + legacy zips.

**Alternatives considered**: Refuse old packages — rejected. Dual-write both fields forever — rejected after cutover (optional one-release dual-write not needed if import maps).

## 7. Frontend creation UX

**Decision**: Mirror NovoCodexWizard: four genre cards; selecting sets preview `data-genre` on a scoped form container (or temporary document attribute restored on unmount); `sistema` text input with suggested chips from genre def (non-binding). `POST` body includes `genero`.

**Rationale**: Spec FR-006 / FR-007; prototype is the UX source.

## 8. Service module rename

**Decision**: Replace `accent_palette.py` with `genre_palette.py` (`GENRE_IDS`, `normalize_genero`, `genero_from_legacy(sistema, acento_id)`, optional `suggested_systems` constants mirrored for API/docs only — UI copy lives in i18n).

**Rationale**: Clear retirement of accent IDs.

## 9. Contrast gate

**Decision**: Extend `check-contrast.mjs` to sample each genre dark (and fantasia light) with the same pairs as today; must pass AA thresholds. Drop accent-swatch matrix.

**Rationale**: Constitution / UX-1 gate survives identity change.

## 10. Playwright / visual

**Decision**: Update quality baselines after genre skins land (at least one fantasia + one gotico mesa if fixtures allow). Not a blocker for backend TDD order.

**Rationale**: Visual identity change will fail pixel diffs otherwise.
