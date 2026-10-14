import { eras, events } from "@/lib/codex-data";
import { CharChip, LocChip, SessionChip } from "@/components/codex/entity";
import { RichContent } from "@/components/codex/RichContent";
import { useTranslation } from "react-i18next";

const START = eras[0]!.start;
const END = eras[eras.length - 1]!.end;
const pct = (y: number) => ((y - START) / (END - START)) * 100;

export function Timeline() {
  const { t } = useTranslation("linhaTempo");
  return (
    <main className="min-h-screen pt-24 pb-28 lg:pb-16">
      <header className="mx-auto max-w-5xl px-4">
        <p className="eyebrow">{t("v2.worldEvents")}</p>
        <h1 className="mt-1 font-display text-4xl font-medium md:text-5xl">
          {t("v2.timelineTitle")}
        </h1>
        <p className="mt-2 max-w-xl text-muted-foreground">{t("v2.calendarHint")}</p>
      </header>

      {/* Proportional era strip */}
      <div className="mx-auto mt-10 max-w-5xl px-4">
        <div className="relative h-16 overflow-hidden rounded-xl border border-border bg-card">
          {eras.map((e, i) => (
            <div
              key={e.id}
              className="absolute inset-y-0 flex items-end border-r border-border p-2"
              style={{
                left: `${pct(e.start)}%`,
                width: `${pct(e.end) - pct(e.start)}%`,
                background: i % 2 ? "var(--muted)" : "transparent",
              }}
            >
              <span className="truncate font-mono text-[10px] tracking-wider text-muted-foreground uppercase">
                {e.name}
              </span>
            </div>
          ))}
          {events.map((e) => (
            <a
              key={e.id}
              href={`#${e.id}`}
              className="absolute top-2 h-4 w-4 -translate-x-1/2 rotate-45 border-2 border-card bg-seal hover:scale-125"
              style={{ left: `${pct(e.year)}%` }}
              aria-label={`${e.year}: ${e.title}`}
            />
          ))}
        </div>
        <div className="mt-1 flex justify-between font-mono text-[11px] text-muted-foreground">
          <span>{START} CI</span>
          <span>{END} CI</span>
        </div>
      </div>

      <div className="mx-auto mt-14 max-w-5xl px-4">
        {eras.map((era) => {
          const evs = events.filter((e) => e.era === era.id);
          return (
            <section key={era.id} className="grid gap-4 md:grid-cols-[200px_1fr]">
              <div className="md:sticky md:top-24 md:self-start">
                <p className="font-display text-xl italic">{era.name}</p>
                <p className="font-mono text-xs text-muted-foreground">
                  {era.start}–{era.end} · {t("v2.years", { count: era.end - era.start })}
                </p>
              </div>
              <ol className="relative border-l-2 border-border pb-10 pl-8">
                {evs.map((e, i) => {
                  const prev = i > 0 ? evs[i - 1] : undefined;
                  return (
                    <li key={e.id} id={e.id} className="scroll-mt-28">
                      {prev && (
                        <p className="-ml-8 mb-4 py-2 pl-3 font-mono text-[11px] tracking-wider text-muted-foreground uppercase">
                          {t("v2.yearsLater", { count: e.year - prev.year })}
                        </p>
                      )}
                      <div className="relative mb-6 rounded-2xl border border-border bg-card p-5 shadow-float">
                        <span
                          className="absolute top-6 -left-[41px] h-4 w-4 rotate-45 border-2 border-background bg-seal"
                          aria-hidden
                        />
                        <p className="font-display text-3xl tabular-nums text-seal">
                          {e.approx ? "c. " : ""}
                          {e.year}
                          <span className="ml-2 font-mono text-xs text-muted-foreground">
                            {e.month ? `${e.month} · ` : ""}CI
                          </span>
                        </p>
                        <h2 className="mt-1 text-lg font-semibold">{e.title}</h2>
                        <div className="mt-1 text-muted-foreground">
                          <RichContent markdown={e.description} />
                        </div>
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {e.locations.map((l) => (
                            <LocChip key={l} id={l} />
                          ))}
                          {e.characters.map((c) => (
                            <CharChip key={c} id={c} />
                          ))}
                          {e.session && (
                            <SessionChip n={e.session} title={t("v2.recordedAtTable")} />
                          )}
                        </div>
                      </div>
                    </li>
                  );
                })}
                {evs.length === 0 && (
                  <li className="text-sm text-muted-foreground italic">{t("v2.noEvents")}</li>
                )}
              </ol>
            </section>
          );
        })}
      </div>
    </main>
  );
}
