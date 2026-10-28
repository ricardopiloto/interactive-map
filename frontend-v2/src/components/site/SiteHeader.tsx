import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/auth/AuthContext";
import { LanguageSelector } from "@/components/codex/LanguageSelector";
import { cn } from "@/lib/utils";

const links = [
  { to: "/", key: "home.nav" },
  { to: "/explorar", key: "explorar.nav" },
] as const;

export function SiteHeader() {
  const { t } = useTranslation("comum");
  const { user } = useAuth();
  const location = useLocation();
  const item = (to: string, label: string) => (
    <Link
      to={to}
      aria-current={location.pathname === to ? "page" : undefined}
      className={cn(
        "rounded-full px-3 py-2 text-sm",
        location.pathname === to ? "bg-primary text-primary-foreground" : "hover:bg-accent",
      )}
    >
      {label}
    </Link>
  );

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <Link to="/" className="font-display text-2xl">
          {t("brand")}
        </Link>
        <nav aria-label={t("nav.mainAria")} className="flex flex-wrap items-center gap-1">
          {links.map((link) => item(link.to, t(link.key)))}
          {user && item("/painel", t("painel.nav"))}
          {user && item("/conta", t("auth.accountTitle"))}
          {user?.is_admin && item("/admin", t("admin.navLabel"))}
          {user?.is_admin && item("/admin/convites", t("adminConvites.navLabel"))}
        </nav>
        <div className="flex items-center gap-2">
          <LanguageSelector />
          {!user && item("/registo", t("register.title"))}
          {user ? null : (
            <Link
              to="/login"
              className="rounded-full bg-seal px-3 py-2 text-sm text-seal-foreground"
            >
              {t("v2.login")}
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
