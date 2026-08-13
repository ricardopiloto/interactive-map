# UI Contract: Map nav & access without map image

**Feature**: `083-map-absent-gm-access`  
**Date**: 2026-08-13  
**Consumers**: `App.tsx` routes, `CodexHeader`, `MapPage`, `RelacoesPage`

## Header — link «Mapa»

| Rule ID | Condition | Behavior |
|---------|-----------|----------|
| NAV-01 | `has_map_image === true` | Render `<Link to="/">` «Mapa» |
| NAV-02 | `has_map_image === false` ∧ `isGm === true` | Render «Mapa» |
| NAV-03 | `has_map_image === false` ∧ `isGm === false` | **Do not** render «Mapa» |
| NAV-04 | `config` still loading ∧ `isGm === false` | **Do not** render «Mapa» (no player false positive) |
| NAV-05 | Link «Relações» | Always visible (unchanged) |

Prop suggestion: `showMapNav: boolean` (or `hasMapImage` + existing `isGm` computed inside header).

## Router — root `/`

| Rule ID | Condition | Behavior |
|---------|-----------|----------|
| RT-01 | `has_map_image === true` | Render `MapPage` |
| RT-02 | `!has_map_image` ∧ `!hasAdminCredentials()` | `Navigate` → `/relacoes` (replace) |
| RT-03 | `!has_map_image` ∧ `hasAdminCredentials()` | Render `MapPage` |
| RT-04 | Query `gm=1` / `admin=1` alone (no credentials, no map) | Same as RT-02 — **no** Map gate |

## Router — `/admin`

| Rule ID | Condition | Behavior |
|---------|-----------|----------|
| AD-01 | `has_map_image === true` | Redirect → `/?gm=1` (current) |
| AD-02 | `!has_map_image` | Redirect → `/relacoes` **without** opening GM dialog |

## Router — catch-all `*`

| Rule ID | Condition | Behavior |
|---------|-----------|----------|
| CA-01 | `has_map_image` | → `/` |
| CA-02 | `!has_map_image` | → `/relacoes` |

## MapPage guards

| Rule ID | Condition | Behavior |
|---------|-----------|----------|
| MP-01 | Session restore fails or no GM ∧ `!has_map_image` | Navigate → `/relacoes` |
| MP-02 | `logoutGm` ∧ `!has_map_image` | Clear credentials; navigate → `/relacoes` (immediate, no confirm) |
| MP-03 | Upload map success | Existing upload UI unchanged; refresh/invalidate `has_map_image` when practical |

## Non-goals (contract)

- No change to GM password dialog UI or credential storage format.
- No new public API fields.
- Hub (`hub/`) unchanged.
