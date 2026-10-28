import { SiteFooter } from "@/components/site/SiteFooter";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { AdminCampaignsSection } from "@/components/admin/AdminCampaignsSection";
import { AdminUsersSection } from "@/components/admin/AdminUsersSection";
import { SiteHeader } from "@/components/site/SiteHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function AdminConsolePage() {
  const { t } = useTranslation("comum");
  const [tab, setTab] = useState("users");
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-6xl space-y-6 px-4 py-10">
        <h1 className="font-display text-5xl">{t("admin.title")}</h1>
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList aria-label={t("admin.tabs")}>
            <TabsTrigger value="users">{t("admin.users.title")}</TabsTrigger>
            <TabsTrigger value="campaigns">{t("admin.campaigns.title")}</TabsTrigger>
          </TabsList>
          <TabsContent value="users" className="mt-6">
            <AdminUsersSection />
          </TabsContent>
          <TabsContent value="campaigns" className="mt-6">
            <AdminCampaignsSection />
          </TabsContent>
        </Tabs>
      </main>
      <SiteFooter />
    </div>
  );
}
