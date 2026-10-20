import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useCampaignKey } from "@/api/campaign";
import { ApiError } from "@/api/client";
import {
  GERADOR_TIPOS,
  geradoresApi,
  type GeradorResultado,
  type GeradorTipo,
} from "@/api/geradores";
import { useEditMode } from "@/auth/EditModeContext";
import { badgeVariants } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type PanelState = { result?: GeradorResultado; error?: string; loading?: boolean };

export function Tools() {
  const slug = useCampaignKey();
  const { t, i18n } = useTranslation("ferramentas");
  const { canEdit, ready } = useEditMode();
  const [panels, setPanels] = useState<Partial<Record<GeradorTipo, PanelState>>>({});

  async function roll(tipo: GeradorTipo) {
    setPanels((p) => ({ ...p, [tipo]: { ...p[tipo], loading: true, error: undefined } }));
    try {
      const result = await geradoresApi.sortear(slug, tipo, i18n.resolvedLanguage ?? "pt-BR");
      setPanels((p) => ({ ...p, [tipo]: { result } }));
    } catch (error) {
      const message =
        error instanceof ApiError && error.codigo
          ? t(`errors.${error.codigo}`)
          : t("errors.generic");
      setPanels((p) => ({ ...p, [tipo]: { ...p[tipo], loading: false, error: message } }));
    }
  }

  if (!ready) {
    return (
      <main className="mx-auto min-h-screen max-w-4xl px-4 pt-24 pb-28">
        <p role="status" className="text-sm text-muted-foreground">
          {t("loading")}
        </p>
      </main>
    );
  }

  if (!canEdit) {
    return (
      <main className="mx-auto min-h-screen max-w-4xl px-4 pt-24 pb-28">
        <p role="alert" className="text-sm text-muted-foreground">
          {t("gmOnly")}
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-screen max-w-4xl px-4 pt-24 pb-28 lg:pb-16">
      <p className="eyebrow">{t("eyebrow")}</p>
      <h1 className="mt-1 font-display text-3xl font-medium">{t("title")}</h1>
      <p className="mt-2 max-w-prose text-sm text-muted-foreground">{t("intro")}</p>
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {GERADOR_TIPOS.map((tipo) => {
          const panel = panels[tipo] ?? {};
          return (
            <section
              key={tipo}
              aria-labelledby={`gerador-${tipo}`}
              className="rounded-2xl border border-border bg-card p-5 shadow-float"
            >
              <h2 id={`gerador-${tipo}`} className="font-display text-xl font-medium">
                {t(`${tipo}.title`)}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">{t(`${tipo}.hint`)}</p>
              <div
                aria-live="polite"
                className="my-5 flex min-h-[72px] items-center border-l-[3px] border-seal bg-background/60 p-4 font-display text-lg"
              >
                {panel.error ? (
                  <span role="alert" className="text-sm text-destructive">
                    {panel.error}
                  </span>
                ) : panel.result ? (
                  panel.result.resultado
                ) : (
                  <span className="text-sm text-muted-foreground">{t("empty")}</span>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => void roll(tipo)}
                  disabled={panel.loading}
                  className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60"
                >
                  {panel.result ? t("rollAgain") : t("roll")}
                </button>
                {panel.result?.fallback && (
                  <span className={cn(badgeVariants({ variant: "secondary" }))}>
                    {t("genericBadge")}
                  </span>
                )}
              </div>
            </section>
          );
        })}
      </div>
    </main>
  );
}
