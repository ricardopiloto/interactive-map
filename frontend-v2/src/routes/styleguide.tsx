import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useTranslation } from "react-i18next";

const palette = [
  "background",
  "foreground",
  "card",
  "primary",
  "secondary",
  "muted",
  "accent",
  "destructive",
  "border",
  "seal",
  "verdigris",
  "ochre",
  "ink",
  "edit",
] as const;

export function StyleGuide() {
  const { t } = useTranslation("comum");
  return (
    <main className="mx-auto max-w-5xl space-y-10 px-4 pt-28 pb-24">
      <header>
        <p className="eyebrow">{t("v2.styleguide.dev")}</p>
        <h1 className="font-display text-5xl">Paper &amp; Parchment</h1>
        <p className="mt-3 text-muted-foreground">{t("v2.styleguide.intro")}</p>
      </header>

      <section>
        <h2 className="font-display text-3xl">{t("v2.styleguide.palette")}</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {t("v2.styleguide.paletteDescription")}
        </p>
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {palette.map((name) => (
            <div key={name} className="overflow-hidden rounded-xl border border-border bg-card">
              <div className="h-16" style={{ background: `var(--${name})` }} />
              <div className="p-3 font-mono text-xs">
                --{name}
                <br />
                {getComputedStyle(document.documentElement).getPropertyValue(`--${name}`).trim()}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-3xl">{t("v2.styleguide.typography")}</h2>
        <p className="font-display text-3xl">{t("v2.styleguide.displayFont")}</p>
        <p className="font-sans text-lg">{t("v2.styleguide.bodyFont")}</p>
        <p className="font-mono text-sm">{t("v2.styleguide.monoFont")}</p>
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-3xl">shadcn/ui</h2>
        <p className="text-sm text-muted-foreground">{t("v2.styleguide.components")}</p>
        <Card>
          <CardHeader>
            <CardTitle>{t("v2.styleguide.formExample")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              aria-label={t("v2.styleguide.campaignName")}
              placeholder={t("v2.styleguide.campaignName")}
            />
            <div className="flex items-center gap-3">
              <Button>{t("v2.styleguide.save")}</Button>
              <Badge variant="secondary">{t("v2.styleguide.draft")}</Badge>
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
