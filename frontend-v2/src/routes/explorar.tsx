import { SiteFooter } from "@/components/site/SiteFooter";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Search } from "lucide-react";
import { campanhasApi, type CatalogoItem } from "@/api/campanhas";
import { CampaignCard } from "@/components/site/CampaignCard";
import { SiteHeader } from "@/components/site/SiteHeader";
import { Input } from "@/components/ui/input";
import { campaignHref } from "@/lib/navigation";

export function ExplorarPage() {
  const { t } = useTranslation("comum");
  const [items, setItems] = useState<CatalogoItem[] | null>(null);
  const [error, setError] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    let cancelled = false;
    void campanhasApi
      .catalogo()
      .then((res) => {
        if (!cancelled) setItems(res.campanhas);
      })
      .catch(() => {
        if (!cancelled) {
          setError(true);
          setItems([]);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    if (!items) return [];
    const q = query.trim().toLowerCase();
    return items.filter((campaign) => {
      const matchesQuery =
        !q || campaign.nome.toLowerCase().includes(q) || campaign.sistema.toLowerCase().includes(q);
      return matchesQuery;
    });
  }, [items, query]);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-6xl space-y-6 px-4 py-10">
        <div className="space-y-2">
          <h1 className="font-display text-5xl">{t("explorar.title")}</h1>
          <p className="max-w-2xl text-muted-foreground">{t("explorar.lead")}</p>
        </div>
        <div className="flex flex-col gap-4">
          <label className="relative block max-w-md">
            <Search
              className="pointer-events-none absolute top-2.5 left-3 h-4 w-4 text-muted-foreground"
              aria-hidden
            />
            <Input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t("explorar.searchPlaceholder")}
              aria-label={t("explorar.searchAria")}
              className="pl-9"
            />
          </label>
        </div>
        {error && (
          <p role="alert" className="text-sm text-destructive">
            {t("explorar.loadError")}
          </p>
        )}
        {items && filtered.length === 0 && !error && <p>{t("explorar.empty")}</p>}
        {filtered.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((campaign) => (
              <CampaignCard
                key={campaign.slug}
                id={campaign.id}
                slug={campaign.slug}
                nome={campaign.nome}
                sistema={campaign.sistema}
                capaUrl={campaign.capa_url ?? null}
                href={campaignHref(campaign.id, campaign.slug)}
              />
            ))}
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
