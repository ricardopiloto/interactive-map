import { SiteFooter } from "@/components/site/SiteFooter";
import { useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { authApi } from "@/api/auth";
import { SiteHeader } from "@/components/site/SiteHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useApiErrorMessage } from "@/lib/apiError";

export function ResetPage() {
  const { t } = useTranslation("comum");
  const { token = "" } = useParams();
  const navigate = useNavigate();
  const explain = useApiErrorMessage();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await authApi.confirmReset(token, password);
      navigate("/login", { replace: true });
    } catch (reason) {
      setError(explain(reason, t("auth.resetError")));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto flex max-w-md flex-col gap-4 px-4 py-16">
        <h1 className="font-display text-4xl">{t("auth.resetTitle")}</h1>
        <p className="text-muted-foreground">{t("auth.resetHint")}</p>
        <form className="space-y-4" onSubmit={onSubmit}>
          <div className="space-y-1.5">
            <Label htmlFor="reset-password">{t("form.senha")}</Label>
            <Input
              id="reset-password"
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
          <Button type="submit" disabled={busy} className="w-full">
            {t("auth.resetSubmit")}
          </Button>
        </form>
      </main>
      <SiteFooter />
    </div>
  );
}
