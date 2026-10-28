import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { SiteHeader } from "@/components/site/SiteHeader";

export function LegalPage({ kind }: { kind: "terms" | "privacy" }) {
  const { t } = useTranslation("comum");
  const sections = t(`legal.${kind}.sections`, { returnObjects: true }) as {
    title: string;
    body: string;
  }[];
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-3xl space-y-6 px-4 py-12">
        <h1 className="font-display text-4xl">{t(`legal.${kind}.title`)}</h1>
        {sections.map((section) => (
          <section key={section.title} className="space-y-2">
            <h2 className="font-display text-2xl">{section.title}</h2>
            <p className="text-muted-foreground">{section.body}</p>
          </section>
        ))}
        <Link to="/registo" className="underline">
          {t("register.title")}
        </Link>
      </main>
    </div>
  );
}
