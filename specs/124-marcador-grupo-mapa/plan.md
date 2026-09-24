# Implementation Plan: Posição e formato do marcador do grupo

**Branch**: `124-marcador-grupo-mapa` | **Date**: 2026-09-23 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/124-marcador-grupo-mapa/spec.md`

## Summary

Complete the visual parity and safety of the campaign group marker controls. The production map already lets the master move the marker and toggle flag/coat-of-arms, but the prototype only displays a flag and recenters the map. The product move state has no clear cancel action or reliable error feedback, and the group write endpoint currently checks campaign membership but does not require the owner role. Add equivalent map-tool controls and state in the prototype; make product move cancelable and failure-safe; and require owner authorization for marker writes. Reuse the current per-campaign model and endpoint, with no new route or migration.

## Technical Context

**Language/Version**: TypeScript/React 19 + Vite 8; Python 3.12+ backend

**Primary Dependencies**: Existing FastAPI, SQLModel, React, react-router-dom, react-zoom-pan-pinch; no new dependencies

**Storage**: Existing per-campaign SQLite `grupo_posicao` singleton. Normalized `x`, `y`, and `formato` already exist.

**Testing**: Backend pytest for owner/member/anonymous authorization, request validation, persistence and campaign isolation; frontend Playwright for owner/player controls, move/cancel/failure and both marker forms; existing accessibility checks for accessible action labels and status announcements.

**Target Platform**: Chromium web app, desktop and mobile map layouts; UI strings in pt-BR and en

**Project Type**: Full-stack web application with production frontend, backend API and visual prototype

**Performance Goals**: Reuse the single existing write endpoint and keep map movement/cancel interaction immediate; only show a new saved position after persistence succeeds.

**Constraints**: Coordinates remain normalized to `[0,1]`; formats remain `bandeira` and `brasao`; endpoint is scoped by campaign slug. Master means campaign owner (`papel == dono`). The shared map tools menu is defined in spec 123; this feature adds two actions there and must not duplicate it. Prototype state is mock/local only.

**Scale/Scope**: Group marker map UI, one existing admin write endpoint's authorization, product and prototype state, validation/error feedback and tests. No new API route, entity, schema migration, external service or dependency.

## Constitution Check

- **I. Isolamento**: PASS. No new route. Existing `PUT /api/c/{slug}/admin/grupo` must remain scoped to the slug's campaign DB. Add request-level tests showing an owner update in A does not affect B, and a user who is not a member cannot write A. Include this existing path in the isolation matrix for verification.
- **II. Testes primeiro**: PASS. Before changing the write guard, create failing endpoint tests for anonymous (401), non-member (403), campaign member without owner role (403), owner (success), and A/B isolation. Before changing the UI, cover coordinate/format validation, failure rollback/no false saved state, cancel, and persisted format/position.
- **III. Produção legada**: PASS. Changes remain in repo application/prototype; no `/opt` changes.
- **IV. Simplicidade**: PASS. Reuse `require_dono`, existing `PUT /grupo`, normalized coordinates and existing icon/pan-zoom code. No new dependency or endpoint.
- **V. i18n**: PASS. Translate move-mode hint, Cancel, save failure and accessible labels in pt-BR/en. No GM-authored content is translated.
- **VI. Migrações**: PASS / N/A. Group position and format are already persisted; no schema change.

## Project Structure

### Documentation (this feature)

```text
specs/124-marcador-grupo-mapa/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── group-marker.md
└── tasks.md                    # Created by speckit-tasks, not this phase
```

### Source Code (repository root)

```text
backend/
├── app/routers/admin/grupo.py  # Owner-only write dependency
├── app/deps/auth.py            # Existing require_dono dependency
└── tests/                       # Group write authorization, validation, persistence, isolation

frontend/src/
├── pages/MapPage.tsx            # Move/cancel/error state and shared menu integration
├── components/map/CampaignMap.tsx # Move hint/cancel interaction and marker display
├── api/admin.ts                 # Existing updateGrupo client
└── locales/{pt-BR,en}/          # New UI strings

frontend-next/src/
├── pages/CampaignLayout.tsx    # Use shared master map tools from spec 123
├── pages/MapPage.tsx           # Local mock state and owner controls
├── components/map/MapCanvas.tsx # Click-to-position and marker forms
└── data/{types.ts,mock.ts}     # Mock format default/data shape
```

**Structure Decision**: Keep the group marker in the existing map canvas. The common GM menu belongs to spec 123; implement only its move and format actions here. Apply the owner guard narrowly to the group update route rather than changing authorization for every admin endpoint.

## Complexity Tracking

No constitution violations or added dependencies. The owner-only guard is a correctness/security fix required by FR-010, not an expansion to other campaign-admin operations.
