# Quickstart: Focus Edge Opacity

**Feature**: `068-focus-edge-opacity`  
**Purpose**: Visual check of dim network + post-animation highlight ([spec.md](./spec.md)).

## Prerequisites

- App running; seed relações (066); `/relacoes`

## Scenarios

### 1. Idle network (US1 / SC-001)

1. Open `/relacoes` with **no** selection.
2. Expect PJ/NPC rings **and** faint lines (~18%) for every public (or all, if GM) vínculo.
3. No type labels on those lines.

**Pass**: Network is visible; not “empty graph”. Private edges still absent for players.

### 2. Select highlight after motion (US2 / SC-002)

1. Click a personagem with ≥1 link and other links elsewhere.
2. **During** the ~0.6s move: all lines stay faint; no 90% edges.
3. **After** settle: that character’s edges are strong (~90%); others stay faint (~18%); focus labels may appear.

### 3. Deselect (SC-003)

1. Click background / same node / panel ×.
2. Highlight drops **immediately** to faint; nodes animate to PJ/NPC rings; lines **remain** (do not vanish).

### 4. Isolar + chips (US3 / SC-004, SC-005)

1. Isolar + focus → only focus, neighbours, and their edges (no leftover dim web).
2. Toggle a tipo chip with and without selection → those edges appear/disappear in both states.

## Contract

[ui-focus-edge-opacity.md](./contracts/ui-focus-edge-opacity.md)
