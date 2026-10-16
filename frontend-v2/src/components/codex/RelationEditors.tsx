import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  VINCULO_TIPOS,
  type Personagem,
  type PersonagemStatus,
  type PersonagemTipo,
  type VinculoDirecao,
  type VinculoTipo,
} from "@/api/relacoes";
import { qualifierSuggestions } from "@/lib/vinculoView";

const fieldLabel = "text-sm font-medium";
const selectClass =
  "w-full rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground";

export interface PersonagemDraft {
  id?: number;
  isNew: boolean;
  nome: string;
  tipo: PersonagemTipo;
  papel: string;
  faccao: string;
  descricao: string;
  status: PersonagemStatus;
  retrato_url: string | null;
  visivel_para_todos: boolean;
  fadiga: number;
}

export interface VinculoDraft {
  id?: number;
  isNew: boolean;
  personagem_a_id: number | null;
  personagem_b_id: number | null;
  modo: "reciproco" | "duas_vias";
  tipo_ab: VinculoTipo;
  tipo_ba: VinculoTipo;
  nota_ab: string;
  nota_ba: string;
  conhecido_ab: boolean;
  conhecido_ba: boolean;
  qualificador_ab: string;
  qualificador_ba: string;
  direcao: VinculoDirecao | null;
  publico: boolean;
}

const STATUSES: PersonagemStatus[] = ["vivo", "morto", "desaparecido", "desconhecido"];

export function PersonagemEditor({
  draft,
  modules,
  busy,
  onChange,
  onUploadPortrait,
  onSave,
  onCancel,
}: {
  draft: PersonagemDraft;
  modules: string[];
  busy: boolean;
  onChange: (patch: Partial<PersonagemDraft>) => void;
  onUploadPortrait: (file: File) => void;
  onSave: () => void;
  onCancel: () => void;
}) {
  const { t } = useTranslation("relacoes");
  const { t: tc } = useTranslation("comum");
  const [submitted, setSubmitted] = useState(false);
  const nomeError = submitted && !draft.nome.trim() ? tc("form.required") : undefined;
  const fadigaOn = modules.includes("fadiga");
  const unavailable = modules.filter((module) => module !== "fadiga");

  return (
    <Dialog open onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl font-medium">
            {draft.isNew ? t("page.newPersonagem") : t("page.editPersonagem")}
          </DialogTitle>
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
            <span className={fieldLabel}>{t("personagemForm.tipoPersonagem")}</span>
            <select
              className={selectClass}
              value={draft.tipo}
              onChange={(event) => onChange({ tipo: event.target.value as PersonagemTipo })}
            >
              <option value="pj">{tc("tipo.pj")}</option>
              <option value="npc">{tc("tipo.npc")}</option>
            </select>
          </label>
          <label className="block space-y-1">
            <span className={fieldLabel}>{tc("form.papelOpcional")}</span>
            <Input
              value={draft.papel}
              placeholder={t("personagemForm.papelExemplo")}
              onChange={(event) => onChange({ papel: event.target.value })}
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
              aria-label={tc("form.status")}
              value={draft.status}
              onChange={(event) => onChange({ status: event.target.value as PersonagemStatus })}
            >
              {STATUSES.map((status) => (
                <option key={status} value={status}>
                  {tc(`status.${status}`)}
                </option>
              ))}
            </select>
          </label>
          <label className="block space-y-1">
            <span className={fieldLabel}>{tc("form.descricao")}</span>
            <Textarea
              value={draft.descricao}
              onChange={(event) => onChange({ descricao: event.target.value })}
            />
          </label>
          <label className="block space-y-1">
            <span className={fieldLabel}>{t("personagemForm.retrato")}</span>
            {draft.retrato_url && (
              <img src={draft.retrato_url} alt="" className="h-24 w-24 rounded-full object-cover" />
            )}
            <Input
              type="file"
              accept="image/*"
              aria-label={t("personagemForm.retrato")}
              onChange={(event) => {
                const file = event.target.files?.[0];
                event.target.value = "";
                if (file) onUploadPortrait(file);
              }}
            />
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={draft.visivel_para_todos}
              onChange={(event) => onChange({ visivel_para_todos: event.target.checked })}
            />
            {t("personagemForm.visivelParaTodos")}
          </label>
          {!draft.visivel_para_todos && (
            <p className="text-sm text-muted-foreground">
              {t("personagemForm.ocultoAosJogadores")}
            </p>
          )}
          {fadigaOn && (
            <label className="block space-y-1">
              <span className={fieldLabel}>{t("personagemForm.fadiga")}</span>
              <Input
                type="number"
                min={0}
                max={6}
                aria-label={t("personagemForm.fadiga")}
                value={draft.fadiga}
                onChange={(event) => {
                  const next = Number.parseInt(event.target.value, 10);
                  onChange({
                    fadiga: Number.isNaN(next) ? 0 : Math.min(6, Math.max(0, next)),
                  });
                }}
              />
            </label>
          )}
          {unavailable.length > 0 && (
            <p className="text-sm text-muted-foreground">
              {t("personagemForm.moduloIndisponivel")} {unavailable.join(", ")}
            </p>
          )}
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

function TipoSelect({
  label,
  value,
  onChange,
}: {
  label: string;
  value: VinculoTipo;
  onChange: (tipo: VinculoTipo) => void;
}) {
  const { t } = useTranslation("relacoes");
  return (
    <label className="block space-y-1">
      <span className={fieldLabel}>{label}</span>
      <select
        className={selectClass}
        aria-label={label}
        value={value}
        onChange={(event) => onChange(event.target.value as VinculoTipo)}
      >
        {VINCULO_TIPOS.map((tipo) => (
          <option key={tipo} value={tipo}>
            {t(`vinculoTipo.${tipo}`)}
          </option>
        ))}
      </select>
    </label>
  );
}

function QualifierField({
  label,
  value,
  tipo,
  listId,
  onChange,
}: {
  label: string;
  value: string;
  tipo: VinculoTipo;
  listId: string;
  onChange: (value: string) => void;
}) {
  const { t } = useTranslation("relacoes");
  return (
    <label className="block space-y-1">
      <span className={fieldLabel}>{label}</span>
      <Input
        list={listId}
        maxLength={80}
        aria-label={label}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
      <datalist id={listId}>
        {qualifierSuggestions(tipo).map((key) => (
          <option key={key} value={t(`qualificador.${key}`)} />
        ))}
      </datalist>
    </label>
  );
}

export function VinculoEditor({
  draft,
  personagens,
  busy,
  onChange,
  onSave,
  onCancel,
}: {
  draft: VinculoDraft;
  personagens: Personagem[];
  busy: boolean;
  onChange: (patch: Partial<VinculoDraft>) => void;
  onSave: () => void;
  onCancel: () => void;
}) {
  const { t } = useTranslation("relacoes");
  const { t: tc } = useTranslation("comum");
  const [submitted, setSubmitted] = useState(false);
  const duas = draft.modo === "duas_vias";
  const sorted = [...personagens].sort((a, b) => a.nome.localeCompare(b.nome, "pt"));
  const nameA =
    sorted.find((p) => p.id === draft.personagem_a_id)?.nome ?? t("vinculoForm.personagemA");
  const nameB =
    sorted.find((p) => p.id === draft.personagem_b_id)?.nome ?? t("vinculoForm.personagemB");
  const samePerson =
    draft.personagem_a_id != null && draft.personagem_a_id === draft.personagem_b_id;
  const missing = draft.personagem_a_id == null || draft.personagem_b_id == null;
  const sameTipo = duas && draft.tipo_ab === draft.tipo_ba;
  const pairError =
    submitted && (missing || samePerson) ? t("vinculoForm.doisPersonagens") : undefined;

  return (
    <Dialog open onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl font-medium">
            {draft.isNew ? t("page.newConexao") : t("page.editConexao")}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <label className="block space-y-1">
            <span className={fieldLabel}>{t("vinculoForm.personagemA")}</span>
            <select
              className={selectClass}
              aria-label={t("vinculoForm.personagemA")}
              value={draft.personagem_a_id ?? ""}
              onChange={(event) =>
                onChange({
                  personagem_a_id: event.target.value ? Number(event.target.value) : null,
                })
              }
            >
              <option value="">{t("vinculoForm.selecione")}</option>
              {sorted.map((person) => (
                <option key={person.id} value={person.id}>
                  {person.nome}
                </option>
              ))}
            </select>
          </label>
          <label className="block space-y-1">
            <span className={fieldLabel}>{t("vinculoForm.personagemB")}</span>
            <select
              className={selectClass}
              aria-label={t("vinculoForm.personagemB")}
              value={draft.personagem_b_id ?? ""}
              onChange={(event) =>
                onChange({
                  personagem_b_id: event.target.value ? Number(event.target.value) : null,
                })
              }
            >
              <option value="">{t("vinculoForm.selecione")}</option>
              {sorted.map((person) => (
                <option key={person.id} value={person.id}>
                  {person.nome}
                </option>
              ))}
            </select>
          </label>
          {pairError && <p className="text-xs text-destructive">{pairError}</p>}
          <fieldset className="space-y-2">
            <legend className={fieldLabel}>{t("vinculoForm.modo")}</legend>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="vinculo-modo"
                checked={!duas}
                onChange={() => onChange({ modo: "reciproco", qualificador_ba: "", nota_ba: "" })}
              />
              {t("vinculoForm.modoReciproco")}
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="vinculo-modo"
                checked={duas}
                onChange={() =>
                  onChange({ modo: "duas_vias", conhecido_ab: true, conhecido_ba: true })
                }
              />
              {t("vinculoForm.modoDuasVias")}
            </label>
          </fieldset>
          <TipoSelect
            label={
              duas ? t("vinculoForm.veComo", { a: nameA, b: nameB }) : t("vinculoForm.tipoVinculo")
            }
            value={draft.tipo_ab}
            onChange={(tipo) =>
              onChange(
                !duas && tipo === "vinculo_sangue"
                  ? { tipo_ab: tipo, tipo_ba: tipo, direcao: "a_para_b" }
                  : { tipo_ab: tipo },
              )
            }
          />
          <QualifierField
            label={
              duas
                ? t("vinculoForm.qualificador", { a: nameA, b: nameB })
                : t("vinculoForm.qualificadorOpcional")
            }
            value={draft.qualificador_ab}
            tipo={draft.tipo_ab}
            listId="qualificador-ab"
            onChange={(qualificador_ab) => onChange({ qualificador_ab })}
          />
          {duas && (
            <>
              <TipoSelect
                label={t("vinculoForm.veComo", { a: nameB, b: nameA })}
                value={draft.tipo_ba}
                onChange={(tipo_ba) => onChange({ tipo_ba })}
              />
              <QualifierField
                label={t("vinculoForm.qualificador", { a: nameB, b: nameA })}
                value={draft.qualificador_ba}
                tipo={draft.tipo_ba}
                listId="qualificador-ba"
                onChange={(qualificador_ba) => onChange({ qualificador_ba })}
              />
              {sameTipo && (
                <p className="text-sm text-destructive">{t("vinculoForm.tiposIguais")}</p>
              )}
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={draft.conhecido_ab}
                  onChange={(event) => onChange({ conhecido_ab: event.target.checked })}
                />
                {t("vinculoForm.conhecidoJogadores", { a: nameA, b: nameB })}
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={draft.conhecido_ba}
                  onChange={(event) => onChange({ conhecido_ba: event.target.checked })}
                />
                {t("vinculoForm.conhecidoJogadores", { a: nameB, b: nameA })}
              </label>
            </>
          )}
          <fieldset className="space-y-2">
            <legend className={fieldLabel}>{t("vinculoForm.direcao")}</legend>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="vinculo-direcao"
                checked={draft.direcao == null}
                onChange={() => onChange({ direcao: null })}
              />
              {t("vinculoForm.direcaoMutuo")}
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="vinculo-direcao"
                checked={draft.direcao === "a_para_b"}
                onChange={() => onChange({ direcao: "a_para_b" })}
              />
              {nameA} → {nameB}
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="vinculo-direcao"
                checked={draft.direcao === "b_para_a"}
                onChange={() => onChange({ direcao: "b_para_a" })}
              />
              {nameB} → {nameA}
            </label>
          </fieldset>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={draft.publico}
              onChange={(event) => onChange({ publico: event.target.checked })}
            />
            {t("vinculoForm.visivelJogadores")}
          </label>
          <label className="block space-y-1">
            <span className={fieldLabel}>
              {duas
                ? t("vinculoForm.notaDirecional", { a: nameA, b: nameB })
                : t("vinculoForm.notaOpcional")}
            </span>
            <Textarea
              aria-label={
                duas
                  ? t("vinculoForm.notaDirecional", { a: nameA, b: nameB })
                  : t("vinculoForm.notaOpcional")
              }
              value={draft.nota_ab}
              onChange={(event) => onChange({ nota_ab: event.target.value })}
            />
          </label>
          {duas && (
            <label className="block space-y-1">
              <span className={fieldLabel}>
                {t("vinculoForm.notaDirecional", { a: nameB, b: nameA })}
              </span>
              <Textarea
                aria-label={t("vinculoForm.notaDirecional", { a: nameB, b: nameA })}
                value={draft.nota_ba}
                onChange={(event) => onChange({ nota_ba: event.target.value })}
              />
            </label>
          )}
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onCancel}>
            {tc("buttons.cancel")}
          </Button>
          <Button
            type="button"
            disabled={busy || sameTipo}
            onClick={() => {
              setSubmitted(true);
              if (missing || samePerson || sameTipo) return;
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
