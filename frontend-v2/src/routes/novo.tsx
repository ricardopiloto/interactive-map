import { SiteFooter } from "@/components/site/SiteFooter";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { campanhasApi } from "@/api/campanhas";
import { SiteHeader } from "@/components/site/SiteHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useApiErrorMessage } from "@/lib/apiError";
import { campaignHref } from "@/lib/navigation";
import { slugify } from "@/lib/slugify";

const STEPS = ["identity", "system", "visibility", "review"] as const;
type Visibility = "listada" | "so_link";

export function NovoCodexPage() {
  const { t } = useTranslation("comum");
  const navigate = useNavigate();
  const explain = useApiErrorMessage();
  const [step, setStep] = useState(0);
  const [nome, setNome] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [sistema, setSistema] = useState("");
  const [visibilidade, setVisibilidade] = useState<Visibility>("listada");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<{ id: number; slug: string; nome: string } | null>(null);

  const canAdvance =
    step === 0
      ? nome.trim().length > 1 && slug.trim().length > 1
      : step === 1
        ? sistema.trim().length > 1
        : true;

  function updateName(value: string) {
    setNome(value);
    if (!slugTouched) setSlug(slugify(value));
  }

  async function createCampaign() {
    setBusy(true);
    setError(null);
    try {
      const result = await campanhasApi.criar({
        nome: nome.trim(),
        slug: slug.trim(),
        sistema: sistema.trim(),
        visibilidade,
      });
      setCreated({ id: result.id, slug: result.slug, nome: result.nome });
    } catch (reason) {
      setError(explain(reason));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-10">
        {created ? (
          <div className="space-y-4 text-center">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-seal text-seal-foreground">
              <Check aria-hidden />
            </span>
            <h1 className="font-display text-4xl">
              {t("painel.wizard.successTitle", { nome: created.nome })}
            </h1>
            <p className="text-muted-foreground">
              {t("painel.wizard.successBody", { slug: created.slug })}
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Button asChild>
                <Link to={campaignHref(created.id, created.slug)}>
                  {t("painel.wizard.openCampaign")}
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/painel">{t("painel.wizard.goToPanel")}</Link>
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <ol aria-label={t("painel.wizard.progress")} className="grid grid-cols-4 gap-2 text-xs">
              {STEPS.map((key, index) => (
                <li
                  key={key}
                  aria-current={index === step ? "step" : undefined}
                  className={
                    index === step ? "font-medium text-foreground" : "text-muted-foreground"
                  }
                >
                  <span className="mb-1 flex h-7 w-7 items-center justify-center rounded-full border bg-card">
                    {index < step ? <Check className="h-3 w-3" aria-hidden /> : index + 1}
                  </span>
                  {t(`painel.wizard.steps.${key}`)}
                </li>
              ))}
            </ol>
            <section className="space-y-4 rounded-xl border bg-card p-6">
              {step === 0 && (
                <>
                  <h1 className="font-display text-4xl">{t("painel.wizard.identityTitle")}</h1>
                  <p className="text-muted-foreground">{t("painel.wizard.identityLead")}</p>
                  <label className="grid gap-1 text-sm">
                    {t("painel.wizard.name")}
                    <Input
                      autoFocus
                      value={nome}
                      onChange={(event) => updateName(event.target.value)}
                      placeholder={t("painel.wizard.namePlaceholder")}
                    />
                  </label>
                  <label className="grid gap-1 text-sm">
                    {t("painel.wizard.slugLabel")}
                    <span className="flex items-center gap-1">
                      <span className="font-mono text-muted-foreground">/c/</span>
                      <Input
                        value={slug}
                        onChange={(event) => {
                          setSlug(slugify(event.target.value));
                          setSlugTouched(true);
                        }}
                      />
                    </span>
                  </label>
                </>
              )}
              {step === 1 && (
                <>
                  <h1 className="font-display text-4xl">{t("painel.wizard.systemTitle")}</h1>
                  <p className="text-muted-foreground">{t("painel.wizard.systemLead")}</p>
                  <label className="grid gap-1 text-sm">
                    {t("painel.sistema")}
                    <Input
                      value={sistema}
                      onChange={(event) => setSistema(event.target.value)}
                      placeholder={t("painel.wizard.systemPlaceholder")}
                    />
                  </label>
                </>
              )}
              {step === 2 && (
                <>
                  <h1 className="font-display text-4xl">{t("painel.wizard.visibilityTitle")}</h1>
                  <p className="text-muted-foreground">{t("painel.wizard.visibilityLead")}</p>
                  <div className="grid gap-3">
                    {(["listada", "so_link"] as const).map((value) => (
                      <label
                        key={value}
                        className={`flex gap-3 rounded-lg border p-3 ${visibilidade === value ? "border-seal bg-accent" : ""}`}
                      >
                        <input
                          type="radio"
                          name="visibility"
                          checked={visibilidade === value}
                          onChange={() => setVisibilidade(value)}
                        />
                        <span>
                          <strong>
                            {t(value === "listada" ? "painel.visListada" : "painel.visSoLink")}
                          </strong>
                          <small className="mt-1 block text-muted-foreground">
                            {t(
                              value === "listada"
                                ? "painel.wizard.listedHelp"
                                : "painel.wizard.linkOnlyHelp",
                            )}
                          </small>
                        </span>
                      </label>
                    ))}
                  </div>
                </>
              )}
              {step === 3 && (
                <>
                  <h1 className="font-display text-4xl">{t("painel.wizard.reviewTitle")}</h1>
                  <div className="space-y-2 rounded-lg border p-4">
                    <div className="flex gap-2">
                      <Badge>{sistema}</Badge>
                      <Badge variant="outline">
                        {t(visibilidade === "listada" ? "painel.visListada" : "painel.visSoLink")}
                      </Badge>
                    </div>
                    <h2 className="font-display text-3xl">{nome}</h2>
                    <p className="font-mono text-sm">/c/{slug}</p>
                  </div>
                </>
              )}
              {error && (
                <p role="alert" className="text-sm text-destructive">
                  {error}
                </p>
              )}
              <div className="flex justify-between gap-3">
                <Button
                  variant="ghost"
                  type="button"
                  onClick={() => (step === 0 ? navigate("/painel") : setStep((value) => value - 1))}
                >
                  <ArrowLeft aria-hidden />
                  {t(step === 0 ? "painel.wizard.cancel" : "painel.wizard.back")}
                </Button>
                {step < STEPS.length - 1 ? (
                  <Button
                    type="button"
                    disabled={!canAdvance}
                    onClick={() => setStep((value) => value + 1)}
                  >
                    {t("painel.wizard.continue")}
                    <ArrowRight aria-hidden />
                  </Button>
                ) : (
                  <Button type="button" disabled={busy} onClick={() => void createCampaign()}>
                    {t(busy ? "painel.wizard.creating" : "painel.wizard.create")}
                  </Button>
                )}
              </div>
            </section>
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
