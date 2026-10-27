# Tasks

## 1. Tests for the new ordering rule

- [ ] 1.1 Update the existing test `frontend-v2/src/lib/timelineLayout.test.ts:91` ("keeps undated sessions with their dated arc above older arcs and leaves unanchored rows last") to the new expected order: arc 2 (sessions 6, 7, both with no event) must now sort using the nearest dated neighbor by session number instead of falling to the end; verify with `cd frontend-v2 && npx vitest run src/lib/timelineLayout.test.ts` that the updated expectation is the one the test author intends (red before the implementation task, green after).
- [ ] 1.2 Add a test mirroring the real WFRP case: three arcs by session number (lower dated arc, a fully undated arc in the middle, higher dated arc), and verify the undated arc's rows sort between the two dated arcs, with same-date ties broken by descending session number per the existing rule.
- [ ] 1.3 Add a test for the equidistant-neighbor tie-break (an undated arc exactly as many session numbers away from a lower-numbered dated session as from a higher-numbered one, with different dates on each side) and verify the lower-numbered neighbor's date wins, deterministically.
- [ ] 1.4 Add a regression test asserting that `columns`, `branchOrigins`, and `sequentialPairs` for the fallback-anchored arc are identical to what they would be if that arc had no anchor at all (i.e., the new reference date must not leak into column/bifurcation/gap computations); verify with `cd frontend-v2 && npx vitest run src/lib/timelineLayout.test.ts`.
- [ ] 1.5 Add a test asserting `row.date` stays `null` and `elapsed(row.previous, row.date)` stays `null` for sessions positioned via the new fallback (no invented displayed date, no invented elapsed-time text).
- [ ] 1.6 Add a test for an undated arc with a dated neighbor on only one side (e.g. it sits at the very start or end of the visible session-number range) and verify the single candidate's date is used with no distance comparison or crash.
- [ ] 1.7 Add a test for an undated arc with no dated neighbor on either side and verify it keeps today's behavior unchanged: no anchor set, rows fall to the end of the list ordered by `numero` ascending.

## 2. Implementation

- [ ] 2.1 In `layoutArcs` (`frontend-v2/src/lib/timelineLayout.ts`), after the existing `arcAnchor` loop (around line 69-72), add a fallback pass that: builds a `numero`-sorted array of `{ numero, date }` from rows with `date !== null`; for each arc id present in `rows` but missing from `arcAnchor`, finds the closest dated entry with `numero` below the arc's minimum `numero` and the closest with `numero` above the arc's maximum `numero`, and sets `arcAnchor` to whichever is numerically closer (ties favor the lower `numero`); when only one of the two candidates exists, use it directly; when neither exists, leave `arcAnchor` unset for that arc (today's behavior). Verify by running the tests from Task Group 1 and confirming 1.1-1.3 and 1.6-1.7 pass.
- [ ] 2.2 Confirm no other part of `layoutArcs` (`ranges`, `columns`, `branchOrigins`, `sequentialPairs` computation) reads from `arcAnchor` — only `sortKey` does today; keep it that way so the fallback stays confined to ordering. Verify via the regression test from 1.4 passing without modifying `ranges`/`columns` code.

## 3. Manual verification

- [ ] 3.1 Run the frontend dev server, open `/c/1/wfrp/linha-do-tempo`, switch to "By arcs", and confirm "A Corrupção do Grande Hospício" now appears between "O Hospício e o Porco" and "O Legado de Andrei Solacruz" instead of at the end of the list, and that sessions 22-24 still show "—" for their date (no invented displayed date).
- [ ] 3.2 Confirm the "Chronological" and "By discovery" tabs render unchanged (out of scope, shared code untouched).
- [ ] 3.3 Run the full frontend unit test suite (`npm test` in `frontend-v2`) and confirm no unrelated regressions.
- [ ] 3.4 Run the dedicated e2e spec `frontend-v2/e2e/linha-tempo.spec.ts` (`npm run test:e2e -- linha-tempo` in `frontend-v2`, with its required services/seed up) and confirm it still passes — it exercises arc CRUD and the "Sem arco" filter on the same "Por arcos" tab this change touches, even though it does not today pin the exact ordering of an undated arc.
