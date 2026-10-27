import { useEffect, useId, useState } from "react";
import { ChevronDown, LockKeyhole } from "lucide-react";
import { useTranslation } from "react-i18next";
import { fiosApi, type Fio } from "@/api/fios";
import type { Sessao } from "@/api/sessoes";
import { RichContent } from "./RichContent";

export function SessionReadBlocks({
  sessao,
  slug,
  enabled,
  isDono,
  fiosRevision,
  onShowThreads,
}: {
  sessao: Sessao;
  slug: string;
  enabled: boolean;
  isDono: boolean;
  fiosRevision: number;
  onShowThreads?: () => void;
}) {
  const { t } = useTranslation("sessoes");
  const notesId = useId();
  const threadsId = useId();
  const summaryId = useId();
  const sessionKey = `${slug}:${sessao.id}`;
  const [collapse, setCollapse] = useState<{
    sessionKey: string;
    expanded: Record<"notes" | "threads" | "summary", boolean>;
  }>({ sessionKey, expanded: { notes: true, threads: true, summary: true } });
  const expanded =
    collapse.sessionKey === sessionKey
      ? collapse.expanded
      : { notes: true, threads: true, summary: true };
  const toggle = (block: keyof typeof expanded) => {
    setCollapse({ sessionKey, expanded: { ...expanded, [block]: !expanded[block] } });
  };
  const header = (block: keyof typeof expanded, label: string, contentId: string) => (
    <button
      type="button"
      className="inline-flex min-w-0 cursor-pointer items-center gap-2 rounded-sm text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      aria-label={t(expanded[block] ? "readBlocks.collapse" : "readBlocks.expand", {
        block: label,
      })}
      aria-expanded={expanded[block]}
      aria-controls={contentId}
      onClick={() => toggle(block)}
    >
      <h3 className="eyebrow">{label}</h3>
      <ChevronDown
        className={`h-4 w-4 shrink-0 transition-transform ${expanded[block] ? "" : "-rotate-90"}`}
        aria-hidden
      />
    </button>
  );
  const [result, setResult] = useState<{ key: string; rows: Fio[]; error: boolean } | null>(null);
  const key = `${slug}:${sessao.id}:${fiosRevision}`;
  useEffect(() => {
    if (!enabled || !isDono) return;
    let active = true;
    void fiosApi.list(slug, undefined, sessao.id).then(
      (rows) => {
        if (active) setResult({ key, rows, error: false });
      },
      () => {
        if (active) setResult({ key, rows: [], error: true });
      },
    );
    return () => {
      active = false;
    };
  }, [enabled, isDono, slug, sessao.id, fiosRevision, key]);

  const summary = sessao.resumo && (
    <div className="drop-cap font-display text-xl leading-[1.7] text-pretty">
      <RichContent markdown={sessao.resumo} />
    </div>
  );
  if (!enabled) return summary || null;

  const badge = (
    <span className="inline-flex items-center gap-1 rounded-full border border-seal/40 bg-seal/10 px-2 py-0.5 text-xs font-medium text-seal">
      <LockKeyhole className="h-3.5 w-3.5" aria-hidden />
      {t("readBlocks.private")}
    </span>
  );
  const card =
    "min-w-0 rounded-xl border border-seal/40 border-l-4 border-l-seal bg-muted p-4 break-words [overflow-wrap:anywhere]";
  const rows = result?.key === key ? result.rows : [];
  const error = result?.key === key && result.error;
  const sorted = [...rows].sort(
    (a, b) =>
      Number(a.estado === "resolvido") - Number(b.estado === "resolvido") || a.ordem - b.ordem,
  );
  return (
    <div className="flex min-w-0 flex-col gap-6">
      <section className={card} aria-label={t("fieldNotasPreparo")}>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          {header("notes", t("fieldNotasPreparo"), notesId)}
          {badge}
        </div>
        <div id={notesId} hidden={!expanded.notes}>
          {sessao.notas_preparo?.trim() ? (
            <div className="font-display text-lg leading-[1.7] text-pretty text-muted-foreground">
              <RichContent markdown={sessao.notas_preparo} callouts />
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">{t("readBlocks.emptyNotes")}</p>
          )}
        </div>
      </section>
      {isDono && (
        <section className={card} aria-label={t("readBlocks.threads")}>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            {header("threads", t("readBlocks.threads"), threadsId)}
            {badge}
          </div>
          <div id={threadsId} hidden={!expanded.threads}>
            {error ? (
              <p role="alert" className="text-sm text-destructive">
                {t("readBlocks.threadsError")}
              </p>
            ) : sorted.length ? (
              <ol className="space-y-3">
                {sorted.map((fio) => (
                  <li key={fio.id} className="min-w-0 break-words [overflow-wrap:anywhere]">
                    <p
                      className={
                        fio.estado === "resolvido"
                          ? "text-muted-foreground line-through"
                          : "font-medium"
                      }
                    >
                      {fio.titulo}
                    </p>
                    <p className="whitespace-pre-wrap text-sm">{fio.descricao}</p>
                    <p className="text-xs text-muted-foreground">{t(`fios.${fio.estado}`)}</p>
                  </li>
                ))}
              </ol>
            ) : result?.key === key ? (
              <p className="text-sm text-muted-foreground">{t("readBlocks.emptyThreads")}</p>
            ) : (
              <p role="status" className="text-sm text-muted-foreground">
                {t("readBlocks.loadingThreads")}
              </p>
            )}
            <a
              href="#fios-em-aberto"
              className="mt-4 inline-block text-sm text-seal underline"
              onClick={(event) => {
                const target = document.getElementById("fios-em-aberto");
                if (target) {
                  event.preventDefault();
                  if (target.getClientRects().length === 0) {
                    onShowThreads?.();
                    return;
                  }
                  history.replaceState(null, "", "#fios-em-aberto");
                  target.scrollIntoView({
                    behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
                      ? "instant"
                      : "smooth",
                  });
                }
              }}
            >
              {t("readBlocks.allThreads")}
            </a>
          </div>
        </section>
      )}
      <section
        className="mt-2 min-w-0 border-t border-border pt-6 break-words [overflow-wrap:anywhere]"
        aria-label={t("fieldResumo")}
      >
        <div className="mb-2">{header("summary", t("fieldResumo"), summaryId)}</div>
        <div id={summaryId} hidden={!expanded.summary}>
          {summary || (
            <p className="text-sm text-muted-foreground">{t("readBlocks.emptySummary")}</p>
          )}
        </div>
      </section>
    </div>
  );
}
