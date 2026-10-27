import { useTranslation } from "react-i18next";
import { useCampaignKey } from "@/api/campaign";
import { useEditMode } from "@/auth/EditModeContext";
import { FiosList } from "@/components/codex/FiosList";

export function Fios() {
  const slug = useCampaignKey();
  const { t } = useTranslation("sessoes");
  const { ready, isDono, enabled } = useEditMode();
  return (
    <main className="mx-auto min-h-screen max-w-5xl px-4 pt-24 pb-28 lg:pb-16">
      {!ready ? (
        <p role="status">{t("fiosPage.loading")}</p>
      ) : !isDono ? (
        <p role="alert">{t("fiosPage.gmOnly")}</p>
      ) : !enabled ? (
        <p role="status">{t("fiosPage.gmModeRequired")}</p>
      ) : (
        <>
          <h1 className="font-display text-3xl font-medium">{t("fiosPage.title")}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{t("fiosPage.intro")}</p>
          <FiosList slug={slug} />
        </>
      )}
    </main>
  );
}
