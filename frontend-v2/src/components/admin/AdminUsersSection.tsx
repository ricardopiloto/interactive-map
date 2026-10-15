import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { adminConsoleApi, type AdminUser, type AdminUserState } from "@/api/adminConsole";
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

export function AdminUsersSection() {
  const { t } = useTranslation("comum");
  const explain = useApiErrorMessage();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [email, setEmail] = useState("");
  const [stateFilter, setStateFilter] = useState<AdminUserState | "">("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [link, setLink] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null);
  const requestId = useRef(0);
  const loadRef = useRef<() => Promise<void>>(async () => undefined);

  const load = useCallback(async () => {
    const id = ++requestId.current;
    setLoading(true);
    setError(null);
    try {
      const response = await adminConsoleApi.users({
        ...(email ? { email } : {}),
        ...(stateFilter ? { estado: stateFilter } : {}),
      });
      if (id !== requestId.current) return;
      setUsers(response.usuarios);
    } catch (reason) {
      if (id !== requestId.current) return;
      setError(explain(reason));
    } finally {
      if (id === requestId.current) setLoading(false);
    }
  }, [email, explain, stateFilter]);

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

  async function invite() {
    setError(null);
    try {
      const result = await adminConsoleApi.invite(inviteEmail.trim());
      setLink(result.link);
      setInviteEmail("");
      await loadRef.current();
    } catch (reason) {
      setError(explain(reason));
    }
  }

  return (
    <section aria-labelledby="admin-users-heading" className="space-y-4">
      <h2 id="admin-users-heading" className="font-display text-3xl">
        {t("admin.users.title")}
      </h2>
      <div className="flex flex-wrap gap-3">
        <label className="grid gap-1 text-sm">
          {t("admin.users.search")}
          <Input type="search" value={email} onChange={(event) => setEmail(event.target.value)} />
        </label>
        <label className="grid gap-1 text-sm">
          {t("admin.users.state")}
          <select
            className="h-9 rounded-md border bg-transparent px-3"
            value={stateFilter}
            onChange={(event) => setStateFilter(event.target.value as AdminUserState | "")}
          >
            <option value="">{t("admin.filters.all")}</option>
            <option value="ativa">{t("admin.users.active")}</option>
            <option value="pendente">{t("admin.users.pending")}</option>
            <option value="inativa">{t("admin.users.inactive")}</option>
          </select>
        </label>
      </div>
      <form
        className="flex flex-wrap items-end gap-3"
        onSubmit={(event) => {
          event.preventDefault();
          void invite();
        }}
      >
        <label className="grid gap-1 text-sm">
          {t("admin.users.inviteEmail")}
          <Input
            type="email"
            required
            value={inviteEmail}
            onChange={(event) => setInviteEmail(event.target.value)}
          />
        </label>
        <Button type="submit">{t("admin.users.invite")}</Button>
      </form>
      {link && (
        <div role="status" className="flex flex-wrap items-center gap-2">
          <Input readOnly value={link} aria-label={t("admin.users.generatedLink")} />
          <Button
            type="button"
            variant="outline"
            onClick={() => void navigator.clipboard.writeText(link)}
          >
            {t("admin.users.copy")}
          </Button>
          <Button type="button" variant="ghost" onClick={() => setLink(null)}>
            {t("buttons.close")}
          </Button>
        </div>
      )}
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      {loading ? (
        <p>{t("admin.loading")}</p>
      ) : users.length === 0 ? (
        <p>{t("admin.empty")}</p>
      ) : (
        <div className="overflow-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b">
                <th className="py-2">{t("admin.users.email")}</th>
                <th>{t("admin.users.state")}</th>
                <th>{t("admin.users.admin")}</th>
                <th>{t("admin.users.created")}</th>
                <th>{t("admin.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => {
                const blocked =
                  user.mesas_proprietarias.length > 0 || (user.is_admin && user.estado === "ativa");
                return (
                  <tr key={user.id} className="border-b align-top">
                    <td className="py-3">
                      {user.email}
                      {user.mesas_proprietarias.length > 0 && (
                        <small className="mt-1 block text-muted-foreground">
                          {user.mesas_proprietarias.map((campaign) => campaign.nome).join(", ")}
                        </small>
                      )}
                    </td>
                    <td>{t(`admin.users.${user.estado}`)}</td>
                    <td>{user.is_admin ? t("admin.users.yes") : t("admin.users.no")}</td>
                    <td>{new Date(user.criado_em).toLocaleString()}</td>
                    <td className="space-x-2 py-3">
                      <Button
                        size="sm"
                        variant="outline"
                        type="button"
                        disabled={busy === user.id || user.estado !== "ativa"}
                        onClick={() =>
                          void run(user.id, async () => {
                            const result = await adminConsoleApi.reset(user.id);
                            setLink(result.link);
                          })
                        }
                      >
                        {t("admin.users.reset")}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        type="button"
                        disabled={busy === user.id || user.estado === "pendente" || blocked}
                        onClick={() =>
                          void run(user.id, () =>
                            adminConsoleApi.setUserActive(user.id, user.estado !== "ativa"),
                          )
                        }
                      >
                        {user.estado === "inativa"
                          ? t("admin.users.reactivate")
                          : t("admin.users.deactivate")}
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        type="button"
                        disabled={busy === user.id || blocked}
                        onClick={() => setDeleteTarget(user)}
                      >
                        {t("buttons.delete")}
                      </Button>
                    </td>
                  </tr>
                );
              })}
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
            <AlertDialogTitle>{t("admin.users.deleteTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("admin.users.deleteConfirm", { email: deleteTarget?.email })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("buttons.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                const target = deleteTarget;
                setDeleteTarget(null);
                if (target) void run(target.id, () => adminConsoleApi.deleteUser(target.id));
              }}
            >
              {t("buttons.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}
