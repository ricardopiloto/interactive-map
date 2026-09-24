# Data Model: Auditoria visual

This feature introduces no persisted application entities, API payloads, or database schema. The following are transient test and review records only.

## AuditedSurface

One stable row in the typed E2E audit manifest.

| Field | Type | Rule |
|---|---|---|
| `id` | string | Stable unique kebab-case identifier used in snapshot/gallery names |
| `productPath` | string | Product route template; token values must be redacted in reports |
| `productState` | string | Optional deterministic UI state (for example digitizer open or invite mode) |
| `prototypePath` | string | Prototype hash route; required even when it is an auth-shell reference |
| `referenceType` | `page \| state \| auth-shell-only` | Makes reference equivalence explicit |
| `authFixture` | `public \| owner-session \| invite-token \| reset-token` | Selects the disposable state setup |
| `productVariants` | list | Existing locale/theme/viewport variants; expected matrix is six per required state |
| `prototypeVariants` | list | Prototype-supported pt-BR/theme/viewport combinations |
| `axe` | boolean | True for app UI surfaces in the required audit |

### Validation

- IDs are unique and all required spec surfaces appear exactly once, with the existing route-tab state retained as an additional state.
- Each product screenshot and prototype reference has a corresponding gallery entry.
- Product variants cover pt-BR/en and desktop light/dark plus mobile light; prototype references are labeled pt-BR because no English prototype locale exists.
- Token-bearing routes are generated from disposable fixtures; raw tokens cannot appear in report metadata, gallery labels, or uploaded artifact names.
- `auth-shell-only` is allowed for Reset and Account and must be visible in the gallery/checklist.
- Product and prototype screenshots are paired for human inspection only; no cross-product pixel score is stored.

## CapturePair

Transient gallery row joining one product capture to one prototype reference.

| Field | Type | Rule |
|---|---|---|
| `surfaceId` | string | References `AuditedSurface.id` |
| `productImage` | path | Required app screenshot for one product variant |
| `referenceImage` | path | Required prototype screenshot for the matching review state |
| `productLocale/theme/viewport` | labels | Describes the product capture accurately |
| `referenceLocale/theme/viewport` | labels | Describes reference capture; locale explicitly pt-BR |
| `referenceType` | enum | Carries page/state/auth-shell-only distinction |

## HumanReview

Reviewer-owned audit outcome recorded with the run artifact or feature quickstart.

| Field | Type | Rule |
|---|---|---|
| `surfaceId` | string | One row for every audited surface/state |
| `verdict` | `parity-ok \| deviation` | Required before audit closure |
| `notes` | string | Required when verdict is deviation; describe correction or accepted documented difference |
| `reviewer` | string | Human reviewer identifier |
| `reviewedAt` | date/time | Review date |

No runtime state transitions exist. E2E tokens and sessions expire with the disposable test data directory and are not application records created by this feature.
