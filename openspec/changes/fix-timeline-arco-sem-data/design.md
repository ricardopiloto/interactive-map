# Design

## Context

`layoutArcs` (`frontend-v2/src/lib/timelineLayout.ts:58`) is the only consumer path for the "Por arcos" mode (`frontend-v2/src/components/codex/ArcTimeline.tsx`, wired into `frontend-v2/src/routes/cronologia.tsx` under `mode === "arcs"`). The plain "Chronological" tab does not call this function and is out of scope.

Relevant existing structures inside `layoutArcs`:
- `dates: Map<sessaoId, dateKey>` — built once from `eventos`, using the oldest event per session (`key(e) = e.ano*12 + (e.mes ?? 1) - 1`).
- `rows: TimelineRow[]` — one per session, with `date: dates.get(sessao.id) ?? null` and `arcId: sessao.arco_id`.
- `arcAnchor: Map<arcId, maxDate>` — built only from rows that already have a non-null `date`; an arc with zero dated sessions has **no entry** in this map.
- `sortKey(row)` — `row.date ?? arcAnchor.get(row.arcId)`; returns `null` when both are missing, and the comparator sends `null` keys to the end, ordered by `sessao.numero` ascending (see `rows.sort(...)`, lines 75-81).
- `ranges: Map<arcId, {min,max}>` and `columns`/`branchOrigins` — built only from rows with `row.date !== null`, which is why the existing in-arc inherited date (via `arcAnchor`) already does not leak into column/bifurcation logic today. This separation is what we rely on to keep the fix low-risk.

This matches the real data for the WFRP campaign: arc "A Corrupção do Grande Hospício" (sessions 22-24) has zero dated events (the one event covering that visit, "O Expurgo do Grande Hospício", is linked only to session 21, in a different arc), so today it falls through to the `null`-key branch and sorts after every dated row, by `numero` ascending — see proposal.md for the full trace.

## Goals / Non-Goals

**Goals:**
- When an arc has zero sessions with their own dated event, derive a reference date for that arc from the nearest dated session (by `sessao.numero` distance, searched across all rows regardless of arc) instead of leaving it keyless.
- Keep that reference date fully confined to row ordering (and the existing same-date tie-break by `numero`); it must not change `row.date` (still `null`, still renders "—"), must not feed `ranges`/`columns`/`branchOrigins`, and must not produce an elapsed-time label.
- Keep the fix local to `layoutArcs`; no change to `ArcTimeline.tsx`, no backend/schema change, no new data.

**Non-Goals:**
- Not changing the behavior for sessions with no `arco_id` at all (still sorts last, by `numero`) — out of scope per the agreed fix, even though the same nearest-neighbor idea could apply there too (see Open Questions).
- Not backfilling or splitting events for sessions 22-24 in the WFRP campaign data — this is a frontend algorithm fix, not a data-registration fix (that was the alternative option the user explicitly declined).
- Not touching the "Chronological" or "By discovery" tabs.

## Decisions

**Decision: extend `arcAnchor` itself, not `sortKey`.**
Pre-populate `arcAnchor` for any arc that has rows but no entry yet, right after the existing `arcAnchor` loop and before `rows.sort(...)` runs. `sortKey` already reads `arcAnchor.get(row.arcId)` as its fallback, so no change is needed there — the existing fallback chain starts working for these arcs automatically once `arcAnchor` has a value for them.
*Alternative considered*: compute a separate `nearestNeighborDate` map and OR it into `sortKey` directly. Rejected — it would duplicate the existing single fallback path for no benefit and make it easier to accidentally wire the new date into `ranges`/`columns` later.

**Decision: search for the two nearest dated neighbors across a `numero`-sorted view of dated rows, independent of arc boundaries.**
Build (once) an array of `{ numero, date }` for every row with `date !== null`, sorted by `numero`. For each arc missing from `arcAnchor`, take `arcMinNumero`/`arcMaxNumero` from its own rows, then find the closest entry with `numero < arcMinNumero` and the closest entry with `numero > arcMaxNumero`. Compare distances (`arcMinNumero - belowNumero` vs `aboveNumero - arcMaxNumero`) and take the closer one's `date`; on a tie, take the lower-`numero` (below) one.
*Why scan by `numero` across all rows, not "only the previous/next arc"*: a run of several consecutive all-undated arcs must still resolve correctly by skipping past them to the next real dated session — scanning the flat `numero`-sorted dated-row list does this for free, with no special-casing for how many undated arcs sit in between.
*Alternative considered*: walk `rows` (already sorted by date at this point) to find adjacent arcs. Rejected — at the point this computation must run, `rows` is not yet sorted (sorting is what we're computing the key for), and walking unsorted rows by `numero` directly is simpler and has no ordering dependency.

**Decision: one-sided or absent neighbor is not an error case — it is the normal boundary behavior.**
Flagged by the fullstack review (`review-fullstack.md`, §4) as a gap: the paragraph above only spells out what happens when both a below- and an above-neighbor exist. Resolved explicitly here, so it is not left to implementation judgment:
- If a dated neighbor exists on only one side of the arc's `numero` range (e.g. the arc sits at the very start or end of the campaign's session numbers), use that single candidate's date — there is nothing to compare distances against, so no tie-break applies.
- If no dated neighbor exists on either side (e.g. no session anywhere in the visible set has a date yet), `arcAnchor` stays unset for that arc, exactly as today: its rows fall through to the existing `null`-key branch and sort at the end, ordered by `numero` ascending. This is not a new code path — it is simply what already happens when the fallback finds nothing to anchor to.

**Decision: tie-break toward the lower (below) session number when both neighbors are equidistant.**
Deterministic, and consistent with the product's existing bias against inventing a date that looks like it "jumps ahead" — see proposal.md. Recorded explicitly in the spec scenario "Empate de distância entre vizinhos prefere o de número menor" so it is testable, not just an implementation detail.

**Decision: scope the fallback to arcs only (`row.arcId !== null`).**
Matches what the user asked to fix and keeps the spec delta minimal. A session with no arc at all keeps today's behavior unchanged.

## Risks / Trade-offs

- [Risk] The existing test `timelineLayout.test.ts:91` ("keeps undated sessions with their dated arc above older arcs and leaves unanchored rows last") encodes today's bottom-of-list behavior for exactly this scenario (arc 2, sessions 6/7, has zero dated events) → Mitigation: Task Group 1 updates this test's expectation as part of the same change, not as an afterthought; it must not be left red.
- [Risk] A careless implementation could accidentally feed the new reference date into `ranges`/`columns`/`branchOrigins`, silently creating bifurcation curves or extra columns for an arc that has no real date evidence → Mitigation: `ranges` is built from `row.date`, which this change never touches; add an explicit regression test asserting column/branch output for the fallback-anchored arc matches a true "no evidence" baseline.
- [Risk] Two dated neighbors equidistant but with very different dates (e.g., a gap of several real-world months on either side) could make the tie-break feel arbitrary → Mitigation: this is an edge case not present in current campaign data; the deterministic rule is testable and documented, and can be revisited if it surfaces in practice.

## Migration Plan

Pure frontend logic change inside one function (`layoutArcs`), no persisted data or schema touched, no feature flag needed — ships with the next frontend deploy. Rollback is a plain revert of the diff; no data migration to undo.

## Open Questions

- Should arco-less sessions (no `arco_id` at all) eventually get the same nearest-neighbor treatment instead of always sorting last? Deferred — the user scoped this change to arcs only; revisit as a separate change if it comes up again.
