import { Link, useLocation } from "react-router-dom";
import {
  Map as MapIcon,
  Network,
  Route as RouteIcon,
  ScrollText,
  Hourglass,
  Dices,
  GitBranch,
  PenLine,
  Sun,
  Moon,
  MonitorSmartphone,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useCodex, type ThemePref } from "./codex-context";
import { useEditMode } from "@/auth/EditModeContext";
import { useAuth } from "@/auth/AuthContext";
import type { CampaignConfig } from "@/api/campaign";
import { campaignHref } from "@/lib/navigation";
import { useTranslation } from "react-i18next";
import { LanguageSelector } from "./LanguageSelector";

// GM-only lens: gated on `canEdit` (real GM permission), never on the `enabled` edit toggle.
const fiosLens = { path: "fios", label: "Fios", icon: GitBranch } as const;
const gmLens = { path: "ferramentas", label: "Ferramentas", icon: Dices } as const;

const lenses = [
  { path: "mapa", label: "Mapa", icon: MapIcon },
  { path: "relacoes", label: "Relações", icon: Network },
  { path: "rota", label: "Rota", icon: RouteIcon },
  { path: "sessoes", label: "Sessões", icon: ScrollText },
  { path: "linha-do-tempo", label: "Cronologia", icon: Hourglass },
] as const;

export function TopBar({ campaign }: { campaign: CampaignConfig }) {
  const { t } = useTranslation("comum");
  const location = useLocation();
  const { theme, setTheme } = useCodex();
  const { user, logout } = useAuth();
  const { canEdit, isDono, enabled, setEnabled } = useEditMode();
  const base = campaignHref(campaign.id, campaign.slug);
  const themes: { value: ThemePref; icon: typeof Sun; label: string }[] = [
    { value: "claro", icon: Sun, label: t("v2.themeLight") },
    { value: "escuro", icon: Moon, label: t("v2.themeDark") },
    { value: "auto", icon: MonitorSmartphone, label: t("v2.themeAuto") },
  ];

  const nav = (mobile: boolean) =>
    [...lenses, ...(canEdit ? [gmLens] : []), ...(isDono && enabled ? [fiosLens] : [])].map(
      ({ path, icon: Icon }) => {
        const to = `${base}/${path}`;
        const active = location.pathname === to;
        const labels = {
          mapa: "map",
          relacoes: "relations",
          rota: "route",
          sessoes: "sessions",
          "linha-do-tempo": "timeline",
          ferramentas: "tools",
          fios: "threads",
        } as const;
        return (
          <Link
            key={path}
            to={to}
            aria-current={active ? "page" : undefined}
            aria-label={!mobile ? t(`v2.${labels[path]}`) : undefined}
            title={!mobile ? t(`v2.${labels[path]}`) : undefined}
            className={cn(
              mobile
                ? "flex min-h-11 min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-full text-[10px] font-medium"
                : "flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium transition-colors xl:px-3.5",
              active
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-foreground",
            )}
          >
            <Icon className="h-4 w-4" aria-hidden />
            <span className={mobile ? "max-w-full truncate px-0.5" : "hidden xl:inline"}>
              {t(`v2.${labels[path]}`)}
            </span>
          </Link>
        );
      },
    );

  return (
    <>
      <header className="pointer-events-none fixed inset-x-0 top-0 z-40 flex items-start justify-between gap-3 p-3 md:p-4">
        <Link
          to="/explorar"
          className="glass pointer-events-auto flex items-center gap-3 rounded-full py-1.5 pr-4 pl-1.5 transition-colors hover:bg-accent"
          aria-label={t("explorar.nav")}
        >
          <span
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-seal font-display text-lg italic text-seal-foreground shadow-float"
            aria-hidden
          >
            {campaign.nome.charAt(0)}
          </span>
          <div className="leading-tight">
            <p className="font-display text-[15px] font-medium">{campaign.nome}</p>
            <p className="eyebrow !text-[0.6rem]">{campaign.sistema}</p>
          </div>
        </Link>
        <nav
          aria-label={t("v2.nav")}
          className="glass pointer-events-auto absolute left-1/2 hidden -translate-x-1/2 items-center gap-0.5 rounded-full p-1 lg:flex"
        >
          {nav(false)}
        </nav>
        <div className="pointer-events-auto flex items-center gap-2">
          <LanguageSelector />
          <div
            className="glass hidden items-center rounded-full p-1 md:flex"
            role="radiogroup"
            aria-label={t("v2.theme")}
          >
            {themes.map(({ value, icon: Icon, label }) => (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={theme === value}
                aria-label={label}
                onClick={() => setTheme(value)}
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-full transition-colors",
                  theme === value
                    ? "bg-accent text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Icon className="h-4 w-4" />
              </button>
            ))}
          </div>
          {canEdit && (
            <button
              type="button"
              onClick={() => setEnabled(!enabled)}
              aria-pressed={enabled}
              className={cn(
                "flex h-11 items-center gap-2 rounded-full px-3 text-sm font-medium shadow-float transition-colors md:px-4",
                enabled
                  ? "bg-edit text-primary"
                  : "glass text-muted-foreground hover:text-foreground",
              )}
            >
              <PenLine className="h-4 w-4" />
              <span className="hidden md:inline">
                {enabled ? t("v2.viewMode") : t("v2.gmMode")}
              </span>
            </button>
          )}
          {user ? (
            <button
              type="button"
              onClick={() => void logout()}
              className="glass rounded-full px-3 py-2 text-sm"
            >
              {t("v2.logout")}
            </button>
          ) : (
            <Link
              to="/login"
              state={{ background: location }}
              className="glass rounded-full px-3 py-2 text-sm"
            >
              {t("v2.login")}
            </Link>
          )}
        </div>
      </header>
      <nav
        aria-label={t("v2.nav")}
        className="glass fixed inset-x-3 bottom-3 z-40 flex justify-between rounded-full p-1 lg:hidden"
      >
        {nav(true)}
      </nav>
      {enabled && (
        <div
          className="pointer-events-none fixed inset-0 z-30 border-[3px] border-edit"
          aria-hidden
        >
          <span className="absolute bottom-20 left-1/2 -translate-x-1/2 rounded-full bg-edit px-3 py-1 font-mono text-[10px] tracking-widest text-primary uppercase lg:bottom-4">
            {t("v2.editLayer")}
          </span>
        </div>
      )}
    </>
  );
}
