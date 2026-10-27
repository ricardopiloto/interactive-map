import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ApiError } from "@/api/client";
import { fiosApi, type PropostaFio, type PropostaFios } from "@/api/fios";
import type { Sessao } from "@/api/sessoes";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type Item = PropostaFio & { selected: boolean };
export function FiosReview({
  slug,
  sessaoId,
  sessoes,
  onClose,
  onAdded,
}: {
  slug: string;
  sessaoId: number | null;
  sessoes: Pick<Sessao, "id" | "numero">[];
  onClose: () => void;
  onAdded: () => void;
}) {
  const { t } = useTranslation("sessoes");
  const [response, setResponse] = useState<PropostaFios | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    let active = true;
    void fiosApi
      .propose(slug, sessaoId)
      .then((result) => {
        if (!active) return;
        setResponse(result);
        setItems(result.fios.map((item) => ({ ...item, selected: true })));
      })
      .catch((reason: unknown) => {
        if (!active) return;
        setError(
          reason instanceof ApiError && reason.status === 429
            ? t("fios.rateLimit")
            : reason instanceof ApiError && reason.status === 403
              ? t("fios.forbidden")
              : t("fios.proposeError"),
        );
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [slug, sessaoId, t]);
  function patch(index: number, change: Partial<Item>) {
    setItems((current) => current.map((item, i) => (i === index ? { ...item, ...change } : item)));
  }
  async function add() {
    const selected = items.filter((item) => item.selected);
    if (!selected.length || saving) return;
    setSaving(true);
    setError(null);
    try {
      await fiosApi.createBatch(
        slug,
        selected.map((item) => ({
          titulo: item.titulo.trim(),
          descricao: item.descricao.trim(),
          origem: "ia" as const,
          sessao_origem_id:
            sessaoId ?? sessoes.find((sessao) => sessao.numero === item.sessao_numero)?.id ?? null,
        })),
      );
      onAdded();
      onClose();
    } catch {
      setError(t("fios.batchError"));
    } finally {
      setSaving(false);
    }
  }
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open && !saving) onClose();
      }}
    >
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t("fios.reviewTitle")}</DialogTitle>
          <DialogDescription>{t("fios.reviewIntro")}</DialogDescription>
        </DialogHeader>
        {loading && <p role="status">{t("fios.proposing")}</p>}
        {response?.estado === "falha" && (
          <p role="alert">{response.mensagem || t("fios.proposeError")}</p>
        )}
        {response?.estado === "vazio" && <p>{response.mensagem || t("fios.noProposals")}</p>}
        {response && response.sessoes_omitidas > 0 && (
          <p role="alert">{t("fios.omitted", { count: response.sessoes_omitidas })}</p>
        )}
        {response?.usou_conteudo_oculto && <p role="alert">{t("fios.hiddenContent")}</p>}
        {error && (
          <p role="alert" className="text-destructive">
            {error}
          </p>
        )}
        {response?.estado === "propostas" && (
          <div className="space-y-3">
            {items.map((item, index) => (
              <div key={index} className="space-y-2 rounded-xl border border-border bg-card p-3">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={item.selected}
                    onChange={(event) => patch(index, { selected: event.target.checked })}
                  />
                  {t("fios.accept")}
                </label>
                <label className="block space-y-1">
                  <span>{t("fios.title")}</span>
                  <Input
                    maxLength={200}
                    value={item.titulo}
                    onChange={(event) => patch(index, { titulo: event.target.value })}
                  />
                </label>
                <label className="block space-y-1">
                  <span>{t("fios.description")}</span>
                  <Textarea
                    maxLength={5000}
                    value={item.descricao}
                    onChange={(event) => patch(index, { descricao: event.target.value })}
                  />
                </label>
              </div>
            ))}
          </div>
        )}
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
            {t("fios.close")}
          </Button>
          {response?.estado === "propostas" && (
            <Button
              type="button"
              disabled={
                saving ||
                !items.some((item) => item.selected && item.titulo.trim()) ||
                items.some((item) => item.selected && !item.titulo.trim())
              }
              onClick={() => void add()}
            >
              {saving ? t("fios.saving") : t("fios.addSelected")}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
