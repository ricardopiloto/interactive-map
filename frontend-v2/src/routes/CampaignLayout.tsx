import { useEffect } from "react";
import {
  Navigate,
  Outlet,
  useLocation,
  useNavigate,
  useOutletContext,
  useParams,
} from "react-router-dom";
import { useCampaignConfig } from "@/api/campaign";
import { useSeo } from "@/lib/seo";
import { ApiError } from "@/api/client";
import { EditModeProvider } from "@/auth/EditModeContext";
import { TopBar } from "@/components/codex/Shell";
import { useTranslation } from "react-i18next";

const NUMERIC_ID = /^\d+$/;

/** Rewrite a campaign URL to `/c/{id}/{slug}/...`, keeping the sub-route and ignoring a stale decorative slug. */
export function canonicalCampaignPath(pathname: string, id: number, slug: string): string {
  const base = `/c/${id}/${slug}`;
  const withId = pathname.match(/^\/c\/(\d+)(?:\/([^/]*))?(\/.*)?$/);
  if (withId && withId[1] === String(id)) return `${base}${withId[3] ?? ""}`;
  const compat = pathname.match(/^\/c\/[^/]+(\/.*)?$/);
  if (compat) return `${base}${compat[1] ?? ""}`;
  return base;
}

function CampaignContent({ identifier }: { identifier: string }) {
  const { t } = useTranslation("comum");
  const navigate = useNavigate();
  const location = useLocation();
  const { data, loading, error } = useCampaignConfig(identifier);
  const section = location.pathname.split("/").filter(Boolean).at(-1) ?? "inicio";
  const canonicalSection = section === "cronologia" ? "linha-do-tempo" : section;
  const knownSections = [
    "mapa",
    "relacoes",
    "sessoes",
    "linha-do-tempo",
    "itens",
    "rota",
    "ferramentas",
    "fios",
  ];
  const pageSection = knownSections.includes(canonicalSection) ? canonicalSection : "inicio";
  const ready = Boolean(data && !loading && !error);
  const name = data?.nome ?? "";
  useSeo({
    title: t(`seo.campanha.${ready ? pageSection : "carregando"}.title`, { nome: name }),
    description: t(`seo.campanha.${ready ? pageSection : "carregando"}.description`, {
      nome: name,
    }),
    canonical:
      ready && pageSection !== "inicio"
        ? `${window.location.origin}/c/${data!.id}/${data!.slug}/${canonicalSection}`
        : undefined,
    robots:
      ready &&
      data?.indexavel &&
      ["mapa", "relacoes", "sessoes", "linha-do-tempo", "itens"].includes(pageSection)
        ? "index, follow"
        : "noindex, nofollow",
  });

  useEffect(() => {
    if (!data?.id || !data.slug) return;
    const nextPath = canonicalCampaignPath(location.pathname, data.id, data.slug);
    const next = `${nextPath}${location.search}${location.hash}`;
    const current = `${location.pathname}${location.search}${location.hash}`;
    if (next !== current) navigate(next, { replace: true });
  }, [data, location.pathname, location.search, location.hash, navigate]);

  if (loading || (!data && !error))
    return (
      <main role="status" className="p-8">
        {t("v2.loadingCampaign")}
      </main>
    );
  if (error)
    return (
      <main role="alert" className="p-8">
        {error instanceof ApiError && error.status === 404
          ? t("v2.campaignNotFound")
          : t("v2.campaignLoadError")}
      </main>
    );
  return (
    <EditModeProvider key={identifier} slug={identifier}>
      <TopBar campaign={data!} />
      <Outlet context={data} />
    </EditModeProvider>
  );
}

export function CampaignLayout() {
  const { id, slug } = useParams();
  const identifier = id && NUMERIC_ID.test(id) ? id : slug;
  if (!identifier) return <Navigate to="/" replace />;
  return <CampaignContent key={identifier} identifier={identifier} />;
}

export function CampaignIndex() {
  const config = useOutletContext<import("@/api/campaign").CampaignConfig>();
  return <Navigate to={config.has_map_image ? "mapa" : "relacoes"} replace />;
}
