import { useEffect, type ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/auth/AuthContext";

export function RequireSession({
  admin = false,
  children,
}: {
  admin?: boolean;
  children: ReactNode;
}) {
  const { t } = useTranslation("comum");
  const { user, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      const next = `${location.pathname}${location.search}`;
      navigate(`/login?next=${encodeURIComponent(next)}`, { replace: true });
      return;
    }
    if (admin && !user.is_admin) navigate("/painel", { replace: true });
  }, [admin, loading, location.pathname, location.search, navigate, user]);

  if (loading || !user || (admin && !user.is_admin)) {
    return (
      <main role="status" className="p-8 text-muted-foreground">
        {t("admin.loading")}
      </main>
    );
  }
  return children;
}
