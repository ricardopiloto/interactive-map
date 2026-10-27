import type { Arco, Evento } from "@/api/timeline";
import type { Sessao } from "@/api/sessoes";

export interface TimelineRow {
  sessao: Sessao;
  arcId: number | null;
  column: number;
  date: number | null;
  previous?: number | null | undefined;
}

/** Origin of a column opened by date overlap (bifurcation). */
export interface BranchOrigin {
  fromArcId: number;
  fromDate: number;
  atDate: number;
}

/** Adjacent sequential arcs with no date overlap (for dashed gradient links). */
export interface SequentialPair {
  newerArcId: number;
  olderArcId: number;
  newerRowIndex: number;
  olderRowIndex: number;
}

export interface TimelineLayout {
  rows: TimelineRow[];
  branchOrigins: Map<number, BranchOrigin>;
  sequentialPairs: SequentialPair[];
}

const key = (e: Evento) => e.ano * 12 + (e.mes ?? 1) - 1;

function arcsOverlapOrTie(
  arcA: number,
  arcB: number,
  ranges: Map<number, { min: number; max: number }>,
  numeroRanges: Map<number, { min: number; max: number }>,
  rows: TimelineRow[],
): boolean {
  const rangeA = ranges.get(arcA);
  const rangeB = ranges.get(arcB);
  if (!rangeA || !rangeB) return false;
  const numbersA = numeroRanges.get(arcA)!;
  const numbersB = numeroRanges.get(arcB)!;
  const interleave = !(numbersA.max < numbersB.min || numbersB.max < numbersA.min);
  for (const row of rows) {
    if (row.date === null) continue;
    if (row.arcId === arcA) {
      if (rangeB.min < row.date && row.date < rangeB.max) return true;
      if (interleave && rows.some((v) => v.arcId === arcB && v.date === row.date)) return true;
    }
    if (row.arcId === arcB) {
      if (rangeA.min < row.date && row.date < rangeA.max) return true;
    }
  }
  return false;
}

/** Dated events anchor a session; its oldest event wins. Undated sessions use their arc for placement. */
export function layoutArcs(sessoes: Sessao[], eventos: Evento[], _arcos: Arco[]): TimelineLayout {
  const dates = new Map<number, number>();
  for (const e of eventos)
    if (e.sessao_id != null)
      dates.set(e.sessao_id, Math.min(dates.get(e.sessao_id) ?? Infinity, key(e)));
  const rows: TimelineRow[] = sessoes.map((sessao) => ({
    sessao,
    arcId: sessao.arco_id,
    date: dates.get(sessao.id) ?? null,
    column: 0,
  }));
  const arcAnchor = new Map<number, number>();
  for (const row of rows)
    if (row.arcId !== null && row.date !== null)
      arcAnchor.set(row.arcId, Math.max(arcAnchor.get(row.arcId) ?? -Infinity, row.date));
  const dated = rows
    .filter((row) => row.date !== null)
    .map((row) => ({ numero: row.sessao.numero, date: row.date! }))
    .sort((a, b) => a.numero - b.numero);
  const arcNumbers = new Map<number, { min: number; max: number }>();
  for (const row of rows) {
    if (row.arcId === null || arcAnchor.has(row.arcId)) continue;
    const range = arcNumbers.get(row.arcId);
    arcNumbers.set(row.arcId, {
      min: Math.min(range?.min ?? row.sessao.numero, row.sessao.numero),
      max: Math.max(range?.max ?? row.sessao.numero, row.sessao.numero),
    });
  }
  for (const [arcId, range] of arcNumbers) {
    let below: (typeof dated)[number] | undefined;
    for (const row of dated) {
      if (row.numero >= range.min) break;
      below = row;
    }
    const above = dated.find((row) => row.numero > range.max);
    const nearest =
      below && above
        ? range.min - below.numero <= above.numero - range.max
          ? below
          : above
        : (below ?? above);
    if (nearest) arcAnchor.set(arcId, nearest.date);
  }
  const sortKey = (row: TimelineRow): number | null =>
    row.date ?? (row.arcId !== null ? (arcAnchor.get(row.arcId) ?? null) : null);
  rows.sort((a, b) => {
    const ka = sortKey(a);
    const kb = sortKey(b);
    if (ka === null) return kb === null ? a.sessao.numero - b.sessao.numero : 1;
    if (kb === null) return -1;
    return kb - ka || b.sessao.numero - a.sessao.numero;
  });
  const ranges = new Map<number, { min: number; max: number }>();
  const numeroRanges = new Map<number, { min: number; max: number }>();
  for (const row of rows) {
    if (row.arcId === null) continue;
    const range = numeroRanges.get(row.arcId);
    numeroRanges.set(row.arcId, {
      min: Math.min(range?.min ?? row.sessao.numero, row.sessao.numero),
      max: Math.max(range?.max ?? row.sessao.numero, row.sessao.numero),
    });
  }
  for (const row of rows)
    if (row.arcId !== null && row.date !== null) {
      const range = ranges.get(row.arcId);
      ranges.set(row.arcId, {
        min: Math.min(range?.min ?? row.date, row.date),
        max: Math.max(range?.max ?? row.date, row.date),
      });
    }
  const columns = new Map<number, number>();
  const branchOrigins = new Map<number, BranchOrigin>();
  for (const row of rows) {
    if (row.arcId === null || columns.has(row.arcId)) continue;
    const own = rows.filter((r) => r.arcId === row.arcId && r.date !== null);
    const conflicts = new Set<number>();
    type Candidate = { fromArcId: number; fromDate: number; atDate: number; distance: number };
    const candidates: Candidate[] = [];
    for (const [other, column] of columns) {
      const range = ranges.get(other);
      if (!range) continue;
      const otherSessions = rows.filter((r) => r.arcId === other && r.date !== null);
      let otherConflicts = false;
      for (const ownRow of own) {
        if (ownRow.date === null) continue;
        const inside = range.min < ownRow.date && ownRow.date < range.max;
        const ownNumbers = numeroRanges.get(row.arcId)!;
        const otherNumbers = numeroRanges.get(other)!;
        const interleave = !(
          ownNumbers.max < otherNumbers.min || otherNumbers.max < ownNumbers.min
        );
        const equalDates = interleave ? otherSessions.filter((o) => o.date === ownRow.date) : [];
        if (!inside && equalDates.length === 0) continue;
        otherConflicts = true;
        const peers = inside ? otherSessions : equalDates;
        for (const peer of peers) {
          if (peer.date === null) continue;
          candidates.push({
            fromArcId: other,
            fromDate: peer.date,
            atDate: ownRow.date,
            distance: Math.abs(ownRow.date - peer.date),
          });
        }
      }
      if (otherConflicts) conflicts.add(column);
    }
    if (candidates.length > 0) {
      candidates.sort(
        (a, b) =>
          a.distance - b.distance ||
          a.fromArcId - b.fromArcId ||
          a.fromDate - b.fromDate ||
          a.atDate - b.atDate,
      );
      const best = candidates[0]!;
      branchOrigins.set(row.arcId, {
        fromArcId: best.fromArcId,
        fromDate: best.fromDate,
        atDate: best.atDate,
      });
    }
    let column = 0;
    while (conflicts.has(column)) column++;
    columns.set(row.arcId, column);
  }
  for (const row of rows) {
    if (row.arcId !== null) {
      row.column = columns.get(row.arcId) ?? 0;
      continue;
    }
    if (row.date === null) continue;
    const conflicts = new Set<number>();
    for (const [arcId, range] of ranges) {
      if (
        (range.min < row.date && row.date < range.max) ||
        rows.some((v) => v.arcId === arcId && v.date === row.date)
      )
        conflicts.add(columns.get(arcId) ?? 0);
    }
    while (conflicts.has(row.column)) row.column++;
  }
  const last = new Map<number | null, number | null>();
  const withPrevious = rows.map((row) => {
    const previous = last.get(row.arcId);
    if (row.date !== null) last.set(row.arcId, row.date);
    return { ...row, previous };
  });

  // Sequential pairs from adjacent row transitions. When a bifurcation row sits between the
  // facing sessions of two sequential arcs in the list, walk skips that transition; a second
  // pass recovers facing-edge pairs whose only intervening rows belong to a branching arc
  // (overlap with one of the two), so indices may be non-adjacent.
  const sequentialPairs: SequentialPair[] = [];
  const seenPair = new Set<string>();
  const pushPair = (
    newerArcId: number,
    olderArcId: number,
    newerRowIndex: number,
    olderRowIndex: number,
  ) => {
    const pairKey = `${newerArcId}:${olderArcId}`;
    if (seenPair.has(pairKey)) return;
    seenPair.add(pairKey);
    sequentialPairs.push({ newerArcId, olderArcId, newerRowIndex, olderRowIndex });
  };

  for (let i = 0; i < withPrevious.length - 1; i++) {
    const newer = withPrevious[i]!;
    const older = withPrevious[i + 1]!;
    if (
      newer.arcId === null ||
      older.arcId === null ||
      newer.date === null ||
      older.date === null ||
      newer.arcId === older.arcId
    )
      continue;
    if (arcsOverlapOrTie(newer.arcId, older.arcId, ranges, numeroRanges, withPrevious)) continue;
    pushPair(newer.arcId, older.arcId, i, i + 1);
  }

  const arcIds = [...ranges.keys()];
  for (let ai = 0; ai < arcIds.length; ai++) {
    for (let bi = ai + 1; bi < arcIds.length; bi++) {
      const idA = arcIds[ai]!;
      const idB = arcIds[bi]!;
      if (arcsOverlapOrTie(idA, idB, ranges, numeroRanges, withPrevious)) continue;
      const rangeA = ranges.get(idA)!;
      const rangeB = ranges.get(idB)!;
      let newerId: number;
      let olderId: number;
      if (rangeA.min > rangeB.max) {
        newerId = idA;
        olderId = idB;
      } else if (rangeB.min > rangeA.max) {
        newerId = idB;
        olderId = idA;
      } else {
        continue;
      }
      const newerRange = ranges.get(newerId)!;
      const olderRange = ranges.get(olderId)!;
      // Sem arco or an unrelated dated row in the gap blocks the pair.
      const gapBlocked = withPrevious.some(
        (r) =>
          r.date !== null &&
          olderRange.max < r.date &&
          r.date < newerRange.min &&
          (r.arcId === null ||
            (r.arcId !== newerId && r.arcId !== olderId && !branchOrigins.has(r.arcId))),
      );
      if (gapBlocked) continue;
      // Intervening rows must all be bifurcation arcs (have branchOrigins).
      const newerRowIndex = withPrevious.findIndex(
        (r) => r.arcId === newerId && r.date === newerRange.min,
      );
      const olderRowIndex = withPrevious.findIndex(
        (r) => r.arcId === olderId && r.date === olderRange.max,
      );
      if (newerRowIndex < 0 || olderRowIndex < 0) continue;
      if (Math.abs(olderRowIndex - newerRowIndex) <= 1) continue;
      const lo = Math.min(newerRowIndex, olderRowIndex);
      const hi = Math.max(newerRowIndex, olderRowIndex);
      let onlyBranchesBetween = true;
      for (let i = lo + 1; i < hi; i++) {
        const mid = withPrevious[i]!;
        if (mid.arcId === null || mid.date === null || !branchOrigins.has(mid.arcId)) {
          onlyBranchesBetween = false;
          break;
        }
      }
      if (!onlyBranchesBetween) continue;
      pushPair(newerId, olderId, newerRowIndex, olderRowIndex);
    }
  }

  // Link neighboring visible arc blocks, including arcs without dated sessions.
  // A Sem arco row separates blocks and prevents a link across it.
  const blocks: { arcId: number; first: number; last: number }[] = [];
  for (let i = 0; i < withPrevious.length; i++) {
    const arcId = withPrevious[i]!.arcId;
    if (arcId === null) {
      blocks.push({ arcId: -1, first: i, last: i });
      continue;
    }
    const previous = blocks[blocks.length - 1];
    if (previous?.arcId === arcId) previous.last = i;
    else blocks.push({ arcId, first: i, last: i });
  }
  for (let i = 0; i < blocks.length - 1; i++) {
    const newer = blocks[i]!;
    const older = blocks[i + 1]!;
    if (newer.arcId < 0 || older.arcId < 0 || newer.arcId === older.arcId) continue;
    const newerNumbers = numeroRanges.get(newer.arcId)!;
    const olderNumbers = numeroRanges.get(older.arcId)!;
    if (newerNumbers.min <= olderNumbers.max) continue;
    if (
      branchOrigins.get(newer.arcId)?.fromArcId === older.arcId ||
      branchOrigins.get(older.arcId)?.fromArcId === newer.arcId
    )
      continue;
    if (arcsOverlapOrTie(newer.arcId, older.arcId, ranges, numeroRanges, withPrevious)) continue;
    pushPair(newer.arcId, older.arcId, newer.last, older.first);
  }

  return { rows: withPrevious, branchOrigins, sequentialPairs };
}

export function elapsed(a: number | null | undefined, b: number | null) {
  if (a == null || b == null) return null;
  const months = Math.abs(a - b);
  return { years: Math.floor(months / 12), months: months % 12, long: months >= 12 };
}
