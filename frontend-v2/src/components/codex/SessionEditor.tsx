import { FiosReview } from "@/components/codex/FiosReview";
import type { Sessao } from "@/api/sessoes";
import { IaAssistente } from "@/components/codex/IaAssistente";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
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
import type { CatalogoItem } from "@/api/sessoes";

const fieldLabel = "text-sm font-medium";

export interface SessaoDraft {
  isNew: boolean;
  id?: number;
  numero: number;
  titulo: string;
  data_rotulo: string;
  resumo: string;
  notas_preparo: string;
  visivel_para_todos: boolean;
  local_ids: number[];
  personagem_ids: number[];
  /** When true, focus the prep-notes field (prepare-next-session flow). */
  focusNotasPreparo?: boolean;
}

function CheckList({
  label,
  options,
  selected,
  empty,
  onToggle,
}: {
  label: string;
  options: CatalogoItem[];
  selected: number[];
  empty: string;
  onToggle: (id: number) => void;
}) {
  return (
    <fieldset className="space-y-2">
      <legend className={fieldLabel}>{label}</legend>
      {options.length === 0 ? (
        <p className="text-sm text-muted-foreground">{empty}</p>
      ) : (
        <div className="max-h-36 space-y-1 overflow-y-auto rounded-xl border border-border p-2">
          {options.map((option) => (
            <label key={option.id} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={selected.includes(option.id)}
                onChange={() => onToggle(option.id)}
              />
              {option.nome}
            </label>
          ))}
        </div>
      )}
    </fieldset>
  );
}

export function SessionEditor({
  draft,
  slug,
  sessoes,
  onFiosAdded,
  isDono,
  locais,
  personagens,
  iaAtiva,
  busy,
  suggesting,
  sugestaoMsg,
  error,
  onChange,
  onSuggest,
  onSave,
  onCancel,
}: {
  draft: SessaoDraft;
  slug: string;
  sessoes?: Pick<Sessao, "id" | "numero">[];
  onFiosAdded?: () => void;
  isDono: boolean;
  locais: CatalogoItem[];
  personagens: CatalogoItem[];
  iaAtiva: boolean;
  busy: boolean;
  suggesting: boolean;
  sugestaoMsg: string | null;
  error: string | null;
  onChange: (patch: Partial<SessaoDraft>) => void;
  onSuggest: () => void;
  onSave: () => void;
  onCancel: () => void;
}) {
  const { t } = useTranslation("sessoes");
  const { t: tc } = useTranslation("comum");
  const notasPreparoRef = useRef<HTMLTextAreaElement>(null);
  const [reviewOpen, setReviewOpen] = useState(false);

  useEffect(() => {
    if (!draft.focusNotasPreparo) return;
    const node = notasPreparoRef.current;
    if (!node) return;
    node.focus();
    const length = node.value.length;
    node.setSelectionRange(length, length);
  }, [draft.focusNotasPreparo]);

  function toggle(key: "local_ids" | "personagem_ids", id: number) {
    const current = draft[key];
    onChange({
      [key]: current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    });
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onCancel()}>
      <DialogContent
        className="max-h-[85vh] overflow-y-auto sm:max-w-lg"
        onOpenAutoFocus={(event) => {
          if (!draft.focusNotasPreparo) return;
          event.preventDefault();
          notasPreparoRef.current?.focus();
        }}
      >
        <DialogHeader>
          <DialogTitle className="font-display text-2xl font-medium">
            {draft.isNew ? t("new") : t("edit")}
          </DialogTitle>
          <DialogDescription>{t("formIntro")}</DialogDescription>
        </DialogHeader>
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            if (draft.titulo.trim() && !busy) onSave();
          }}
        >
          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}
          <label className="block space-y-1">
            <span className={fieldLabel}>{t("fieldNumero")}</span>
            <Input
              type="number"
              min={1}
              value={draft.numero}
              onChange={(event) => onChange({ numero: Number(event.target.value) || 1 })}
            />
          </label>
          <label className="block space-y-1">
            <span className={fieldLabel}>{t("fieldTitulo")}</span>
            <Input
              value={draft.titulo}
              required
              onChange={(event) => onChange({ titulo: event.target.value })}
            />
          </label>
          <label className="block space-y-1">
            <span className={fieldLabel}>{t("fieldData")}</span>
            <Input
              value={draft.data_rotulo}
              onChange={(event) => onChange({ data_rotulo: event.target.value })}
            />
          </label>
          <label className="block space-y-1">
            <span className={fieldLabel}>{t("fieldNotasPreparo")}</span>
            <Textarea
              ref={notasPreparoRef}
              value={draft.notas_preparo}
              onChange={(event) => onChange({ notas_preparo: event.target.value })}
            />
          </label>
          {iaAtiva && isDono && !draft.visivel_para_todos && (
            <div className="space-y-3">
              <div className="space-y-1">
                <p className={fieldLabel}>{tc("iaAssistente.rascunho")}</p>
                <IaAssistente
                  slug={slug}
                  tipo="rascunho_sessao"
                  alvoId={draft.id ?? null}
                  textoAtual={draft.notas_preparo}
                  campoPublico={false}
                  aplicarDiretoSeVazio
                  onInserir={(texto) =>
                    onChange({
                      notas_preparo: [draft.notas_preparo, texto].filter(Boolean).join("\n\n"),
                    })
                  }
                  onSubstituir={(texto) => onChange({ notas_preparo: texto })}
                />
              </div>
              <Button type="button" variant="outline" size="sm" onClick={() => setReviewOpen(true)}>
                {tc("iaAssistente.fiosNarrativos")}
              </Button>
            </div>
          )}
          <label className="block space-y-1">
            <span className={fieldLabel}>{t("fieldResumo")}</span>
            <Textarea
              value={draft.resumo}
              onChange={(event) => onChange({ resumo: event.target.value })}
            />
          </label>
          {iaAtiva && isDono && (
            <IaAssistente
              slug={slug}
              tipo="resumo_sessao"
              alvoId={draft.id ?? null}
              textoAtual={draft.resumo}
              campoPublico={draft.visivel_para_todos}
              onInserir={(texto) =>
                onChange({ resumo: [draft.resumo, texto].filter(Boolean).join("\n\n") })
              }
              onSubstituir={(texto) => onChange({ resumo: texto })}
            />
          )}
          {iaAtiva && (
            <div className="space-y-1">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={!draft.resumo.trim() || busy || suggesting}
                aria-describedby="sessao-suggest-hint"
                onClick={onSuggest}
              >
                {suggesting ? t("suggestLoading") : t("suggestButton")}
              </Button>
              <p id="sessao-suggest-hint" className="text-sm text-muted-foreground">
                {!draft.resumo.trim() ? t("suggestNeedsResumo") : sugestaoMsg}
              </p>
            </div>
          )}
          <CheckList
            label={t("fieldLocais")}
            options={locais}
            selected={draft.local_ids}
            empty={t("emptyLocais")}
            onToggle={(id) => toggle("local_ids", id)}
          />
          <CheckList
            label={t("fieldPersonagens")}
            options={personagens}
            selected={draft.personagem_ids}
            empty={t("emptyPersonagens")}
            onToggle={(id) => toggle("personagem_ids", id)}
          />
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={draft.visivel_para_todos}
              onChange={(event) => onChange({ visivel_para_todos: event.target.checked })}
            />
            {t("fieldVisivel")}
          </label>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onCancel}>
              {tc("buttons.cancel")}
            </Button>
            <Button type="submit" disabled={!draft.titulo.trim() || busy}>
              {tc("buttons.save")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
      {reviewOpen && (
        <FiosReview
          slug={slug}
          sessaoId={draft.id ?? null}
          sessoes={sessoes ?? []}
          onClose={() => setReviewOpen(false)}
          onAdded={() => onFiosAdded?.()}
        />
      )}
    </Dialog>
  );
}
