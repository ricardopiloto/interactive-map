import { SiteFooter } from "@/components/site/SiteFooter";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { SiteHeader } from "@/components/site/SiteHeader";
import { Button } from "@/components/ui/button";

export function NotFoundPage() {
  const { t } = useTranslation("comum");

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto flex max-w-md flex-col gap-4 px-4 py-16 text-center">
        <h1 className="font-display text-4xl">{t("v2.notFoundTitle")}</h1>
        <p className="text-muted-foreground">{t("v2.notFoundBody")}</p>
        <Button asChild>
          <Link to="/">{t("home.nav")}</Link>
        </Button>
      </main>
      <SiteFooter />
    </div>
  );
}
