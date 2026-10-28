import { SiteFooter } from "@/components/site/SiteFooter";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Check, Map as MapIcon, Route as RouteIcon, Users } from "lucide-react";
import { campanhasApi, type CatalogoItem } from "@/api/campanhas";
import { useAuth } from "@/auth/AuthContext";
import { CampaignCard } from "@/components/site/CampaignCard";
import { SiteHeader } from "@/components/site/SiteHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { campaignHref } from "@/lib/navigation";

export function HomePage() {
  const { t } = useTranslation("comum");
  const { user } = useAuth();
  const [featured, setFeatured] = useState<CatalogoItem[]>([]);
  const masterTo = user ? "/painel" : "/login?next=/painel";
  const createTo = user ? "/painel/novo" : "/login?next=/painel/novo";

  useEffect(() => {
    let cancelled = false;
    void campanhasApi
      .catalogo()
      .then((res) => {
        if (!cancelled) setFeatured(res.campanhas.slice(0, 3));
      })
      .catch(() => {
        if (!cancelled) setFeatured([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main>
        <section className="mx-auto grid max-w-6xl gap-10 px-4 py-16 md:grid-cols-2 md:items-center">
          <div className="space-y-6">
            <Badge className="bg-seal text-seal-foreground">{t("landing.badge")}</Badge>
            <h1 className="font-display text-5xl leading-[1.05] font-medium text-balance">
              {t("landing.title")}
            </h1>
            <p className="max-w-xl text-lg text-muted-foreground">{t("landing.lede")}</p>
            <div className="flex flex-wrap gap-3">
              <Button asChild>
                <Link to={masterTo}>{t("landing.ctaMaster")}</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/explorar">{t("landing.ctaExplore")}</Link>
              </Button>
            </div>
            <ul className="space-y-2 text-sm">
              {[
                t("landing.checkNoAccount"),
                t("landing.checkAnySystem"),
                t("landing.checkSelfHosted"),
              ].map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-seal" aria-hidden />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="overflow-hidden rounded-2xl border bg-card shadow-float" aria-hidden>
            <div className="flex gap-1.5 border-b px-4 py-3">
              <span className="h-2.5 w-2.5 rounded-full bg-seal" />
              <span className="h-2.5 w-2.5 rounded-full bg-ochre" />
              <span className="h-2.5 w-2.5 rounded-full bg-verdigris" />
            </div>
            <div className="grid min-h-64 grid-cols-5">
              <div className="col-span-2 space-y-3 border-r p-4">
                <div className="h-8 rounded-md bg-muted" />
                <div className="h-4 rounded bg-muted" />
                <div className="h-4 w-2/3 rounded bg-muted" />
              </div>
              <div className="relative col-span-3 bg-accent/50">
                <span className="absolute top-1/3 left-[30%] h-3 w-3 rounded-full bg-seal" />
                <span className="absolute top-1/2 left-[55%] h-3 w-3 rounded-full bg-ochre" />
                <span className="absolute top-[28%] left-[68%] h-4 w-4 rounded-full border-2 border-verdigris" />
              </div>
            </div>
          </div>
        </section>

        <section className="border-y bg-card/60">
          <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 md:grid-cols-3">
            {[
              { icon: MapIcon, title: t("landing.stepMapTitle"), body: t("landing.stepMapBody") },
              { icon: Users, title: t("landing.stepRelTitle"), body: t("landing.stepRelBody") },
              {
                icon: RouteIcon,
                title: t("landing.stepRouteTitle"),
                body: t("landing.stepRouteBody"),
              },
            ].map(({ icon: Icon, title, body }) => (
              <div key={title} className="space-y-2">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-seal text-seal-foreground">
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <h2 className="font-display text-2xl">{title}</h2>
                <p className="text-sm text-muted-foreground">{body}</p>
              </div>
            ))}
          </div>
        </section>

        {featured.length > 0 && (
          <section className="mx-auto max-w-6xl space-y-6 px-4 pb-16">
            <h2 className="font-display text-4xl">{t("landing.featuredTitle")}</h2>
            <div className="grid gap-4 md:grid-cols-3">
              {featured.map((campaign) => (
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
          </section>
        )}

        <section className="border-t bg-card/70">
          <div className="mx-auto flex max-w-6xl flex-col items-start gap-4 px-4 py-16">
            <h2 className="font-display text-4xl">{t("landing.ctaFinalTitle")}</h2>
            <Button asChild>
              <Link to={createTo}>{t("landing.ctaFinal")}</Link>
            </Button>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
