import { useEffect, useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { authApi } from "@/api/auth";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { Turnstile } from "@/components/site/Turnstile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useApiErrorMessage } from "@/lib/apiError";

export function EsqueciSenhaPage() {
  const { t, i18n } = useTranslation("comum");
  const explain = useApiErrorMessage();
  const [config, setConfig] = useState<{
    disponivel: boolean;
    turnstile_site_key: string | null;
  } | null>(null);
  const [email, setEmail] = useState("");
  const [auxiliary, setAuxiliary] = useState("");
  const [captchaToken, setCaptchaToken] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    let active = true;
    authApi.resetConfig().then(
      (value) => {
        if (active) setConfig(value);
      },
      (reason) => {
        if (active) setError(explain(reason));
      },
    );
    return () => {
      active = false;
    };
  }, [explain]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await authApi.requestReset(
        email,
        i18n.resolvedLanguage === "en" ? "en" : "pt-BR",
        config?.turnstile_site_key ? captchaToken : undefined,
        auxiliary,
      );
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
        <h1 className="font-display text-4xl">{t("passwordRecovery.title")}</h1>
        {success ? (
          <>
            <p role="status">{t("passwordRecovery.success")}</p>
            <p>{t("passwordRecovery.spam")}</p>
          </>
        ) : !config ? (
          <p role={error ? "alert" : "status"}>{error ?? t("passwordRecovery.loading")}</p>
        ) : !config.disponivel ? (
          <>
            <p>{t("passwordRecovery.unavailable")}</p>
            <Link to="/contato" className="text-sm underline">
              {t("footer.contact")}
            </Link>
          </>
        ) : (
          <form className="space-y-4" onSubmit={submit}>
            <div className="space-y-1.5">
              <Label htmlFor="recovery-email">{t("auth.email")}</Label>
              <Input
                id="recovery-email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>
            <div aria-hidden="true" className="absolute -left-[9999px]">
              <Label htmlFor="recovery-reference">Reference</Label>
              <Input
                id="recovery-reference"
                name="reference_note"
                autoComplete="off"
                tabIndex={-1}
                value={auxiliary}
                onChange={(event) => setAuxiliary(event.target.value)}
              />
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
              disabled={busy || (!!config.turnstile_site_key && !captchaToken)}
              className="w-full"
            >
              {t("passwordRecovery.submit")}
            </Button>
          </form>
        )}
        <Link to="/login" className="text-sm underline">
          {t("v2.login")}
        </Link>
      </main>
      <SiteFooter />
    </div>
  );
}
