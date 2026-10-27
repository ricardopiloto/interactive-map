import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { fiosApi, type Fio } from "@/api/fios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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

export function FiosList({ slug }: { slug: string }) {
  const { t } = useTranslation("sessoes");
  const [rows, setRows] = useState<Fio[]>([]);
  const [draft, setDraft] = useState({ titulo: "", descricao: "" });
  const [editing, setEditing] = useState<number | null>(null);
  const [edit, setEdit] = useState({ titulo: "", descricao: "" });
  const [deleting, setDeleting] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const load = useCallback(() => {
    void fiosApi
      .list(slug)
      .then(setRows)
      .catch(() => setError(t("fios.loadError")));
  }, [slug, t]);
  useEffect(() => {
    load();
  }, [load]);
  async function run(action: () => Promise<unknown>) {
    setBusy(true);
    setError(null);
    try {
      await action();
      load();
    } catch {
      setError(t("fios.saveError"));
    } finally {
      setBusy(false);
    }
  }
  const sorted = [...rows].sort(
    (a, b) =>
      Number(a.estado === "resolvido") - Number(b.estado === "resolvido") || a.ordem - b.ordem,
  );
  function move(fio: Fio, direction: -1 | 1) {
    const group = rows.filter((row) => row.estado === fio.estado).sort((a, b) => a.ordem - b.ordem);
    const index = group.findIndex((row) => row.id === fio.id);
    const other = group[index + direction];
    if (!other) return;
    const ids = [...rows].sort((a, b) => a.ordem - b.ordem).map((row) => row.id);
    const a = ids.indexOf(fio.id),
      b = ids.indexOf(other.id);
    const first = ids[a],
      second = ids[b];
    if (first === undefined || second === undefined) return;
    ids[a] = second;
    ids[b] = first;
    void run(() => fiosApi.reorder(slug, ids));
  }
  return (
    <section aria-label={t("fios.heading")} className="mt-8 space-y-4 border-t border-border pt-6">
      <h2 className="font-display text-2xl">{t("fios.heading")}</h2>
      {error && (
        <p role="alert" className="text-destructive">
          {error}
        </p>
      )}
      <form
        className="space-y-2"
        onSubmit={(event) => {
          event.preventDefault();
          if (!draft.titulo.trim()) return;
          void run(async () => {
            await fiosApi.create(slug, {
              ...draft,
              titulo: draft.titulo.trim(),
              origem: "manual",
              sessao_origem_id: null,
            });
            setDraft({ titulo: "", descricao: "" });
          });
        }}
      >
        <label className="block space-y-1">
          <span>{t("fios.title")}</span>
          <Input
            required
            maxLength={200}
            value={draft.titulo}
            onChange={(event) => setDraft({ ...draft, titulo: event.target.value })}
          />
        </label>
        <label className="block space-y-1">
          <span>{t("fios.description")}</span>
          <Textarea
            maxLength={5000}
            value={draft.descricao}
            onChange={(event) => setDraft({ ...draft, descricao: event.target.value })}
          />
        </label>
        <Button type="submit" disabled={busy}>
          {t("fios.add")}
        </Button>
      </form>
      {sorted.length === 0 && <p>{t("fios.empty")}</p>}
      <ol className="space-y-3">
        {sorted.map((fio) => (
          <li key={fio.id} className="rounded-xl border border-border bg-card p-3">
            {editing === fio.id ? (
              <form
                className="space-y-2"
                onSubmit={(event) => {
                  event.preventDefault();
                  if (!edit.titulo.trim()) return;
                  void run(async () => {
                    await fiosApi.update(slug, fio.id, {
                      titulo: edit.titulo.trim(),
                      descricao: edit.descricao,
                    });
                    setEditing(null);
                  });
                }}
              >
                <label className="block space-y-1">
                  <span>{t("fios.title")}</span>
                  <Input
                    required
                    maxLength={200}
                    value={edit.titulo}
                    onChange={(event) => setEdit({ ...edit, titulo: event.target.value })}
                  />
                </label>
                <label className="block space-y-1">
                  <span>{t("fios.description")}</span>
                  <Textarea
                    maxLength={5000}
                    value={edit.descricao}
                    onChange={(event) => setEdit({ ...edit, descricao: event.target.value })}
                  />
                </label>
                <div className="flex gap-2">
                  <Button type="submit" disabled={busy}>
                    {t("fios.save")}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setEditing(null)}>
                    {t("fios.close")}
                  </Button>
                </div>
              </form>
            ) : (
              <>
                <p
                  className={
                    fio.estado === "resolvido"
                      ? "text-muted-foreground line-through"
                      : "font-medium"
                  }
                >
                  {fio.titulo}
                </p>
                <p className="whitespace-pre-wrap text-sm">{fio.descricao}</p>
                <p className="text-xs text-muted-foreground">{t(`fios.${fio.estado}`)}</p>
                <div className="mt-2 flex flex-wrap gap-1">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={busy}
                    onClick={() => {
                      setEditing(fio.id);
                      setEdit({ titulo: fio.titulo, descricao: fio.descricao });
                    }}
                  >
                    {t("fios.edit")}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={busy}
                    onClick={() =>
                      void run(() =>
                        fiosApi.update(slug, fio.id, {
                          estado: fio.estado === "aberto" ? "resolvido" : "aberto",
                        }),
                      )
                    }
                  >
                    {t(fio.estado === "aberto" ? "fios.resolve" : "fios.reopen")}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={busy}
                    aria-label={`${t("fios.moveUp")}: ${fio.titulo}`}
                    onClick={() => move(fio, -1)}
                  >
                    ↑
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={busy}
                    aria-label={`${t("fios.moveDown")}: ${fio.titulo}`}
                    onClick={() => move(fio, 1)}
                  >
                    ↓
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={busy}
                    onClick={() => setDeleting(fio.id)}
                  >
                    {t("fios.remove")}
                  </Button>
                </div>
              </>
            )}
          </li>
        ))}
      </ol>
      <AlertDialog
        open={deleting !== null}
        onOpenChange={(open) => {
          if (!open) setDeleting(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("fios.removeTitle")}</AlertDialogTitle>
            <AlertDialogDescription>{t("fios.removeBody")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("fios.close")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleting !== null)
                  void run(async () => {
                    await fiosApi.remove(slug, deleting);
                    setDeleting(null);
                  });
              }}
            >
              {t("fios.remove")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}
