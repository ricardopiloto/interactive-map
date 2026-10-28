import { useEffect, useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { adminConsoleApi } from "@/api/adminConsole";
import { SiteHeader } from "@/components/site/SiteHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useApiErrorMessage } from "@/lib/apiError";

export function AdminConvitesPage() {
  const { t } = useTranslation("comum");
  const explain = useApiErrorMessage();
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<{ email: string; link: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [emailAvailable, setEmailAvailable] = useState(false);
  const [sendEmail, setSendEmail] = useState(false);

  useEffect(() => {
    let mounted = true;
    void adminConsoleApi
      .inviteConfig()
      .then((config) => {
        if (mounted) setEmailAvailable(config.envio_email_disponivel);
      })
      .catch(() => {
        if (mounted) setEmailAvailable(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      setCreated(await adminConsoleApi.invite(email.trim(), emailAvailable && sendEmail));
      setCopied(false);
    } catch (reason) {
      setError(explain(reason));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto flex max-w-lg flex-col gap-4 px-4 py-16">
        <h1 className="font-display text-4xl">{t("adminConvites.title")}</h1>
        <p className="text-muted-foreground">{t("adminConvites.hint")}</p>
        {created ? (
          <>
            <Label htmlFor="admin-convite-link">{t("adminConvites.linkLabel")}</Label>
            <Input
              id="admin-convite-link"
              readOnly
              value={created.link}
              onFocus={(event) => event.currentTarget.select()}
            />
            <p className="text-sm text-muted-foreground">{t("adminConvites.linkHint")}</p>
            <Button
              type="button"
              onClick={() =>
                void navigator.clipboard.writeText(created.link).then(() => setCopied(true))
              }
            >
              {copied ? t("adminConvites.copied") : t("adminConvites.copy")}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setCreated(null);
                setEmail("");
                setCopied(false);
              }}
            >
              {t("adminConvites.another")}
            </Button>
          </>
        ) : (
          <form className="space-y-4" onSubmit={submit}>
            <div className="space-y-1.5">
              <Label htmlFor="admin-convite-email">{t("adminConvites.emailLabel")}</Label>
              <Input
                id="admin-convite-email"
                type="email"
                autoComplete="off"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>
            {emailAvailable && (
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={sendEmail}
                  onChange={(event) => setSendEmail(event.target.checked)}
                />
                {t("adminConvites.sendEmail")}
              </label>
            )}
            {error && (
              <p role="alert" className="text-sm text-destructive">
                {error}
              </p>
            )}
            <Button type="submit" disabled={busy}>
              {t("adminConvites.submit")}
            </Button>
          </form>
        )}
      </main>
    </div>
  );
}
