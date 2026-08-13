# Quickstart: Known Direction Vínculos

**Feature**: `073-known-direction-vinculos`  
**Purpose**: Prove GM-only secret tip vs player view ([spec.md](./spec.md)).

## Prerequisites

- App running (backend + frontend)
- Seed or GM-created pair: **duas vias**, `publico=true`, one sense **conhecido**, the other not (e.g. Tomas→Lila romance secret, Lila→Tomas amizade known)
- Second pair optional: Elara↔Marcus both known (071 regression)

## Scenarios

### 1. Player graph — one known sense (US1 / SC-001)

1. Leave Modo GM / use player session.
2. Open `/relacoes`.
3. Expect the demo pair as a **single-nature** amizade edge (no dual fade / no romance colour).

### 2. Player detail — Lila vs Tomas (US1 / Q2)

1. Select Lila → Tomas as Amizade; no “vê-te como romance”.
2. Select Tomas → Lila row without romance primary; only “vê-te como Amizade” (or equivalent).

### 3. GM sees both (US1 / SC-002)

1. Enable Modo GM.
2. Same pair shows fade + both types on graph and both perspectives on sheets.

### 4. GM form toggles (US2 / SC-003)

1. Edit pair: both “conhecido” checked by default on new duas vias.
2. Uncheck one sense, save, switch to player → confirms scenario 1.
3. Check both → player sees full 071 asymmetry (SC-004).
4. Uncheck público → player sees nothing even if senses known.

### 5. Reciprocal unchanged (US3 / SC-005)

1. Public reciprocal: player and GM same single nature; no per-sense UI.
2. Private reciprocal: hidden from player.

### 6. No secret leak

1. As player, inspect `GET /api/vinculos` for the demo pair.
2. Expect secret tip `tipo` **null** (or absent), never the GM-only romance value.

## Contracts

- [api-vinculos-known-direction.md](./contracts/api-vinculos-known-direction.md)
- [ui-known-direction-vinculos.md](./contracts/ui-known-direction-vinculos.md)
