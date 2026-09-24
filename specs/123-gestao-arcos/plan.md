# Implementation Plan: Gestão de arcos narrativos

**Branch**: `123-gestao-arcos` | **Date**: 2026-09-23 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/123-gestao-arcos/spec.md`

## Summary

Close the Arco management experience gap while preserving existing campaign behavior: provide a discoverable master-only entry in the map context, an ordered management list, and create, edit, reorder, visibility, Local assignment/unassignment, and confirmed delete. The existing campaign API supports Arco CRUD and visibility; deletion preserves Local records and clears their `arco_id`. Extend the prototype and product to the same flow. The prototype Local form must allow “Sem arco” to match the product. Verify that invalid Arco associations are rejected by the existing data contract; add the smallest validation needed only if the regression check confirms this is not enforced. Do not add a route or migration without a demonstrated contract gap.

## Technical Context

**Language/Version**: TypeScript/React 19 + Vite 8; Python 3.12+ backend

**Primary Dependencies**: Existing FastAPI, SQLModel, React, react-i18next, Playwright; no new dependencies

**Storage**: Existing per-campaign SQLite. Arco fields and Local `arco_id` already exist; no planned schema change.

**Testing**: Backend pytest for anonymous/member authorization, cross-campaign isolation, visibility redaction, successful Arco CRUD, delete-unassign semantics and valid/invalid Local associations; frontend product/prototype builds and Playwright interactions/axe where configured; manual quickstart review for map-context and responsive parity.

**Target Platform**: Web app in Chromium desktop and mobile layouts; product locale pt-BR and en

**Project Type**: Full-stack web application with production frontend, backend API, and visual prototype

**Performance Goals**: Arc management should complete using existing API requests and remain responsive for campaign lists; no additional service or network round trips beyond the existing operations required for each change.

**Constraints**: All data/actions scoped to the active campaign; server authorization remains the existing campaign-membership check and must not depend on the prototype's visual GM/player switch. Hidden Arcos stay absent from public lists/details and their IDs remain redacted from public Local results. Local association accepts an existing Arco in the active campaign or null; reject a missing/invalid Arco ID. Reorder uses existing `ordem` update on each Arco; no batch endpoint exists. Deletion confirmation must disclose that Locals remain but become unassigned. Preserve GM-authored text untranslated.

**Scale/Scope**: One map-context management surface in prototype and product; existing Arco/Local contracts, map entry point, list/form, empty/error/loading states, and pt-BR/en copy. No Sessions work, public behavior change, new route, schema revision, or dependency.

## Constitution Check

- **I. Isolamento**: PASS. No new HTTP route planned. Existing campaign-scoped admin router uses the campaign database selected by slug. Add/extend tests proving a master can manage campaign A only, an anonymous request cannot write, and campaign B remains unchanged. Include relevant `/api/c/{slug}/admin/arcos` cases in the isolation matrix if any contract changes.
- **II. Testes primeiro**: PASS. Write/fix failing permission and cross-campaign tests before changing any auth/data/API behavior. Add regression tests for visible/hidden public Arco behavior and Local `arco_id` redaction; retain delete-unassign semantics. UI-only flow can use Playwright/manual quickstart after these tests.
- **III. Produção legada**: PASS. Repository-only work; no `/opt` or legacy runtime changes.
- **IV. Simplicidade**: PASS. Reuse current API, `ArcoAdminList`/`ArcoFormDialog` patterns, and prototype structures; no new dependencies. Do not add a reorder endpoint unless concrete limitations justify it.
- **V. i18n**: PASS. New master controls, hints, empty/error states and delete confirmation need pt-BR and en; Arco titles/summaries are authored by the GM and must remain untranslated.
- **VI. Migrações**: PASS / N/A. Existing schema already stores all required attributes and the Local relation. No migration planned.

## Project Structure

### Documentation (this feature)

```text
specs/123-gestao-arcos/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── arc-management.md
└── tasks.md                    # Created by speckit-tasks, not this phase
```

### Source Code (repository root)

```text
backend/
├── app/models/arco.py
├── app/schemas/arco.py
├── app/routers/admin/arcos.py
├── app/routers/public/arcos.py
├── app/routers/admin/locais.py
├── app/routers/public/locais.py
└── tests/                       # Auth, visibility, delete and isolation regression coverage

frontend/src/
├── pages/MapPage.tsx            # Master entry point and management state
├── components/admin/ArcoAdminList.tsx
├── components/admin/LocalAdminList.tsx
├── components/admin/LocalFormDialog.tsx
├── api/admin.ts                 # Existing API client; add only if a contract gap is found
└── locales/{pt-BR,en}/          # New master-facing copy

frontend-next/src/
├── pages/CampaignLayout.tsx     # Discoverable master-only map tools
├── pages/MapPage.tsx            # Map-context arc manager/list and states
├── data/types.ts                # Arco visibility and nullable Local.arcoId
├── data/mock.ts                 # Representative visible/hidden arc examples
└── components/map/LocalFormModal.tsx # Assignment and “Sem arco” option
```

**Structure Decision**: Keep management in the campaign map context, opened from a discoverable master-tools action. Reuse the production form/list patterns, but do not imply that the current `ArcoAdminList` is mounted: product MapPage currently wires only Arco creation, while the list component exists separately. Add the complete list/edit/delete/order flow to the product and equivalent mock flow to `frontend-next`, whose current CampaignLayout has no Arco management menu. In both product and prototype, a Local may have no Arco; the prototype type and editor must support null and “Sem arco”. The mock GM/player switch is presentation only; production writes remain protected by the existing campaign membership authorization. Do not turn Arcos into a main navigation destination or combine them with Sessions.

## Complexity Tracking

No constitution violations or new dependencies. Any newly discovered contract/schema need must be justified before changing this plan.
