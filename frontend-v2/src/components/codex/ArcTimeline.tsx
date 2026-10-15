import { useId, useMemo } from "react";
import type { TFunction } from "i18next";
import { useTranslation } from "react-i18next";
import type { Arco, Evento } from "@/api/timeline";
import type { Sessao } from "@/api/sessoes";
import { layoutArcs, elapsed } from "@/lib/timelineLayout";

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
        const x1 = before.r.column * 64 + 12,
          x2 = r.column * 64 + 12,
          y1 = before.i * 96 + 45,
          y2 = i * 96 + 45,
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

  const sequentialGradients = visibleSequential.map((p, idx) => {
    const newerArc = arcos.find((a) => a.id === p.newerArcId);
    const olderArc = arcos.find((a) => a.id === p.olderArcId);
    const id = `${uid}-seq-${idx}`;
    return (
      <linearGradient key={id} id={id} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={newerArc?.cor ?? "var(--border)"} />
        <stop offset="100%" stopColor={olderArc?.cor ?? "var(--border)"} />
      </linearGradient>
    );
  });

  const sequentialLinks = visibleSequential.map((p, idx) => {
    const newer = shown[p.newerRowIndex]!;
    const older = shown[p.olderRowIndex]!;
    const x1 = newer.column * 64 + 12,
      x2 = older.column * 64 + 12,
      y1 = p.newerRowIndex * 96 + 45,
      y2 = p.olderRowIndex * 96 + 45,
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
        strokeWidth="2"
        strokeDasharray="6 5"
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
    const x1 = from.column * 64 + 12,
      x2 = at.column * 64 + 12,
      y1 = fromIdx * 96 + 45,
      y2 = atIdx * 96 + 45,
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
    const y = ((p.newerRowIndex + p.olderRowIndex) / 2) * 96 + 45;
    const x = ((newer.column + older.column) / 2) * 64 + 28;
    return (
      <span
        key={`seq-label:${p.newerArcId}:${p.olderArcId}`}
        data-sequential-label
        className="pointer-events-none absolute z-20 text-xs text-muted-foreground"
        style={{ top: y, left: x, transform: "translateY(-50%)" }}
        aria-label={t("arcos.betweenArcsAria", { elapsed: text })}
      >
        {t("arcos.betweenArcs", { elapsed: text })}
      </span>
    );
  });

  return (
    <div className="relative mt-8" style={{ height: shown.length * 96 }}>
      <svg
        className="pointer-events-none absolute inset-0 overflow-visible"
        aria-hidden
        width="800"
        height={shown.length * 96}
        viewBox={`0 0 800 ${shown.length * 96}`}
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
          <div
            key={r.sessao.id}
            data-session-id={r.sessao.id}
            data-column={r.column}
            className="absolute right-0 left-0 flex items-center"
            style={{ top: i * 96, height: 90, paddingLeft: r.column * 64 }}
          >
            <span
              className="relative z-10 mr-3 h-5 w-5 shrink-0 rounded-full border-4 border-background"
              style={{ backgroundColor: arc?.cor ?? "var(--muted-foreground)" }}
            />
            <article className="relative z-10 min-w-0 flex-1 rounded-2xl border bg-card p-4 shadow-float">
              <div className="flex justify-between gap-2">
                <strong>
                  {r.sessao.numero}. {r.sessao.titulo}
                </strong>
                <small>{arc?.titulo ?? t("arcos.semArco")}</small>
              </div>
              <p className="text-sm text-muted-foreground">
                {r.date == null ? "—" : `${Math.floor(r.date / 12)}/${(r.date % 12) + 1}`}
                {gapText ? ` · ${gapText}` : ""}
              </p>
            </article>
          </div>
        );
      })}
    </div>
  );
}
