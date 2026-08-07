# Specification Quality Checklist: Route Overnight Stops (Pernoites)

**Purpose**: Validate specification completeness and quality before proceeding to planning
**Created**: 2026-08-07
**Feature**: [spec.md](../spec.md)

## Content Quality

- [x] No implementation details (languages, frameworks, APIs)
- [x] Focused on user value and business needs
- [x] Written for non-technical stakeholders
- [x] All mandatory sections completed

## Requirement Completeness

- [x] No [NEEDS CLARIFICATION] markers remain
- [x] Requirements are testable and unambiguous
- [x] Success criteria are measurable
- [x] Success criteria are technology-agnostic (no implementation details)
- [x] All acceptance scenarios are defined
- [x] Edge cases are identified
- [x] Scope is clearly bounded
- [x] Dependencies and assumptions identified

## Feature Readiness

- [x] All functional requirements have clear acceptance criteria
- [x] User scenarios cover primary flows
- [x] Feature meets measurable outcomes defined in Success Criteria
- [x] No implementation details leak into specification

## Notes

- Validated against PRD §12.4 (`docs/prd-mapa-campanha-rpg(4).md`).
- Clarifications 2026-08-07 locked: stretch advances progress; miles/day from ritmo+modo; map markers for local+relento; overnight summary on all list rows; ±20% Local window with minimal adjustment.
- Fatigue: intenso +1/day; Local night −1; relento no recovery; arrival +1; soft warn if final saldo > 1; death alert if peak ≥ 6 (warn only, selectable); no near-death tier.
- Ready for `/speckit-plan`.
