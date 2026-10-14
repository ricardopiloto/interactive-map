import { useState } from "react";
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
import {
  DEFAULT_PIN_COLOR,
  type Arco,
  type Local,
  type Npc,
  type NpcStatus,
  type Waypoint,
} from "@/api/map";
import { type LocalDraft, type NpcDraft } from "@/components/codex/map-drafts";

const HEX_PIN = /^#[0-9a-fA-F]{6}$/;

const fieldLabel = "text-sm font-medium";
const selectClass =
  "w-full rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground";

function CheckList({
  label,
  options,
  selected,
  onToggle,
  empty,
}: {
  label: string;
  options: { id: number; nome: string }[];
  selected: number[];
  onToggle: (id: number) => void;
  empty: string;
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

export function LocalEditor({
  draft,
  locais,
  npcs,
  arcos,
  waypoints,
  busy,
  onChange,
  onUploadImage,
  onReposition,
  onSave,
  onCancel,
}: {
  draft: LocalDraft;
  locais: Local[];
  npcs: Npc[];
  arcos: Arco[];
  waypoints: Waypoint[];
  busy: boolean;
  onChange: (patch: Partial<LocalDraft>) => void;
  onUploadImage: (file: File) => void;
  onReposition: () => void;
  onSave: () => void;
  onCancel: () => void;
}) {
  const { t } = useTranslation("admin");
  const { t: tc } = useTranslation("comum");
  const [submitted, setSubmitted] = useState(false);
  const colorOk = HEX_PIN.test(draft.cor_pin);
  const nomeError = submitted && !draft.nome.trim() ? tc("form.required") : undefined;
  const colorError = submitted && !colorOk ? tc("form.invalidColor") : undefined;
  const destinations = locais.filter((local) => local.id !== draft.id);
  const nodes = waypoints.filter(
    (waypoint) => waypoint.local_id == null || waypoint.local_id === draft.id,
  );

  function toggle(key: "npc_ids" | "saida_ids", id: number) {
    const current = draft[key];
    onChange({
      [key]: current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    });
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl font-medium">
            {draft.isNew ? t("localForm.new") : t("localForm.edit")}
          </DialogTitle>
          <DialogDescription>{t("localForm.identidade")}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <label className="block space-y-1">
            <span className={fieldLabel}>{tc("form.nome")}</span>
            <Input
              value={draft.nome}
              aria-invalid={Boolean(nomeError)}
              onChange={(event) => onChange({ nome: event.target.value })}
            />
            {nomeError && <span className="text-xs text-destructive">{nomeError}</span>}
          </label>
          <label className="block space-y-1">
            <span className={fieldLabel}>
              {tc("form.descricao")} {t("localForm.descMarkdown")}
            </span>
            <Textarea
              value={draft.descricao}
              placeholder={t("localForm.descPlaceholder")}
              onChange={(event) => onChange({ descricao: event.target.value })}
            />
          </label>
          <label className="block space-y-1">
            <span className={fieldLabel}>{t("localForm.sessaoLabel")}</span>
            <Input
              value={draft.data_sessao}
              placeholder={t("localForm.sessaoPlaceholder")}
              onChange={(event) => onChange({ data_sessao: event.target.value })}
            />
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={draft.visivel_para_todos}
              onChange={(event) => onChange({ visivel_para_todos: event.target.checked })}
            />
            {t("localForm.visivelParaTodos")}
          </label>
          {!draft.visivel_para_todos && (
            <p className="text-sm text-muted-foreground" role="status">
              {t("localForm.ocultoAosJogadores")}
            </p>
          )}
          <label className="block space-y-1">
            <span className={fieldLabel}>{t("localForm.arco")}</span>
            <select
              className={selectClass}
              value={draft.arco_id ?? ""}
              onChange={(event) =>
                onChange({ arco_id: event.target.value ? Number(event.target.value) : null })
              }
            >
              <option value="">{t("localForm.nenhum")}</option>
              {arcos.map((arco) => (
                <option key={arco.id} value={arco.id}>
                  {arco.titulo}
                </option>
              ))}
            </select>
          </label>
          <div className="space-y-2">
            <p className={fieldLabel}>{t("localForm.estadoExploracao")}</p>
            <div className="flex gap-2">
              {(["visitado", "conhecido"] as const).map((estado) => (
                <Button
                  key={estado}
                  type="button"
                  variant={draft.estado_exploracao === estado ? "default" : "outline"}
                  aria-pressed={draft.estado_exploracao === estado}
                  onClick={() => onChange({ estado_exploracao: estado })}
                >
                  {t(`localForm.${estado}`)}
                </Button>
              ))}
            </div>
          </div>
          <label className="block space-y-1">
            <span className={fieldLabel}>{t("localForm.corPin")}</span>
            <input
              type="color"
              aria-label={t("localForm.corPinAria")}
              value={colorOk ? draft.cor_pin : DEFAULT_PIN_COLOR}
              onChange={(event) => onChange({ cor_pin: event.target.value.toLowerCase() })}
            />
            {colorError && <span className="text-xs text-destructive">{colorError}</span>}
          </label>
          <div className="space-y-2">
            <p className={fieldLabel}>{t("localForm.imagem")}</p>
            {draft.imagem_url && (
              <img
                src={draft.imagem_url}
                alt={t("localForm.imagemPlaceholder")}
                className="aspect-video w-full rounded-xl object-cover"
              />
            )}
            <Input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              aria-label={t("localForm.imagemPlaceholder")}
              onChange={(event) => {
                const file = event.target.files?.[0];
                event.target.value = "";
                if (file) onUploadImage(file);
              }}
            />
          </div>
          <label className="block space-y-1">
            <span className={fieldLabel}>{t("localForm.noRede")}</span>
            <select
              className={selectClass}
              value={draft.waypoint_id ?? ""}
              onChange={(event) =>
                onChange({ waypoint_id: event.target.value ? Number(event.target.value) : null })
              }
            >
              <option value="">{t("localForm.semNo")}</option>
              {nodes.map((waypoint) => (
                <option key={waypoint.id} value={waypoint.id}>
                  {waypoint.nome?.trim() || t("localForm.noFallback", { id: waypoint.id })}
                </option>
              ))}
            </select>
          </label>
          <CheckList
            label={t("localForm.personagensPresentes")}
            options={npcs}
            selected={draft.npc_ids}
            onToggle={(id) => toggle("npc_ids", id)}
            empty={tc("empty.nenhumItem")}
          />
          <CheckList
            label={t("localForm.saidas")}
            options={destinations}
            selected={draft.saida_ids}
            onToggle={(id) => toggle("saida_ids", id)}
            empty={t("localForm.cadastreLocais")}
          />
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              {t("localForm.posicao")} {draft.x.toFixed(2)}, {draft.y.toFixed(2)}
            </p>
            <Button type="button" variant="outline" onClick={onReposition}>
              {t("localForm.reposicionar")}
            </Button>
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onCancel}>
            {tc("buttons.cancel")}
          </Button>
          <Button
            type="button"
            disabled={busy}
            onClick={() => {
              setSubmitted(true);
              if (!draft.nome.trim() || !colorOk) return;
              onSave();
            }}
          >
            {tc("buttons.save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function NpcEditor({
  draft,
  locais,
  busy,
  onChange,
  onUploadPortrait,
  onSave,
  onDelete,
  onCancel,
}: {
  draft: NpcDraft;
  locais: Local[];
  busy: boolean;
  onChange: (patch: Partial<NpcDraft>) => void;
  onUploadPortrait: (file: File) => void;
  onSave: () => void;
  onDelete?: (() => void) | undefined;
  onCancel: () => void;
}) {
  const { t } = useTranslation("admin");
  const { t: tc } = useTranslation("comum");
  const { t: tm } = useTranslation("mapa");
  const [submitted, setSubmitted] = useState(false);
  const nomeError = submitted && !draft.nome.trim() ? tc("form.required") : undefined;
  const statuses: NpcStatus[] = ["vivo", "morto", "desaparecido", "desconhecido"];

  return (
    <Dialog open onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl font-medium">
            {draft.isNew ? t("npc.new") : t("npc.edit")}
          </DialogTitle>
          <DialogDescription>{t("npc.detalhes")}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <label className="block space-y-1">
            <span className={fieldLabel}>{tc("form.nome")}</span>
            <Input
              value={draft.nome}
              aria-invalid={Boolean(nomeError)}
              onChange={(event) => onChange({ nome: event.target.value })}
            />
            {nomeError && <span className="text-xs text-destructive">{nomeError}</span>}
          </label>
          <label className="block space-y-1">
            <span className={fieldLabel}>{tc("form.papelOpcional")}</span>
            <Input
              value={draft.papel}
              onChange={(event) => onChange({ papel: event.target.value })}
            />
          </label>
          <label className="block space-y-1">
            <span className={fieldLabel}>{tc("form.descricao")}</span>
            <Textarea
              value={draft.descricao}
              onChange={(event) => onChange({ descricao: event.target.value })}
            />
          </label>
          <label className="block space-y-1">
            <span className={fieldLabel}>{tc("form.faccaoOpcional")}</span>
            <Input
              value={draft.faccao}
              onChange={(event) => onChange({ faccao: event.target.value })}
            />
          </label>
          <label className="block space-y-1">
            <span className={fieldLabel}>{tc("form.status")}</span>
            <select
              className={selectClass}
              value={draft.status}
              onChange={(event) => onChange({ status: event.target.value as NpcStatus })}
            >
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {tc(`status.${status}`)}
                </option>
              ))}
            </select>
          </label>
          <div className="space-y-2">
            <p className={fieldLabel}>{t("npc.retrato")}</p>
            {draft.retrato_url && (
              <img src={draft.retrato_url} alt="" className="h-24 w-24 rounded-full object-cover" />
            )}
            <Input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              aria-label={t("npc.retrato")}
              onChange={(event) => {
                const file = event.target.files?.[0];
                event.target.value = "";
                if (file) onUploadPortrait(file);
              }}
            />
          </div>
          <CheckList
            label={tm("v2.presentAt")}
            options={locais}
            selected={draft.localIds}
            onToggle={(id) =>
              onChange({
                localIds: draft.localIds.includes(id)
                  ? draft.localIds.filter((item) => item !== id)
                  : [...draft.localIds, id],
              })
            }
            empty={tc("empty.nenhumItem")}
          />
        </div>
        <DialogFooter>
          {!draft.isNew && onDelete && (
            <Button type="button" variant="outline" className="sm:mr-auto" onClick={onDelete}>
              {tc("buttons.delete")}
            </Button>
          )}
          <Button type="button" variant="outline" onClick={onCancel}>
            {tc("buttons.cancel")}
          </Button>
          <Button
            type="button"
            disabled={busy}
            onClick={() => {
              setSubmitted(true);
              if (!draft.nome.trim()) return;
              onSave();
            }}
          >
            {tc("buttons.save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
