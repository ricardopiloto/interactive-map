import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { adminConsoleApi, type AdminCampaign, type AdminCampaignState } from "@/api/adminConsole";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useApiErrorMessage } from "@/lib/apiError";

export function AdminCampaignsSection() {
  const { t } = useTranslation("comum");
  const explain = useApiErrorMessage();
  const [campaigns, setCampaigns] = useState<AdminCampaign[]>([]);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<AdminCampaignState | "">("");
  const [owners, setOwners] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminCampaign | null>(null);
  const requestId = useRef(0);
  const loadRef = useRef<() => Promise<void>>(async () => undefined);

  const load = useCallback(async () => {
    const id = ++requestId.current;
    setLoading(true);
    setError(null);
    try {
      const response = await adminConsoleApi.campaigns({
        ...(query ? { q: query } : {}),
        ...(filter ? { estado: filter } : {}),
      });
      if (id !== requestId.current) return;
      setCampaigns(response.campanhas);
    } catch (reason) {
      if (id !== requestId.current) return;
      setError(explain(reason));
    } finally {
      if (id === requestId.current) setLoading(false);
    }
  }, [explain, filter, query]);

  useEffect(() => {
    loadRef.current = load;
    void load();
  }, [load]);

  async function run(id: number, action: () => Promise<unknown>) {
    setBusy(id);
    setError(null);
    try {
      await action();
      await loadRef.current();
    } catch (reason) {
      setError(explain(reason));
    } finally {
      setBusy(null);
    }
  }

  return (
    <section aria-labelledby="admin-campaigns-heading" className="space-y-4">
      <h2 id="admin-campaigns-heading" className="font-display text-3xl">
        {t("admin.campaigns.title")}
      </h2>
      <div className="flex flex-wrap gap-3">
        <label className="grid gap-1 text-sm">
          {t("admin.campaigns.search")}
          <Input type="search" value={query} onChange={(event) => setQuery(event.target.value)} />
        </label>
        <label className="grid gap-1 text-sm">
          {t("admin.campaigns.state")}
          <select
            className="h-9 rounded-md border bg-transparent px-3"
            value={filter}
            onChange={(event) => setFilter(event.target.value as AdminCampaignState | "")}
          >
            <option value="">{t("admin.filters.all")}</option>
            <option value="ativa">{t("admin.campaigns.active")}</option>
            <option value="inativa">{t("admin.campaigns.inactive")}</option>
          </select>
        </label>
      </div>
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      {loading ? (
        <p>{t("admin.loading")}</p>
      ) : campaigns.length === 0 ? (
        <p>{t("admin.empty")}</p>
      ) : (
        <div className="overflow-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b">
                <th className="py-2">{t("admin.campaigns.name")}</th>
                <th>{t("admin.campaigns.owner")}</th>
                <th>{t("admin.campaigns.state")}</th>
                <th>{t("admin.campaigns.visibility")}</th>
                <th>{t("admin.campaigns.modified")}</th>
                <th>{t("admin.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map((campaign) => (
                <tr key={campaign.id} className="border-b align-top">
                  <td className="py-3">
                    {campaign.nome}
                    <small className="mt-1 block text-muted-foreground">
                      {campaign.slug} · {campaign.sistema}
                    </small>
                  </td>
                  <td>{campaign.proprietario.email}</td>
                  <td>
                    {campaign.activa ? t("admin.campaigns.active") : t("admin.campaigns.inactive")}
                  </td>
                  <td>
                    {t(`admin.campaigns.visibilityValues.${campaign.visibilidade}`, {
                      defaultValue: campaign.visibilidade,
                    })}
                  </td>
                  <td>
                    {campaign.ultima_alteracao_em
                      ? new Date(campaign.ultima_alteracao_em).toLocaleString()
                      : t("admin.campaigns.dateUnknown")}
                  </td>
                  <td className="space-y-2 py-3">
                    <div className="flex flex-wrap gap-2">
                      <Input
                        type="email"
                        aria-label={t("admin.campaigns.transferEmail", { name: campaign.nome })}
                        placeholder={t("admin.campaigns.newOwner")}
                        value={owners[campaign.id] ?? ""}
                        onChange={(event) =>
                          setOwners((current) => ({
                            ...current,
                            [campaign.id]: event.target.value,
                          }))
                        }
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        type="button"
                        disabled={busy === campaign.id || !(owners[campaign.id] ?? "").trim()}
                        onClick={() => {
                          const nextOwner = (owners[campaign.id] ?? "").trim();
                          if (!nextOwner) return;
                          void run(campaign.id, () =>
                            adminConsoleApi.transferCampaign(campaign.id, nextOwner),
                          );
                        }}
                      >
                        {t("admin.campaigns.transfer")}
                      </Button>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        type="button"
                        disabled={busy === campaign.id}
                        onClick={() =>
                          void run(campaign.id, () =>
                            adminConsoleApi.setCampaignActive(campaign.id, !campaign.activa),
                          )
                        }
                      >
                        {campaign.activa
                          ? t("admin.campaigns.deactivate")
                          : t("admin.campaigns.reactivate")}
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        type="button"
                        disabled={busy === campaign.id}
                        onClick={() => setDeleteTarget(campaign)}
                      >
                        {t("buttons.delete")}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <AlertDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("admin.campaigns.deleteTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("admin.campaigns.deleteConfirm", {
                name: deleteTarget?.nome,
                slug: deleteTarget?.slug,
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("buttons.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                const target = deleteTarget;
                setDeleteTarget(null);
                if (target) void run(target.id, () => adminConsoleApi.deleteCampaign(target.id));
              }}
            >
              {t("admin.campaigns.deletePermanent")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}
