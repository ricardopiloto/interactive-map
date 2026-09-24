# Data Model: Escala de espaçamento

This feature has no application data model, API contract, database persistence or state transitions. The relevant model is a design-token scale and its CSS consumers.

## Canonical spacing scale

| Token | Target size |
|---|---:|
| `--space-1` | 4px |
| `--space-2` | 8px |
| `--space-3` | 12px |
| `--space-4` | 16px |
| `--space-5` | 24px |
| `--space-6` | 32px |
| `--space-7` | 48px |

Values are strictly increasing. No canonical `--space-8` is defined.

## SpacingConsumer (audit record)

Transient row used during implementation to make changes reviewable.

| Field | Meaning |
|---|---|
| `file` | Production CSS/TSX file containing the spacing reference |
| `token` | Existing `--space-N` reference |
| `fallback` | Optional fallback value in `var()` |
| `property` | CSS property affected (padding, gap, margin, position, etc.) |
| `intent` | Layout purpose of the spacing |
| `targetToken` | Canonical token selected after audit |
| `visualCheck` | Page/component capture or manual check used for confirmation |
| `exceptionReason` | Required only if the consumer cannot use the canonical scale |

Every production reference to levels 5–8 and every inconsistent fallback must be classified. The audit should also verify all other token references are valid and resolve to the canonical scale. This catalog is a review artifact, not persisted product data.
