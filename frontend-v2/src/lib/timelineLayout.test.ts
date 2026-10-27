import { describe, expect, it } from "vitest";
import { elapsed, layoutArcs } from "./timelineLayout";
import type { Sessao } from "@/api/sessoes";
import type { Evento, Arco } from "@/api/timeline";

const s = (id: number, arco_id: number | null): Sessao => ({
  id,
  numero: id,
  titulo: `S${id}`,
  data_rotulo: null,
  resumo: "",
  locais: [],
  personagens: [],
  arco_id,
  arco_transicao_id: null,
});
const e = (id: number, sessao_id: number, ano: number, mes = 1): Evento => ({
  id,
  titulo: `E${id}`,
  ano,
  mes,
  rotulo_era: null,
  descricao: "",
  sessao_id,
  locais: [],
  personagens: [],
});
const a = (id: number): Arco => ({
  id,
  titulo: `A${id}`,
  resumo: "",
  ordem: id,
  cor: null,
  visivel_para_todos: true,
  sessao_ids: [],
  sessao_transicao_id: null,
});

describe("arc columns", () => {
  it("keeps noninterleaved arcs in one column, newest first", () => {
    const { rows: r } = layoutArcs([s(1, 1), s(2, 2)], [e(1, 1, 100), e(2, 2, 101)], [a(1), a(2)]);
    expect(r.map((x) => [x.sessao.id, x.column])).toEqual([
      [2, 0],
      [1, 0],
    ]);
  });
  it("branches strictly interleaved dates while retaining the continuing column", () => {
    const { rows: r } = layoutArcs(
      [s(1, 1), s(2, 2), s(3, 1)],
      [e(1, 1, 100), e(2, 2, 101), e(3, 3, 102)],
      [a(1), a(2)],
    );
    expect(r.map((x) => [x.sessao.id, x.column])).toEqual([
      [3, 0],
      [2, 1],
      [1, 0],
    ]);
  });
  it("keeps disjoint equal-date arcs sequential and leaves arcless sessions last", () => {
    const { rows: r } = layoutArcs(
      [s(3, 2), s(2, null), s(1, 1), s(4, null)],
      [e(1, 1, 100), e(3, 3, 100)],
      [a(1), a(2)],
    );
    expect(r.map((x) => x.sessao.id)).toEqual([3, 1, 2, 4]);
    expect(r[0]?.column).toBe(r[1]?.column);
    expect(r.slice(2).map((x) => x.date)).toEqual([null, null]);
  });
  it("orders same-month sessions in one arc by descending session number", () => {
    const { rows } = layoutArcs(
      [s(18, 5), s(21, 5)],
      [e(18, 18, 2511, 10), e(21, 21, 2511, 10)],
      [a(5)],
    );
    expect(rows.map((row) => row.sessao.numero)).toEqual([21, 18]);
  });
  it("orders same-month sessions across disjoint arcs in one column", () => {
    const { rows, branchOrigins } = layoutArcs(
      [s(18, 1), s(21, 2)],
      [e(18, 18, 2511, 10), e(21, 21, 2511, 10)],
      [a(1), a(2)],
    );
    expect(rows.map((row) => [row.sessao.numero, row.column])).toEqual([
      [21, 0],
      [18, 0],
    ]);
    expect([...branchOrigins]).toEqual([]);
  });
  it("keeps a same-date single-session arc in the shared column", () => {
    const result = layoutArcs([s(1, 1), s(2, 2)], [e(1, 1, 100), e(2, 2, 100)], [a(1), a(2)]);
    expect(result.rows.map((row) => row.column)).toEqual([0, 0]);
    expect(result.branchOrigins.size).toBe(0);
  });
  it("branches equal-date arcs whose session ranges interleave", () => {
    const result = layoutArcs(
      [s(1, 1), s(2, 2), s(3, 1)],
      [e(1, 1, 100), e(2, 2, 100), e(3, 3, 100)],
      [a(1), a(2)],
    );
    expect(result.rows.find((row) => row.arcId === 2)?.column).toBe(1);
    expect(result.branchOrigins.get(2)?.fromArcId).toBe(1);
  });
  it("places an undated arc by its nearest dated session and leaves arcless rows last", () => {
    const { rows } = layoutArcs(
      [s(9, 3), s(13, 4), s(14, 4), s(15, 4), s(16, 4), s(17, 4), s(6, 2), s(7, 2), s(8, null)],
      [e(9, 9, 2511, 7), e(13, 13, 2511, 8), e(17, 17, 2511, 8)],
      [a(2), a(3), a(4)],
    );
    expect(rows.map((row) => row.sessao.numero)).toEqual([17, 16, 15, 14, 13, 9, 7, 6, 8]);
    expect(rows.slice(1, 4).map((row) => row.date)).toEqual([null, null, null]);
    expect(rows.slice(6).map((row) => row.date)).toEqual([null, null, null]);
  });
  it("places a fully undated middle arc between dated arcs, breaking date ties by number", () => {
    const { rows } = layoutArcs(
      [s(18, 1), s(21, 1), s(22, 2), s(23, 2), s(24, 2), s(25, 3), s(28, 3)],
      [e(18, 18, 100), e(21, 21, 101), e(25, 25, 102), e(28, 28, 103)],
      [a(1), a(2), a(3)],
    );
    expect(rows.map((row) => row.sessao.numero)).toEqual([28, 25, 24, 23, 22, 21, 18]);
  });
  it("prefers the lower-numbered dated neighbor when distances tie", () => {
    const { rows } = layoutArcs(
      [s(1, 1), s(3, 2), s(5, 3)],
      [e(1, 1, 100), e(5, 5, 110)],
      [a(1), a(2), a(3)],
    );
    expect(rows.map((row) => row.sessao.numero)).toEqual([5, 3, 1]);
  });
  it("keeps fallback dates out of columns and branches", () => {
    const sessions = [s(1, 1), s(2, 2), s(3, 3), s(4, 1)];
    const events = [e(1, 1, 100), e(2, 2, 101), e(4, 4, 102)];
    const anchored = layoutArcs(sessions, events, [a(1), a(2), a(3)]);
    const baseline = layoutArcs(
      sessions.map((session) => (session.id === 3 ? { ...session, arco_id: null } : session)),
      events,
      [a(1), a(2)],
    );
    expect(anchored.rows.find((row) => row.sessao.id === 3)?.column).toBe(0);
    expect(
      anchored.rows.filter((row) => row.sessao.id !== 3).map((row) => [row.sessao.id, row.column]),
    ).toEqual(
      baseline.rows.filter((row) => row.sessao.id !== 3).map((row) => [row.sessao.id, row.column]),
    );
    expect([...anchored.branchOrigins]).toEqual([...baseline.branchOrigins]);
    expect(anchored.sequentialPairs).toContainEqual({
      newerArcId: 3,
      olderArcId: 2,
      newerRowIndex: 1,
      olderRowIndex: 2,
    });
    expect(baseline.sequentialPairs).toEqual([]);
  });
  it("does not assign a displayed date or elapsed time to fallback rows", () => {
    const { rows } = layoutArcs(
      [s(1, 1), s(2, 2), s(3, 3)],
      [e(1, 1, 100), e(3, 3, 101)],
      [a(1), a(2), a(3)],
    );
    const row = rows.find((item) => item.sessao.id === 2)!;
    expect(row.date).toBeNull();
    expect(elapsed(row.previous, row.date)).toBeNull();
  });
  it.each([
    [[s(1, 1), s(2, 2), s(3, 2)], [e(2, 2, 100)], [3, 2, 1]],
    [[s(1, 1), s(2, 1), s(3, 2)], [e(2, 2, 100)], [3, 2, 1]],
  ] as const)("uses the only dated side for an undated arc", (sessions, events, order) => {
    const { rows } = layoutArcs([...sessions], [...events], [a(1), a(2)]);
    expect(rows.map((row) => row.sessao.numero)).toEqual(order);
  });
  it("keeps arcs without any dated neighbor at the end in ascending number order", () => {
    const { rows } = layoutArcs([s(5, 2), s(2, 1), s(4, 2), s(1, 1)], [], [a(1), a(2)]);
    expect(rows.map((row) => row.sessao.numero)).toEqual([1, 2, 4, 5]);
    expect(rows.every((row) => row.date === null)).toBe(true);
  });
  it("keeps the last real date across undated sessions of the same arc", () => {
    const { rows } = layoutArcs(
      [s(13, 4), s(14, 4), s(15, 4), s(17, 4)],
      [e(13, 13, 2511, 8), e(17, 17, 2511, 8)],
      [a(4)],
    );
    expect(rows.map((row) => row.sessao.numero)).toEqual([17, 15, 14, 13]);
    expect(rows.find((row) => row.sessao.numero === 13)?.previous).toBe(2511 * 12 + 7);
  });
  it("keeps an unassigned session visible in the shared column and a transition only once", () => {
    const transition = { ...s(2, 1), arco_transicao_id: 2 };
    const { rows: r } = layoutArcs(
      [s(1, 1), transition, s(3, 2), s(4, null)],
      [e(1, 1, 100), e(2, 2, 101), e(3, 3, 102), e(4, 4, 103)],
      [a(1), a(2)],
    );
    expect(r).toHaveLength(4);
    expect(r.find((x) => x.sessao.id === 2)?.sessao.arco_transicao_id).toBe(2);
    expect(r.find((x) => x.sessao.id === 4)?.column).toBe(0);
  });
  it("branches only the unassigned session when it falls inside a dated arc", () => {
    const { rows } = layoutArcs(
      [s(1, 1), s(2, null), s(3, 1)],
      [e(1, 1, 100), e(2, 2, 101), e(3, 3, 102)],
      [a(1)],
    );
    expect(rows.map((row) => [row.sessao.id, row.column])).toEqual([
      [3, 0],
      [2, 1],
      [1, 0],
    ]);
  });
  it("uses the oldest event linked to a session", () => {
    const { rows: r } = layoutArcs([s(1, null), s(2, null)], [e(1, 1, 110), e(2, 1, 90)], []);
    expect(r[0]?.date).toBe(90 * 12);
    expect(r[1]?.date).toBeNull();
  });
});

describe("branchOrigins", () => {
  it("anchors a simple bifurcation on the closest origin session", () => {
    const { branchOrigins } = layoutArcs(
      [s(1, 1), s(2, 2), s(3, 1)],
      [e(1, 1, 100), e(2, 2, 101), e(3, 3, 102)],
      [a(1), a(2)],
    );
    // Arc 2 @101 sits between arc1 @100 and @102; equidistant → smaller fromDate wins.
    expect(branchOrigins.get(2)).toEqual({
      fromArcId: 1,
      fromDate: 100 * 12,
      atDate: 101 * 12,
    });
  });

  it("picks the closest conflicting arc when several overlap, deterministically", () => {
    // Arc1: 100–110; Arc2: 101–105; Arc3 @103 conflicts with both — closer to Arc2.
    const input = {
      sessoes: [s(1, 1), s(2, 1), s(3, 2), s(4, 2), s(5, 3)],
      eventos: [e(1, 1, 100), e(2, 2, 110), e(3, 3, 101), e(4, 4, 105), e(5, 5, 103)],
      arcos: [a(1), a(2), a(3)],
    };
    const first = layoutArcs(input.sessoes, input.eventos, input.arcos);
    const second = layoutArcs(input.sessoes, input.eventos, input.arcos);
    expect(first.branchOrigins.get(3)).toEqual({
      fromArcId: 2,
      fromDate: 101 * 12,
      atDate: 103 * 12,
    });
    expect(second.branchOrigins.get(3)).toEqual(first.branchOrigins.get(3));
  });
});

describe("sequentialPairs", () => {
  const wfrpSessions = [
    s(17, 4),
    ...[18, 19, 20, 21].map((n) => s(n, 5)),
    ...[22, 23, 24].map((n) => s(n, 6)),
    ...[25, 26, 27, 28].map((n) => s(n, 7)),
  ];
  const wfrpEvents = [
    e(17, 17, 2511, 8),
    ...[18, 19, 21, 25, 26, 28].map((n) => e(n, n, 2511, 10)),
  ];
  const wfrpArcs = [a(4), a(5), a(6), a(7)];
  it("links the WFRP arc blocks through the undated middle arc", () => {
    const { rows, branchOrigins, sequentialPairs } = layoutArcs(wfrpSessions, wfrpEvents, wfrpArcs);
    expect(rows.map((row) => row.sessao.numero)).toEqual([
      28, 27, 26, 25, 24, 23, 22, 21, 20, 19, 18, 17,
    ]);
    expect(rows.map((row) => row.column)).toEqual(Array(12).fill(0));
    expect(branchOrigins.size).toBe(0);
    expect(sequentialPairs).toEqual(
      expect.arrayContaining([
        { newerArcId: 7, olderArcId: 6, newerRowIndex: 3, olderRowIndex: 4 },
        { newerArcId: 6, olderArcId: 5, newerRowIndex: 6, olderRowIndex: 7 },
        { newerArcId: 5, olderArcId: 4, newerRowIndex: 10, olderRowIndex: 11 },
      ]),
    );
    expect(sequentialPairs).toHaveLength(3);
    expect(rows.slice(4, 7).every((row) => row.date === null)).toBe(true);
    expect(elapsed(rows[3]!.date, rows[4]!.date)).toBeNull();
    expect(elapsed(rows[6]!.date, rows[7]!.date)).toBeNull();
  });
  it("relinks visible neighbors after hiding the middle arc", () => {
    const { sequentialPairs } = layoutArcs(
      wfrpSessions.filter((row) => row.arco_id !== 6),
      wfrpEvents,
      wfrpArcs,
    );
    expect(sequentialPairs).toContainEqual({
      newerArcId: 7,
      olderArcId: 5,
      newerRowIndex: 3,
      olderRowIndex: 4,
    });
  });
  it("does not link nonadjacent blocks or cross an undated Sem arco row", () => {
    const withGap = layoutArcs([...wfrpSessions, s(29, null)], wfrpEvents, wfrpArcs);
    expect(withGap.sequentialPairs.some((p) => p.newerArcId === 7 && p.olderArcId === 5)).toBe(
      false,
    );
    const blocked = layoutArcs(
      [s(1, 1), s(2, null), s(3, 2)],
      [e(1, 1, 100), e(2, 2, 101), e(3, 3, 102)],
      [a(1), a(2)],
    );
    expect(blocked.sequentialPairs).toEqual([]);
  });
  it("links linear non-overlapping arcs in one column", () => {
    const { sequentialPairs, rows } = layoutArcs(
      [s(1, 1), s(2, 2)],
      [e(1, 1, 100), e(2, 2, 101)],
      [a(1), a(2)],
    );
    expect(rows.map((x) => x.column)).toEqual([0, 0]);
    expect(sequentialPairs).toEqual([
      { newerArcId: 2, olderArcId: 1, newerRowIndex: 0, olderRowIndex: 1 },
    ]);
  });

  it("does not form a sequential pair across a Sem arco row", () => {
    const { sequentialPairs } = layoutArcs(
      [s(1, 1), s(2, null), s(3, 2)],
      [e(1, 1, 100), e(2, 2, 101), e(3, 3, 102)],
      [a(1), a(2)],
    );
    expect(sequentialPairs).toEqual([]);
  });

  it("still finds sequential arcs when a bifurcation sits between their other sessions", () => {
    // Arc1 continues 100–102; Arc2 branches at 101; Arc3 starts at 104 after Arc1.
    // Facing edges 104↔102 are adjacent; Arc3 and Arc1 stay sequential. Arc2 is col 1.
    const { sequentialPairs, rows, branchOrigins } = layoutArcs(
      [s(1, 1), s(2, 2), s(3, 1), s(4, 3)],
      [e(1, 1, 100), e(2, 2, 101), e(3, 3, 102), e(4, 4, 104)],
      [a(1), a(2), a(3)],
    );
    expect(branchOrigins.has(2)).toBe(true);
    expect(rows.find((r) => r.sessao.id === 2)?.column).toBe(1);
    expect(rows.find((r) => r.sessao.id === 4)?.column).toBe(0);
    expect(sequentialPairs).toContainEqual({
      newerArcId: 3,
      olderArcId: 1,
      newerRowIndex: 0,
      olderRowIndex: 1,
    });
  });

  it("finds sequential pairs with non-adjacent row indices when only a branch sits in the gap", () => {
    // Wide Arc4 spans the gap; Arc5 branches from it at 150. Arc1 ends at 110, Arc3 starts at 180.
    const { sequentialPairs, rows } = layoutArcs(
      [s(1, 1), s(2, 1), s(3, 3), s(4, 3), s(5, 4), s(6, 4), s(7, 5)],
      [
        e(1, 1, 100),
        e(2, 2, 110),
        e(3, 3, 180),
        e(4, 4, 190),
        e(5, 5, 90),
        e(6, 6, 220),
        e(7, 7, 150),
      ],
      [a(1), a(3), a(4), a(5)],
    );
    expect(rows.find((r) => r.sessao.id === 7)?.column).toBeGreaterThan(0);
    const pair = sequentialPairs.find((p) => p.newerArcId === 3 && p.olderArcId === 1);
    expect(pair).toBeDefined();
    expect(Math.abs((pair?.olderRowIndex ?? 0) - (pair?.newerRowIndex ?? 0))).toBeGreaterThan(1);
  });
});
