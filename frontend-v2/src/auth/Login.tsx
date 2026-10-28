import { useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useTranslation } from "react-i18next";
import { ApiError } from "@/api/client";
import { safeInternalPath } from "@/lib/safePath";

export function LoginForm({ onSuccess }: { onSuccess?: () => void }) {
  const { t } = useTranslation("comum");
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  async function submit(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    setError("");
    try {
      await login(email, password);
      onSuccess?.();
    } catch (reason) {
      setError(
        reason instanceof ApiError && reason.codigo
          ? t(`errors.${reason.codigo}`, { defaultValue: t("v2.loginError") })
          : t("v2.loginError"),
      );
    } finally {
      setPending(false);
    }
  }
  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="login-email">{t("v2.email")}</Label>
        <Input
          id="login-email"
          type="email"
          autoComplete="username"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="login-password">{t("v2.password")}</Label>
        <Input
          id="login-password"
          type="password"
          autoComplete="current-password"
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
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? t("v2.loggingIn") : t("v2.login")}
      </Button>
    </form>
  );
}

export function LoginPage() {
  const { t } = useTranslation("comum");
  const navigate = useNavigate();
  const location = useLocation();
  const [params] = useSearchParams();
  const background = (
    location.state as { background?: { pathname: string; search?: string } } | null
  )?.background;
  const returnTo = background
    ? `${background.pathname}${background.search ?? ""}`
    : (safeInternalPath(params.get("next")) ?? "/");
  if (background)
    return (
      <Dialog
        open
        onOpenChange={(open) => {
          if (!open) navigate(-1);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("v2.login")}</DialogTitle>
            <DialogDescription>{t("v2.loginCampaignDescription")}</DialogDescription>
          </DialogHeader>
          <LoginForm onSuccess={() => navigate(returnTo, { replace: true })} />
        </DialogContent>
      </Dialog>
    );
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center p-6">
      <Link to="/" className="mb-8 font-display text-2xl">
        {t("v2.codex")}
      </Link>
      <h1 className="mb-2 font-display text-3xl">{t("v2.login")}</h1>
      <p className="mb-6 text-muted-foreground">{t("v2.loginDescription")}</p>
      <LoginForm onSuccess={() => navigate(returnTo, { replace: true })} />
      <Link to="/registo" className="mt-4 text-sm underline">
        {t("register.title")}
      </Link>
    </main>
  );
}
