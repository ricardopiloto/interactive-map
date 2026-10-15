import { describe, expect, it } from "vitest";
import { layoutArcs } from "./timelineLayout";
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
  it("branches equal dates and leaves undated sessions last by number", () => {
    const { rows: r } = layoutArcs(
      [s(3, 2), s(2, null), s(1, 1), s(4, null)],
      [e(1, 1, 100), e(3, 3, 100)],
      [a(1), a(2)],
    );
    expect(r.map((x) => x.sessao.id)).toEqual([1, 3, 2, 4]);
    expect(r[0]?.column).not.toBe(r[1]?.column);
    expect(r.slice(2).map((x) => x.date)).toEqual([null, null]);
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
