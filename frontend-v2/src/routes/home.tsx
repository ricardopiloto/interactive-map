import { SiteFooter } from "@/components/site/SiteFooter";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Check, Lock, Map as MapIcon, Route as RouteIcon, Users } from "lucide-react";
import { campanhasApi, type CatalogoItem } from "@/api/campanhas";
import { useAuth } from "@/auth/AuthContext";
import { CampaignCard } from "@/components/site/CampaignCard";
import { SiteHeader } from "@/components/site/SiteHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { campaignHref } from "@/lib/navigation";
import heroShot from "@/assets/hero-mapa.webp";

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
          <div className="overflow-hidden rounded-2xl border bg-card shadow-float">
            <div className="flex gap-1.5 border-b px-4 py-3" aria-hidden>
              <span className="h-2.5 w-2.5 rounded-full bg-seal" />
              <span className="h-2.5 w-2.5 rounded-full bg-ochre" />
              <span className="h-2.5 w-2.5 rounded-full bg-verdigris" />
            </div>
            <img
              src={heroShot}
              alt={t("landing.heroShotAlt")}
              width={1200}
              height={675}
              loading="eager"
              decoding="async"
              className="block h-auto w-full"
            />
          </div>
        </section>

        <section className="border-y bg-card/60">
          <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 md:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: MapIcon, title: t("landing.stepMapTitle"), body: t("landing.stepMapBody") },
              { icon: Users, title: t("landing.stepRelTitle"), body: t("landing.stepRelBody") },
              {
                icon: RouteIcon,
                title: t("landing.stepRouteTitle"),
                body: t("landing.stepRouteBody"),
              },
              {
                icon: Lock,
                title: t("landing.stepMasterTitle"),
                body: t("landing.stepMasterBody"),
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

        <section className="border-t bg-card/60">
          <div className="mx-auto max-w-6xl space-y-6 px-4 py-16">
            <h2 className="font-display text-4xl">{t("landing.openSourceTitle")}</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <Card className="space-y-4 rounded-2xl p-6">
                <h3 className="font-display text-2xl">{t("landing.openSourceSelfHostTitle")}</h3>
                <p className="text-sm text-muted-foreground">
                  {t("landing.openSourceSelfHostBody")}
                </p>
                <Button variant="outline" asChild>
                  <a
                    href="https://github.com/ricardopiloto/interactive-map"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {t("landing.openSourceSelfHostCta")}
                  </a>
                </Button>
              </Card>
              <Card className="space-y-4 rounded-2xl p-6">
                <h3 className="font-display text-2xl">{t("landing.openSourceHostedTitle")}</h3>
                <p className="text-sm text-muted-foreground">{t("landing.openSourceHostedBody")}</p>
                <Button asChild>
                  <Link to={masterTo}>{t("landing.openSourceHostedCta")}</Link>
                </Button>
              </Card>
            </div>
          </div>
        </section>

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
