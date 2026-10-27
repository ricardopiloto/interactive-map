import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Loader2, Plus } from "lucide-react";
import { campanhasApi, type PainelItem } from "@/api/campanhas";
import { indiceIaApi, type EstadoIndiceIa } from "@/api/indiceIa";
import { CampaignCard } from "@/components/site/CampaignCard";
import { SiteHeader } from "@/components/site/SiteHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { useApiErrorMessage } from "@/lib/apiError";
import { formatBytes } from "@/lib/formatBytes";
import { campaignHref } from "@/lib/navigation";

function IndiceCampanha({ slug }: { slug: string }) {
  const { t, i18n } = useTranslation("comum");
  const explain = useApiErrorMessage();
  const [indice, setIndice] = useState<EstadoIndiceIa | null>(null);
  const [loading, setLoading] = useState(true);
  const [reindexing, setReindexing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    let active = true;
    void indiceIaApi
      .estado(slug)
      .then(
        (result) => {
          if (active) setIndice(result);
        },
        (reason) => {
          if (active) setError(explain(reason));
        },
      )
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [slug, explain]);

  async function reindexar() {
    setError(null);
    setSuccess(false);
    setReindexing(true);
    try {
      setIndice(await indiceIaApi.reindexar(slug));
      setSuccess(true);
    } catch (reason) {
      setError(explain(reason));
    } finally {
      setReindexing(false);
    }
  }

  return (
    <section
      className="min-w-0 space-y-2 rounded-lg border p-3"
      aria-label={t("painel.indice.title")}
    >
      <h3 className="font-medium">{t("painel.indice.title")}</h3>
      {loading ? (
        <p role="status">{t("painel.indice.loading")}</p>
      ) : (
        indice && (
          <div className="space-y-1 text-sm">
            <p>
              {t("painel.indice.status")}: {t(`painel.indice.states.${indice.estado}`)}
            </p>
            <p>
              {t("painel.indice.counts", { registros: indice.registros, trechos: indice.trechos })}
            </p>
            <p className="break-words">
              {t("painel.indice.updated")}:{" "}
              {indice.atualizado_em
                ? new Intl.DateTimeFormat(i18n.language, {
                    dateStyle: "short",
                    timeStyle: "short",
                  }).format(
                    new Date(
                      `${indice.atualizado_em}${/Z|[+-]\d\d:\d\d$/.test(indice.atualizado_em) ? "" : "Z"}`,
                    ),
                  )
                : t("painel.indice.never")}
            </p>
          </div>
        )
      )}
      <Button
        variant="outline"
        size="sm"
        type="button"
        disabled={loading || reindexing}
        onClick={() => void reindexar()}
        className="max-w-full whitespace-normal"
      >
        {reindexing && <Loader2 className="animate-spin" aria-hidden />}
        {reindexing ? t("painel.indice.reindexing") : t("painel.indice.reindex")}
      </Button>
      {success && (
        <p role="status" className="text-sm">
          {t("painel.indice.success")}
        </p>
      )}
      {error && (
        <p role="alert" className="break-words text-sm text-destructive">
          {t("painel.indice.error")}: {error}
        </p>
      )}
    </section>
  );
}

export function PainelPage() {
  const { t } = useTranslation("comum");
  const explain = useApiErrorMessage();
  const [items, setItems] = useState<PainelItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [importSlug, setImportSlug] = useState("");

  const refresh = useCallback(async () => {
    const res = await campanhasApi.minhas();
    setItems(res.campanhas);
  }, []);

  useEffect(() => {
    let cancelled = false;
    void refresh().catch((reason) => {
      if (!cancelled) setError(explain(reason));
    });
    return () => {
      cancelled = true;
    };
  }, [explain, refresh]);

  async function run(action: () => Promise<void>) {
    setError(null);
    try {
      await action();
      await refresh();
    } catch (reason) {
      setError(explain(reason));
    }
  }

  async function onCapa(item: PainelItem, file: File | undefined) {
    if (!file) return;
    await run(async () => {
      const uploaded = await campanhasApi.uploadCapa(item.slug, file);
      const name = uploaded.url.split("/").pop() ?? "";
      await campanhasApi.patchCapa(item.slug, { capa_arquivo: name });
    });
  }

  async function onExport(slug: string) {
    setError(null);
    try {
      const blob = await campanhasApi.exportZip(slug);
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `${slug}-export.zip`;
      anchor.click();
      URL.revokeObjectURL(url);
    } catch (reason) {
      setError(explain(reason));
    }
  }

  async function onImport(file: File | null) {
    if (!file) return;
    setBusy(true);
    await run(async () => {
      await campanhasApi.importZip(file, importSlug.trim() || undefined);
      setImportSlug("");
    });
    setBusy(false);
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-6xl space-y-8 px-4 py-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-5xl">{t("painel.title")}</h1>
            <p className="text-muted-foreground">{t("painel.lead")}</p>
          </div>
          <Button asChild>
            <Link to="/painel/novo">
              <Plus aria-hidden />
              {t("painel.createCta")}
            </Link>
          </Button>
        </div>
        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}
        {items === null ? (
          <p role="status">{t("admin.loading")}</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {items.map((campaign) => {
              const pct = Math.min(
                100,
                Math.round((campaign.bytes_usados / Math.max(1, campaign.cota_bytes)) * 100),
              );
              const unit = campaign.unidade_distancia === "km" ? "km" : "mi";
              return (
                <CampaignCard
                  key={campaign.slug}
                  id={campaign.id}
                  slug={campaign.slug}
                  nome={campaign.nome}
                  sistema={campaign.sistema}
                  capaUrl={campaign.capa_url ?? null}
                  href={campaignHref(campaign.id, campaign.slug)}
                >
                  <Badge variant="secondary">
                    {campaign.visibilidade === "listada"
                      ? t("painel.visListada")
                      : t("painel.visSoLink")}
                  </Badge>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>
                        {t("painel.quota", {
                          used: formatBytes(campaign.bytes_usados),
                          cap: formatBytes(campaign.cota_bytes),
                        })}
                      </span>
                      {campaign.aviso_cota ? <span>{t("quota.warningNearFull")}</span> : null}
                    </div>
                    <Progress value={pct} aria-label={t("painel.quota", { used: "", cap: "" })} />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link to={campaignHref(campaign.id, campaign.slug)}>{t("painel.open")}</Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      type="button"
                      onClick={() => void onExport(campaign.slug)}
                    >
                      {t("painel.export")}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      type="button"
                      onClick={() =>
                        void run(() =>
                          campanhasApi
                            .patchVisibilidade(
                              campaign.slug,
                              campaign.visibilidade === "listada" ? "so_link" : "listada",
                            )
                            .then(() => undefined),
                        )
                      }
                    >
                      {campaign.visibilidade === "listada"
                        ? t("painel.makeSoLink")
                        : t("painel.makeListada")}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      type="button"
                      onClick={() =>
                        void run(() =>
                          campanhasApi
                            .patchUnidadeDistancia(campaign.slug, unit === "km" ? "mi" : "km")
                            .then(() => undefined),
                        )
                      }
                    >
                      {t("painel.toggleUnit")} ({unit})
                    </Button>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Switch
                        id={`ia-${campaign.slug}`}
                        checked={campaign.modulos_ativos.includes("ia_arcos")}
                        onCheckedChange={(ativo) =>
                          void run(() =>
                            campanhasApi
                              .patchModulo(campaign.slug, "ia_arcos", ativo)
                              .then(() => undefined),
                          )
                        }
                      />
                      <Label htmlFor={`ia-${campaign.slug}`}>{t("painel.moduloIaArcos")}</Label>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {t("painel.moduloIaArcosAjuda")}
                    </p>
                  </div>
                  {campaign.modulos_ativos.includes("ia_arcos") && (
                    <IndiceCampanha slug={campaign.slug} />
                  )}
                  <label className="grid gap-1 text-sm">
                    {t("painel.cover")}
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/gif"
                      aria-label={`${t("painel.cover")}: ${campaign.nome}`}
                      onChange={(event) => void onCapa(campaign, event.target.files?.[0])}
                    />
                  </label>
                  {campaign.capa_url && (
                    <Button
                      size="sm"
                      variant="ghost"
                      type="button"
                      onClick={() =>
                        void run(() =>
                          campanhasApi
                            .patchCapa(campaign.slug, { limpar_capa: true })
                            .then(() => undefined),
                        )
                      }
                    >
                      {t("painel.clearCover")}
                    </Button>
                  )}
                </CampaignCard>
              );
            })}
            <Link
              to="/painel/novo"
              className="flex min-h-48 flex-col items-center justify-center gap-2 rounded-xl border border-dashed text-muted-foreground hover:bg-accent"
            >
              <Plus aria-hidden />
              {t("painel.newCard")}
            </Link>
          </div>
        )}
        {items?.length === 0 && <p>{t("painel.empty")}</p>}
        <section className="max-w-md space-y-3 rounded-xl border bg-card p-4">
          <h2 className="font-display text-2xl">{t("painel.importTitle")}</h2>
          <Label htmlFor="import-slug">{t("painel.importSlugOptional")}</Label>
          <Input
            id="import-slug"
            value={importSlug}
            onChange={(event) => setImportSlug(event.target.value)}
            placeholder="slug-opcional"
          />
          <label className="grid gap-1 text-sm">
            {t("painel.importFile")}
            <input
              type="file"
              accept=".zip,application/zip"
              disabled={busy}
              aria-label={t("painel.importFile")}
              onChange={(event) => void onImport(event.target.files?.[0] ?? null)}
            />
          </label>
        </section>
      </main>
    </div>
  );
}
