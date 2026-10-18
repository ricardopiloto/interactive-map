import { useId, useMemo } from "react";
import type { TFunction } from "i18next";
import { useTranslation } from "react-i18next";
import type { Arco, Evento } from "@/api/timeline";
import type { Sessao } from "@/api/sessoes";
import { Link } from "@/lib/navigation";
import { layoutArcs, elapsed } from "@/lib/timelineLayout";

/** Vertical pitch between session rows (must fit compact cards on mobile). */
const ROW_H = 112;
/** Horizontal offset per branch column. */
const COL_W = 64;
/** Dot center within a row. */
const ROW_MID = 45;
/** Visible row height, leaving a small gap before the next card. */
const ROW_INNER = ROW_H - 6;

function formatElapsed(gap: { years: number; months: number } | null, t: TFunction<"linhaTempo">) {
  if (!gap) return null;
  if (!gap.years && !gap.months) return t("arcos.elapsedSame");
  const years = gap.years ? t("arcos.elapsedYears", { count: gap.years }) : "";
  const months = gap.months ? t("arcos.elapsedMonths", { count: gap.months }) : "";
  if (years && months) return t("arcos.elapsedBoth", { years, months });
  return `${years} ${months}`.trim();
}

function pairKey(a: number, b: number) {
  return a < b ? `${a}:${b}` : `${b}:${a}`;
}

function colX(column: number) {
  return column * COL_W + 12;
}

function rowY(index: number) {
  return index * ROW_H + ROW_MID;
}

/** The SVG spans fixed-height rows so each arc stays connected across branches. */
export function ArcTimeline({
  sessoes,
  eventos,
  arcos,
  filter,
}: {
  sessoes: Sessao[];
  eventos: Evento[];
  arcos: Arco[];
  filter: string;
}) {
  const { t } = useTranslation("linhaTempo");
  const uid = useId();

  const filteredSessoes = useMemo(() => {
    if (filter === "all") return sessoes;
    if (filter === "none") return sessoes.filter((s) => s.arco_id == null);
    return sessoes.filter((s) => String(s.arco_id) === filter);
  }, [sessoes, filter]);

  const filteredEventos = useMemo(() => {
    const ids = new Set(filteredSessoes.map((s) => s.id));
    return eventos.filter((e) => e.sessao_id != null && ids.has(e.sessao_id));
  }, [eventos, filteredSessoes]);

  const {
    rows: shown,
    branchOrigins,
    sequentialPairs,
  } = useMemo(
    () => layoutArcs(filteredSessoes, filteredEventos, arcos),
    [filteredSessoes, filteredEventos, arcos],
  );

  const explicitTransitionPairs = useMemo(() => {
    const pairs = new Set<string>();
    for (const r of shown) {
      if (r.arcId != null && r.sessao.arco_transicao_id != null)
        pairs.add(pairKey(r.arcId, r.sessao.arco_transicao_id));
    }
    return pairs;
  }, [shown]);

  const visibleSequential = useMemo(
    () =>
      sequentialPairs.filter(
        (p) => !explicitTransitionPairs.has(pairKey(p.newerArcId, p.olderArcId)),
      ),
    [sequentialPairs, explicitTransitionPairs],
  );

  const sequentialIndexSet = useMemo(() => {
    const set = new Set<string>();
    for (const p of visibleSequential)
      set.add(
        `${Math.min(p.newerRowIndex, p.olderRowIndex)}:${Math.max(p.newerRowIndex, p.olderRowIndex)}`,
      );
    return set;
  }, [visibleSequential]);

  const keys = [
    ...new Set(shown.map((r) => r.arcId).concat(shown.map((r) => r.sessao.arco_transicao_id))),
  ];

  const totalHeight = shown.length * ROW_H;

  const arcLinks = keys
    .filter((id) => id !== null)
    .flatMap((id) => {
      const chain = shown
        .map((r, i) => ({ r, i }))
        .filter(({ r }) => r.arcId === id || r.sessao.arco_transicao_id === id);
      return chain.slice(1).map(({ r, i }, j) => {
        const before = chain[j]!;
        // Skip cross-arc segments covered by a sequential-pair gradient.
        if (
          before.r.arcId !== r.arcId &&
          sequentialIndexSet.has(`${Math.min(before.i, i)}:${Math.max(before.i, i)}`)
        )
          return null;
        const x1 = colX(before.r.column),
          x2 = colX(r.column),
          y1 = rowY(before.i),
          y2 = rowY(i),
          mid = (y1 + y2) / 2;
        const gap = elapsed(before.r.date, r.date);
        const arc = arcos.find((a) => a.id === id);
        return (
          <path
            key={`arc:${id}:${i}`}
            data-link="arc"
            data-transition={
              before.r.sessao.arco_transicao_id === id || r.sessao.arco_transicao_id === id
                ? "true"
                : undefined
            }
            d={
              x1 === x2
                ? `M${x1} ${y1} V${y2}`
                : `M${x1} ${y1} C${x1} ${mid} ${x2} ${mid} ${x2} ${y2}`
            }
            fill="none"
            stroke={arc?.cor ?? "var(--border)"}
            strokeWidth="2"
            strokeDasharray={gap?.long ? "6 5" : undefined}
          />
        );
      });
    });

  // userSpaceOnUse is required: a vertical connector has objectBoundingBox width 0,
  // so the default gradientUnits leave the dashed stroke invisible.
  const sequentialGradients = visibleSequential.map((p, idx) => {
    const newer = shown[p.newerRowIndex]!;
    const older = shown[p.olderRowIndex]!;
    const newerArc = arcos.find((a) => a.id === p.newerArcId);
    const olderArc = arcos.find((a) => a.id === p.olderArcId);
    const id = `${uid}-seq-${idx}`;
    const x1 = colX(newer.column);
    const x2 = colX(older.column);
    const y1 = rowY(p.newerRowIndex);
    const y2 = rowY(p.olderRowIndex);
    return (
      <linearGradient
        key={id}
        id={id}
        gradientUnits="userSpaceOnUse"
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
      >
        <stop offset="0%" stopColor={newerArc?.cor ?? "var(--border)"} />
        <stop offset="100%" stopColor={olderArc?.cor ?? "var(--border)"} />
      </linearGradient>
    );
  });

  const sequentialLinks = visibleSequential.map((p, idx) => {
    const newer = shown[p.newerRowIndex]!;
    const older = shown[p.olderRowIndex]!;
    const x1 = colX(newer.column),
      x2 = colX(older.column),
      y1 = rowY(p.newerRowIndex),
      y2 = rowY(p.olderRowIndex),
      mid = (y1 + y2) / 2;
    const gradId = `${uid}-seq-${idx}`;
    const straight = x1 === x2;
    return (
      <path
        key={`seq:${p.newerArcId}:${p.olderArcId}`}
        data-link="sequential"
        data-newer-arc={p.newerArcId}
        data-older-arc={p.olderArcId}
        d={straight ? `M${x1} ${y1} V${y2}` : `M${x1} ${y1} C${x1} ${mid} ${x2} ${mid} ${x2} ${y2}`}
        fill="none"
        stroke={`url(#${gradId})`}
        strokeWidth="3"
        strokeDasharray="8 7"
        strokeLinecap="round"
      />
    );
  });

  const autoBranchLinks = [...branchOrigins.entries()].flatMap(([arcId, origin]) => {
    if (explicitTransitionPairs.has(pairKey(arcId, origin.fromArcId))) return [];
    const atIdx = shown.findIndex((r) => r.arcId === arcId && r.date === origin.atDate);
    const fromIdx = shown.findIndex(
      (r) => r.arcId === origin.fromArcId && r.date === origin.fromDate,
    );
    if (atIdx < 0 || fromIdx < 0) return [];
    const at = shown[atIdx]!;
    const from = shown[fromIdx]!;
    const x1 = colX(from.column),
      x2 = colX(at.column),
      y1 = rowY(fromIdx),
      y2 = rowY(atIdx),
      mid = (y1 + y2) / 2;
    if (x1 === x2) return [];
    const arc = arcos.find((a) => a.id === arcId);
    return [
      <path
        key={`branch:${arcId}:${origin.fromArcId}`}
        data-link="auto-branch"
        data-from-arc={origin.fromArcId}
        data-to-arc={arcId}
        data-from-date={origin.fromDate}
        data-at-date={origin.atDate}
        d={`M${x1} ${y1} C${x1} ${mid} ${x2} ${mid} ${x2} ${y2}`}
        fill="none"
        stroke={arc?.cor ?? "var(--border)"}
        strokeWidth="2"
      />,
    ];
  });

  const sequentialLabels = visibleSequential.map((p) => {
    const newer = shown[p.newerRowIndex]!;
    const older = shown[p.olderRowIndex]!;
    const gap = elapsed(newer.date, older.date);
    const text = formatElapsed(gap, t);
    if (!text) return null;
    // Midpoint of the dashed sequential stroke; rotate so the copy runs with the line
    // and sits just "above" it (left of a vertical connector).
    const x = ((newer.column + older.column) / 2) * COL_W + 12;
    const y = ((p.newerRowIndex + p.olderRowIndex) / 2) * ROW_H + ROW_MID;
    return (
      <span
        key={`seq-label:${p.newerArcId}:${p.olderArcId}`}
        data-sequential-label
        className="pointer-events-none absolute z-20 whitespace-nowrap text-xs text-muted-foreground"
        style={{
          top: y,
          left: x,
          transform: "translate(-50%, -50%) rotate(-90deg) translateY(-0.7rem)",
        }}
        aria-label={t("arcos.betweenArcsAria", { elapsed: text })}
      >
        {t("arcos.betweenArcs", { elapsed: text })}
      </span>
    );
  });

  return (
    <div className="relative mt-8" style={{ height: totalHeight }}>
      <svg
        className="pointer-events-none absolute inset-0 overflow-visible"
        aria-hidden
        width="800"
        height={totalHeight}
        viewBox={`0 0 800 ${totalHeight}`}
      >
        <defs>{sequentialGradients}</defs>
        {arcLinks}
        {sequentialLinks}
        {autoBranchLinks}
      </svg>
      {sequentialLabels}
      {shown.map((r, i) => {
        const arc = arcos.find((a) => a.id === r.arcId);
        const gap = elapsed(r.previous, r.date);
        const gapText = formatElapsed(gap, t);
        return (
          <Link
            key={r.sessao.id}
            to="/sessoes"
            search={{ s: r.sessao.numero }}
            data-session-id={r.sessao.id}
            data-column={r.column}
            className="absolute right-0 left-0 flex items-center outline-none transition-opacity hover:opacity-95 focus-visible:ring-2 focus-visible:ring-seal/40"
            style={{ top: i * ROW_H, height: ROW_INNER, paddingLeft: r.column * COL_W }}
            aria-label={t("arcos.openSession", {
              number: r.sessao.numero,
              title: r.sessao.titulo,
            })}
          >
            <span
              className="relative z-10 mr-2 h-4 w-4 shrink-0 rounded-full border-4 border-background sm:mr-3 sm:h-5 sm:w-5"
              style={{ backgroundColor: arc?.cor ?? "var(--muted-foreground)" }}
              aria-hidden
            />
            <article className="relative z-10 min-w-0 flex-1 overflow-hidden rounded-2xl border bg-card p-2.5 shadow-float sm:p-3">
              <div className="flex min-w-0 flex-col gap-0.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-2">
                <strong className="min-w-0 text-sm leading-snug line-clamp-2 sm:text-base">
                  {r.sessao.numero}. {r.sessao.titulo}
                </strong>
                <small className="shrink-0 truncate text-muted-foreground sm:max-w-[40%] sm:text-right">
                  {arc?.titulo ?? t("arcos.semArco")}
                </small>
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground sm:text-sm">
                {r.date == null ? "—" : `${Math.floor(r.date / 12)}/${(r.date % 12) + 1}`}
                {gapText ? ` · ${gapText}` : ""}
              </p>
            </article>
          </Link>
        );
      })}
    </div>
  );
}
