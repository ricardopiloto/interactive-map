import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export function SiteFooter() {
  const { t } = useTranslation("comum");
  return (
    <footer
      className="border-t border-border bg-background text-muted-foreground"
      data-testid="site-footer"
    >
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-8 gap-y-3 px-4 py-5 text-sm">
        <span>
          {t("brand")} v{__APP_VERSION__}
        </span>
        <nav aria-label={t("footer.aria")} className="flex flex-wrap gap-x-5 gap-y-2">
          <Link className="hover:text-foreground hover:underline" to="/termos">
            {t("footer.terms")}
          </Link>
          <Link className="hover:text-foreground hover:underline" to="/privacidade">
            {t("footer.privacy")}
          </Link>
          <Link className="hover:text-foreground hover:underline" to="/contato">
            {t("footer.contact")}
          </Link>
        </nav>
      </div>
    </footer>
  );
}
