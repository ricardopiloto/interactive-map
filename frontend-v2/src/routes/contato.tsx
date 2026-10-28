import { useEffect, useRef, useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { contatoApi, type ContatoBody } from "@/api/contato";
import { useAuth } from "@/auth/AuthContext";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { Turnstile } from "@/components/site/Turnstile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useApiErrorMessage } from "@/lib/apiError";

const subjects = ["duvida", "privacidade", "problema", "sugestao", "outro"] as const;

export function ContatoPage() {
  const { t, i18n } = useTranslation("comum");
  const { user } = useAuth();
  const explain = useApiErrorMessage();
  const [config, setConfig] = useState<Awaited<ReturnType<typeof contatoApi.config>> | null>(null);
  const [loading, setLoading] = useState(true);
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const emailPrefilled = useRef(false);
  const [assunto, setAssunto] = useState<ContatoBody["assunto"]>("duvida");
  const [mensagem, setMensagem] = useState("");
  const [auxiliary, setAuxiliary] = useState("");
  const [captchaToken, setCaptchaToken] = useState("");
  const [busy, setBusy] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user && !emailPrefilled.current) {
      setEmail(user.email);
      emailPrefilled.current = true;
    }
  }, [user]);
  useEffect(() => {
    let active = true;
    contatoApi
      .config()
      .then((value) => {
        if (active) setConfig(value);
      })
      .catch((reason) => {
        if (active) setError(explain(reason));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [explain]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await contatoApi.send({
        nome,
        email,
        assunto,
        mensagem,
        idioma: i18n.resolvedLanguage === "en" ? "en" : "pt-BR",
        campo_auxiliar: auxiliary,
        ...(config?.turnstile_site_key ? { captcha_token: captchaToken } : {}),
      });
      setNome("");
      setEmail("");
      setAssunto("duvida");
      setMensagem("");
      setAuxiliary("");
      setCaptchaToken("");
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
        <h1 className="font-display text-4xl">{t("contact.title")}</h1>
        {loading ? (
          <p role="status">{t("contact.loading")}</p>
        ) : !config?.disponivel ? (
          <p role="status">{error ?? t("contact.unavailable")}</p>
        ) : success ? (
          <p role="status">{t("contact.success")}</p>
        ) : (
          <form className="space-y-4" onSubmit={submit}>
            <div>
              <Label htmlFor="contact-name">{t("contact.name")}</Label>
              <Input
                id="contact-name"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
                maxLength={100}
              />
            </div>
            <div>
              <Label htmlFor="contact-email">{t("auth.email")}</Label>
              <Input
                id="contact-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="contact-subject">{t("contact.subject")}</Label>
              <select
                id="contact-subject"
                className="w-full rounded-md border bg-background p-2"
                value={assunto}
                onChange={(e) => setAssunto(e.target.value as ContatoBody["assunto"])}
              >
                {subjects.map((value) => (
                  <option key={value} value={value}>
                    {t(`contact.subjects.${value}`)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="contact-message">{t("contact.message")}</Label>
              <textarea
                id="contact-message"
                className="min-h-40 w-full rounded-md border bg-background p-2"
                value={mensagem}
                onChange={(e) => setMensagem(e.target.value)}
                required
                minLength={10}
                maxLength={4000}
                aria-describedby="contact-count"
              />
              <p id="contact-count" aria-live="polite" className="text-sm text-muted-foreground">
                {t("contact.count", { count: mensagem.length })}
              </p>
            </div>
            <div aria-hidden="true" className="absolute -left-[9999px]">
              <Label htmlFor="contact-reference">Reference</Label>
              <Input
                id="contact-reference"
                name="reference_note"
                autoComplete="off"
                tabIndex={-1}
                value={auxiliary}
                onChange={(e) => setAuxiliary(e.target.value)}
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
            <Button type="submit" disabled={busy || (!!config.turnstile_site_key && !captchaToken)}>
              {t("contact.submit")}
            </Button>
          </form>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
