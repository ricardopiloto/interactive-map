# Data Model: Revalidate 048 and 050 After 052

**Feature**: `053-revalidate-048-050` | **Date**: 2026-08-05

No new persisted product entities. This feature tracks **validation outcomes** only.

## Entities (validation ledger)

### ValidationRun

| Field | Description |
|-------|-------------|
| `date` | When the run was performed |
| `environment_ok` | Prerequisites met (servers, Rede data, De/Para with tariffs) |
| `notes` | Optional free text (e.g. waypoint IDs used) |

### BlockResult048

| Field | Values / rules |
|-------|----------------|
| `overall` | `PASS` \| `FAIL` |
| `scenarios` | Map of `A`…`F` → `PASS` \| `FAIL` \| `SKIP` (A–E must not be SKIP for SC-005) |
| `remediation` | Empty if PASS; else short note of what was fixed |

### BlockResult050

| Field | Values / rules |
|-------|----------------|
| `overall` | `PASS` \| `FAIL` |
| `scenarios` | Map of `A`…`H` → `PASS` \| `FAIL` \| `SKIP` (A–G must not be SKIP for SC-005) |
| `api_optional` | `PASS` \| `FAIL` \| `SKIP` |
| `remediation` | Empty if PASS; else short note |

### Baseline052Guard

| Field | Description |
|-------|-------------|
| `desktop_pins_spotcheck` | `PASS` \| `FAIL` — campaign map desktop alignment not worsened by 053 work |
| `campaign_map_css_untouched_on_pass` | If both blocks PASS without remediação: no intentional edit to CampaignMap.css |

## Relationships

```text
ValidationRun
  ├── BlockResult048
  ├── BlockResult050
  └── Baseline052Guard
```

## State transitions

```text
[pending] → [running] → [PASS both] → [closed]
                      → [FAIL one/both] → [remediate scoped] → [re-test] → [PASS] → [closed]
```

Invalid: remediação that reintroduces 047–051 pin/stage behavior on the campaign map.

## Validation rules

- Overall block PASS only if all mandatory scenarios for that block are PASS.
- Environment failure → do not set overall FAIL until prerequisites fixed (spec edge case).
- Product data (waypoints, segments, locais) unchanged by a PASS-only run.
