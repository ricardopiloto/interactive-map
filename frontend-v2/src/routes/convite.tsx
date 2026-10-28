import { useState, type FormEvent } from "react";
import { ApiError } from "@/api/client";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { authApi } from "@/api/auth";
import { useAuth } from "@/auth/AuthContext";
import { SiteHeader } from "@/components/site/SiteHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useApiErrorMessage } from "@/lib/apiError";

export function ConvitePage() {
  const { t } = useTranslation("comum");
  const { token = "" } = useParams();
  const navigate = useNavigate();
  const { refresh } = useAuth();
  const explain = useApiErrorMessage();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [expiredType, setExpiredType] = useState<string | null>(null);
  const [registrationOpen, setRegistrationOpen] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await authApi.acceptInvite(token, password);
      await refresh();
      navigate("/painel", { replace: true });
    } catch (reason) {
      setError(explain(reason, t("auth.inviteError")));
      if (reason instanceof ApiError && reason.codigo === "CONVITE_EXPIRADO") {
        const tipo = reason.detalhes?.["tipo"];
        setExpiredType(tipo === "verificar" || tipo === "activar" ? tipo : null);
        if (tipo === "verificar") {
          void authApi
            .registerConfig()
            .then((config) => setRegistrationOpen(config.modo === "aberto"))
            .catch(() => setRegistrationOpen(false));
        }
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto flex max-w-md flex-col gap-4 px-4 py-16">
        <h1 className="font-display text-4xl">{t("auth.inviteTitle")}</h1>
        <p className="text-muted-foreground">{t("auth.inviteHint")}</p>
        <form className="space-y-4" onSubmit={onSubmit}>
          <div className="space-y-1.5">
            <Label htmlFor="invite-password">{t("form.senha")}</Label>
            <Input
              id="invite-password"
              type="password"
              autoComplete="new-password"
              minLength={8}
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>
          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}
          {expiredType === "activar" && <p className="text-sm">{t("register.expiredAdmin")}</p>}
          {expiredType === "verificar" && registrationOpen && (
            <p className="text-sm">
              {t("register.expiredSelf")}{" "}
              <Link to="/registo" className="underline">
                {t("register.newLink")}
              </Link>
            </p>
          )}
          <Button type="submit" disabled={busy} className="w-full">
            {t("auth.activate")}
          </Button>
        </form>
        <Link to="/login" className="text-sm underline-offset-4 hover:underline">
          {t("v2.login")}
        </Link>
      </main>
    </div>
  );
}
