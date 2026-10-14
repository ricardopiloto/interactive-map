import { Navigate, Outlet, useOutletContext, useParams } from "react-router-dom";
import { useCampaignConfig } from "@/api/campaign";
import { ApiError } from "@/api/client";
import { EditModeProvider } from "@/auth/EditModeContext";
import { TopBar } from "@/components/codex/Shell";
import { useTranslation } from "react-i18next";

function CampaignContent({ slug }: { slug: string }) {
  const { t } = useTranslation("comum");
  const { data, loading, error } = useCampaignConfig(slug);
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
    <EditModeProvider key={slug} slug={slug}>
      <TopBar campaign={data!} />
      <Outlet context={data} />
    </EditModeProvider>
  );
}

export function CampaignLayout() {
  const { slug } = useParams();
  if (!slug) return <Navigate to="/" replace />;
  return <CampaignContent key={slug} slug={slug} />;
}

export function CampaignIndex() {
  const config = useOutletContext<import("@/api/campaign").CampaignConfig>();
  return <Navigate to={config.has_map_image ? "mapa" : "relacoes"} replace />;
}
