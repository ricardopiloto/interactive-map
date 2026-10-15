import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/auth/AuthContext";
import { SiteHeader } from "@/components/site/SiteHeader";
import { Button } from "@/components/ui/button";

export function ContaPage() {
  const { t } = useTranslation("comum");
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function onLogout() {
    navigate("/login", { replace: true });
    await logout();
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto flex max-w-md flex-col gap-4 px-4 py-16">
        <h1 className="font-display text-4xl">{t("auth.accountTitle")}</h1>
        <p className="font-medium">{user?.email}</p>
        <p className="text-muted-foreground">{t("auth.accountHint")}</p>
        <Button type="button" onClick={() => void onLogout()}>
          {t("auth.logout")}
        </Button>
        <p className="text-sm">
          <Link to="/painel" className="underline-offset-4 hover:underline">
            {t("painel.nav")}
          </Link>
          {" · "}
          <Link to="/" className="underline-offset-4 hover:underline">
            {t("home.nav")}
          </Link>
        </p>
      </main>
    </div>
  );
}
