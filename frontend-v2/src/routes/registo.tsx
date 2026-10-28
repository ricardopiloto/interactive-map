import { SiteFooter } from "@/components/site/SiteFooter";
import { useEffect, useState, type FormEvent } from "react";
import { Link, Navigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { authApi } from "@/api/auth";
import { useAuth } from "@/auth/AuthContext";
import { Turnstile } from "@/components/site/Turnstile";
import { SiteHeader } from "@/components/site/SiteHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useApiErrorMessage } from "@/lib/apiError";

export function RegistoPage() {
  const { t, i18n } = useTranslation("comum");
  const { user, loading } = useAuth();
  const explain = useApiErrorMessage();
  const [config, setConfig] = useState<{ modo: string; turnstile_site_key: string | null } | null>(
    null,
  );
  const [email, setEmail] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [auxiliary, setAuxiliary] = useState("");
  const [captchaToken, setCaptchaToken] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [success, setSuccess] = useState(false);
  useEffect(() => {
    if (user) return;
    let active = true;
    authApi
      .registerConfig()
      .then((value) => {
        if (active) setConfig(value);
      })
      .catch((reason) => {
        if (active) setError(explain(reason));
      });
    return () => {
      active = false;
    };
  }, [user, explain]);
  if (loading) return null;
  if (user) return <Navigate to="/painel" replace />;
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!accepted) {
      setError(t("errors.TERMOS_NAO_ACEITOS"));
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await authApi.register({
        email,
        termos_aceitos: accepted,
        idioma: i18n.resolvedLanguage === "en" ? "en" : "pt-BR",
        campo_auxiliar: auxiliary,
        ...(config?.turnstile_site_key ? { captcha_token: captchaToken } : {}),
      });
      setSuccess(true);
    } catch (reason) {
      setError(explain(reason));
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto flex max-w-md flex-col gap-4 px-4 py-16">
        <h1 className="font-display text-4xl">{t("register.title")}</h1>
        {success ? (
          <>
            <p role="status">{t("register.success")}</p>
            <p>{t("register.spam")}</p>
          </>
        ) : config?.modo !== "aberto" ? (
          <p>{config ? t("register.closed") : (error ?? t("register.loading"))}</p>
        ) : (
          <form className="space-y-4" onSubmit={submit}>
            <div className="space-y-1.5">
              <Label htmlFor="register-email">{t("auth.email")}</Label>
              <Input
                id="register-email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>
            <div aria-hidden="true" className="absolute -left-[9999px]">
              <Label htmlFor="register-reference">Reference</Label>
              <Input
                id="register-reference"
                name="reference_note"
                autoComplete="off"
                tabIndex={-1}
                value={auxiliary}
                onChange={(event) => setAuxiliary(event.target.value)}
              />
            </div>
            <div className="flex items-start gap-2">
              <input
                id="register-accept"
                type="checkbox"
                checked={accepted}
                onChange={(event) => setAccepted(event.target.checked)}
              />
              <Label htmlFor="register-accept">
                {t("register.accept")}{" "}
                <Link to="/termos" target="_blank" rel="noopener" className="underline">
                  {t("register.terms")}
                </Link>{" "}
                {t("register.and")}{" "}
                <Link to="/privacidade" target="_blank" rel="noopener" className="underline">
                  {t("register.privacy")}
                </Link>
              </Label>
            </div>
            {config.turnstile_site_key && (
              <Turnstile siteKey={config.turnstile_site_key} onToken={setCaptchaToken} />
            )}
            {error && (
              <p role="alert" className="text-sm text-destructive">
                {error}
              </p>
            )}
            <Button
              type="submit"
              disabled={busy || !accepted || (!!config.turnstile_site_key && !captchaToken)}
              className="w-full"
            >
              {t("register.submit")}
            </Button>
          </form>
        )}
        <Link to="/contato" className="text-sm underline">
          {t("footer.contact")}
        </Link>
        <Link to="/login" className="text-sm underline">
          {t("v2.login")}
        </Link>
      </main>
      <SiteFooter />
    </div>
  );
}
