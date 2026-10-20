import { useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { X } from "lucide-react";
import { ApiError } from "@/api/client";
import { useCampaignKey, type CampaignConfig } from "@/api/campaign";
import {
  VINCULO_TIPOS,
  relacoesApi,
  useRelations,
  type Personagem,
  type PersonagemPayload,
  type Vinculo,
  type VinculoPayload,
  type VinculoTipo,
} from "@/api/relacoes";
import { useEditMode } from "@/auth/EditModeContext";
import { PersonagemEditor, VinculoEditor } from "@/components/codex/RelationEditors";
import type { PersonagemDraft, VinculoDraft } from "@/components/codex/RelationEditors";
import { RelationsGraph } from "@/components/codex/RelationsGraph";
import { RichContent } from "@/components/codex/RichContent";
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
import { Link, useNavigate, useSearch } from "@/lib/navigation";
import {
  edgeStyle,
  formatTipoWithQual,
  isDuasVias,
  notaFromPerspective,
  qualFromPerspective,
  tipHiddenFromPlayers,
  tipoFromPerspective,
} from "@/lib/vinculoView";
const panel =
  "glass absolute inset-x-2 bottom-20 z-20 max-h-[55vh] overflow-y-auto rounded-2xl p-5 lg:inset-x-auto lg:top-20 lg:right-4 lg:bottom-4 lg:max-h-none lg:w-[380px]";

const STATUSES = ["todos", "vivo", "morto", "desaparecido", "desconhecido"] as const;
type StatusFilter = (typeof STATUSES)[number];
const NO_PEOPLE: Personagem[] = [];
const NO_BONDS: Vinculo[] = [];

function message(error: unknown, fallback: string) {
  return error instanceof ApiError && error.codigo ? error.codigo : fallback;
}

function emptyPersonagem(): PersonagemDraft {
  return {
    isNew: true,
    nome: "",
    tipo: "npc",
    papel: "",
    faccao: "",
    descricao: "",
    notas_mecanicas: "",
    status: "vivo",
    retrato_url: null,
    visivel_para_todos: true,
    fadiga: 0,
  };
}

function personagemDraft(person: Personagem): PersonagemDraft {
  const fadiga = person.extensoes_mecanica["fadiga"];
  return {
    id: person.id,
    isNew: false,
    nome: person.nome,
    tipo: person.tipo,
    papel: person.papel ?? "",
    faccao: person.faccao ?? "",
    descricao: person.descricao,
    notas_mecanicas: person.notas_mecanicas ?? "",
    status: person.status ?? "desconhecido",
    retrato_url: person.retrato_url,
    visivel_para_todos: person.visivel_para_todos !== false,
    fadiga: typeof fadiga === "number" ? fadiga : 0,
  };
}

function emptyVinculo(prefill?: number | null): VinculoDraft {
  return {
    isNew: true,
    personagem_a_id: prefill ?? null,
    personagem_b_id: null,
    modo: "reciproco",
    tipo_ab: "conhecido",
    tipo_ba: "conhecido",
    nota_ab: "",
    nota_ba: "",
    conhecido_ab: true,
    conhecido_ba: true,
    qualificador_ab: "",
    qualificador_ba: "",
    direcao: null,
    publico: false,
  };
}

function vinculoDraft(v: Vinculo): VinculoDraft {
  const duas = isDuasVias(v);
  return {
    id: v.id,
    isNew: false,
    personagem_a_id: v.personagem_a_id,
    personagem_b_id: v.personagem_b_id,
    modo: duas ? "duas_vias" : "reciproco",
    tipo_ab: v.tipo_ab ?? v.tipo_ba ?? "conhecido",
    tipo_ba: v.tipo_ba ?? v.tipo_ab ?? "conhecido",
    nota_ab: v.nota_ab ?? "",
    nota_ba: v.nota_ba ?? "",
    conhecido_ab: v.conhecido_ab ?? true,
    conhecido_ba: v.conhecido_ba ?? true,
    qualificador_ab: v.qualificador_ab ?? "",
    qualificador_ba: v.qualificador_ba ?? "",
    direcao: v.direcao ?? null,
    publico: v.publico,
  };
}

function personagemPayload(draft: PersonagemDraft, modules: string[]): PersonagemPayload {
  const extensoes: Record<string, unknown> = {};
  if (modules.includes("fadiga")) extensoes["fadiga"] = draft.fadiga;
  return {
    nome: draft.nome.trim(),
    tipo: draft.tipo,
    papel: draft.papel.trim() || null,
    descricao: draft.descricao,
    notas_mecanicas: draft.notas_mecanicas,
    faccao: draft.faccao.trim() || null,
    status: draft.status,
    retrato_url: draft.retrato_url,
    visivel_para_todos: draft.visivel_para_todos,
    extensoes_mecanica: extensoes,
  };
}

function vinculoPayload(draft: VinculoDraft): VinculoPayload | null {
  if (draft.personagem_a_id == null || draft.personagem_b_id == null) return null;
  if (draft.personagem_a_id === draft.personagem_b_id) return null;
  const duas = draft.modo === "duas_vias";
  if (duas && draft.tipo_ab === draft.tipo_ba) return null;
  return {
    personagem_a_id: draft.personagem_a_id,
    personagem_b_id: draft.personagem_b_id,
    tipo_ab: draft.tipo_ab,
    tipo_ba: duas ? draft.tipo_ba : null,
    nota_ab: draft.nota_ab,
    nota_ba: duas ? draft.nota_ba : "",
    publico: draft.publico,
    conhecido_ab: duas ? draft.conhecido_ab : true,
    conhecido_ba: duas ? draft.conhecido_ba : true,
    qualificador_ab: draft.qualificador_ab.trim(),
    qualificador_ba: duas ? draft.qualificador_ba.trim() : "",
    direcao: draft.direcao,
  };
}

export function Relations() {
  const slug = useCampaignKey();
  const config = useOutletContext<CampaignConfig>();
  const { t } = useTranslation("relacoes");
  const { t: tc } = useTranslation("comum");
  const { enabled, ready } = useEditMode();
  const search = useSearch();
  const navigate = useNavigate();
  const bundle = useRelations(slug, ready ? enabled : null);
  const [query, setQuery] = useState("");
  const [activeTipos, setActiveTipos] = useState<Set<VinculoTipo>>(() => new Set());
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("todos");
  const [isolate, setIsolate] = useState(false);
  const [personagemDraftState, setPersonagemDraft] = useState<PersonagemDraft | null>(null);
  const [vinculoDraftState, setVinculoDraft] = useState<VinculoDraft | null>(null);
  const [pendingDelete, setPendingDelete] = useState<null | {
    kind: "personagem" | "vinculo";
    id: number;
  }>(null);
  const [busy, setBusy] = useState(false);
  const [busyError, setBusyError] = useState<string | null>(null);

  const personagens = bundle.data?.personagens ?? NO_PEOPLE;
  const vinculos = bundle.data?.vinculos ?? NO_BONDS;
  const locais = bundle.data?.locais ?? [];
  const selectedId = Number(search["personagem"]);
  const pending = !ready || bundle.loading;
  const modules = config?.modulos_ativos ?? [];

  const visiblePeople = useMemo(
    () =>
      personagens.filter(
        (p) => statusFilter === "todos" || (p.status ?? "desconhecido") === statusFilter,
      ),
    [personagens, statusFilter],
  );
  const visibleIds = useMemo(() => new Set(visiblePeople.map((p) => p.id)), [visiblePeople]);
  const visibleBonds = useMemo(
    () =>
      vinculos.filter(
        (v) => visibleIds.has(v.personagem_a_id) && visibleIds.has(v.personagem_b_id),
      ),
    [vinculos, visibleIds],
  );
  const selected = visiblePeople.find((p) => p.id === selectedId) ?? null;
  const listed = visiblePeople
    .filter((p) => p.nome.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()))
    .sort((a, b) => a.nome.localeCompare(b.nome, "pt"));

  function pick(id: number | null) {
    if (id == null) setIsolate(false);
    navigate({ search: id == null ? {} : { personagem: id }, replace: true });
  }

  function toggleTipo(tipo: VinculoTipo) {
    setActiveTipos((prev) => {
      const next = new Set(prev);
      if (next.has(tipo)) next.delete(tipo);
      else next.add(tipo);
      return next;
    });
  }

  async function savePersonagem() {
    if (!personagemDraftState) return;
    setBusy(true);
    setBusyError(null);
    try {
      const saved = personagemDraftState.isNew
        ? await relacoesApi.createPersonagem(slug, personagemPayload(personagemDraftState, modules))
        : await relacoesApi.updatePersonagem(
            slug,
            personagemDraftState.id!,
            personagemPayload(personagemDraftState, modules),
          );
      setPersonagemDraft(null);
      bundle.reload();
      pick(saved.id);
    } catch (error) {
      setBusyError(message(error, t("page.savePersonagemError")));
    } finally {
      setBusy(false);
    }
  }

  async function saveVinculo() {
    if (!vinculoDraftState) return;
    const payload = vinculoPayload(vinculoDraftState);
    if (!payload) return;
    setBusy(true);
    setBusyError(null);
    try {
      if (vinculoDraftState.isNew) await relacoesApi.createVinculo(slug, payload);
      else await relacoesApi.updateVinculo(slug, vinculoDraftState.id!, payload);
      setVinculoDraft(null);
      bundle.reload();
    } catch (error) {
      setBusyError(message(error, t("page.saveVinculoError")));
    } finally {
      setBusy(false);
    }
  }

  async function confirmDelete() {
    if (!pendingDelete) return;
    const target = pendingDelete;
    setPendingDelete(null);
    setBusy(true);
    setBusyError(null);
    try {
      if (target.kind === "personagem") {
        await relacoesApi.deletePersonagem(slug, target.id);
        if (selected?.id === target.id) pick(null);
      } else {
        await relacoesApi.deleteVinculo(slug, target.id);
      }
      bundle.reload();
    } catch (error) {
      setBusyError(
        message(
          error,
          target.kind === "personagem"
            ? t("page.removePersonagemError")
            : t("page.removeVinculoError"),
        ),
      );
    } finally {
      setBusy(false);
    }
  }

  async function uploadPortrait(file: File) {
    setBusyError(null);
    try {
      const uploaded = await relacoesApi.uploadPortrait(slug, file);
      setPersonagemDraft((current) =>
        current ? { ...current, retrato_url: uploaded.url } : current,
      );
    } catch (error) {
      setBusyError(message(error, t("page.savePersonagemError")));
    }
  }

  return (
    <main className="fixed inset-0 overflow-hidden bg-background">
      {pending && (
        <p role="status" className="absolute top-20 left-4 z-10 text-sm">
          {tc("loading.network")}
        </p>
      )}
      {bundle.error && (
        <p role="alert" className="absolute top-20 left-4 z-10 text-sm text-destructive">
          {message(bundle.error, t("page.loadError"))}
        </p>
      )}
      {busyError && (
        <p role="alert" className="absolute top-28 left-4 z-10 text-sm text-destructive">
          {busyError}
        </p>
      )}
      {!pending && !bundle.error && (
        <RelationsGraph
          campaignSlug={slug}
          personagens={visiblePeople}
          vinculos={visibleBonds}
          selectedId={selected?.id ?? null}
          isolate={isolate}
          activeTipos={activeTipos}
          query={query}
          isGm={enabled}
          onSelect={pick}
        />
      )}
      <Legend />
      <aside className={panel} aria-label={t("v2.characterNetwork")}>
        <label className="block">
          <span className="sr-only">{t("column.search")}</span>
          <input
            type="search"
            value={query}
            placeholder={t("column.search")}
            onChange={(event) => setQuery(event.target.value)}
            className="w-full rounded-xl border border-border bg-card px-3 py-2 text-sm"
          />
        </label>
        <div
          className="mt-3 flex flex-wrap gap-1"
          role="group"
          aria-label={t("column.tiposVinculo")}
        >
          {VINCULO_TIPOS.map((tipo) => (
            <button
              key={tipo}
              type="button"
              aria-pressed={activeTipos.has(tipo)}
              onClick={() => toggleTipo(tipo)}
              className="rounded-full border px-2 py-1 text-xs"
              style={{
                borderColor: edgeStyle[tipo].color,
                background: activeTipos.has(tipo) ? "var(--accent)" : "transparent",
              }}
            >
              {edgeStyle[tipo].glyph} {t(`vinculoTipo.${tipo}`)}
            </button>
          ))}
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-3 text-xs">
          <label className="flex items-center gap-2">
            {t("column.statusFilter")}
            <select
              aria-label={t("column.statusFilter")}
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}
              className="rounded-lg border border-border bg-card px-2 py-1"
            >
              {STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status === "todos" ? t("column.statusFilterTodos") : tc(`status.${status}`)}
                </option>
              ))}
            </select>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={isolate}
              disabled={selected == null}
              onChange={(event) => setIsolate(event.target.checked)}
            />
            {t("column.isolate")}
          </label>
        </div>
        {enabled && (
          <div className="mt-3 flex gap-2">
            <Button type="button" size="sm" onClick={() => setPersonagemDraft(emptyPersonagem())}>
              {t("page.addPersonagem")}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setVinculoDraft(emptyVinculo(selected?.id))}
            >
              {t("page.addConexao")}
            </Button>
          </div>
        )}
        {selected ? (
          <Profile
            person={selected}
            people={personagens}
            bonds={visibleBonds.filter(
              (v) => v.personagem_a_id === selected.id || v.personagem_b_id === selected.id,
            )}
            locais={locais}
            activeTipos={activeTipos}
            isGm={enabled}
            onClose={() => pick(null)}
            onOpen={(id) => pick(id)}
            onEdit={() => setPersonagemDraft(personagemDraft(selected))}
            onDelete={() => setPendingDelete({ kind: "personagem", id: selected.id })}
            onEditBond={(id) => {
              const bond = vinculos.find((v) => v.id === id);
              if (bond) setVinculoDraft(vinculoDraft(bond));
            }}
            onDeleteBond={(id) => setPendingDelete({ kind: "vinculo", id })}
          />
        ) : (
          <ul className="mt-4 space-y-1">
            <li className="eyebrow">{t("panel.sectionPersonagens", { count: listed.length })}</li>
            {listed.length === 0 && (
              <li className="text-sm text-muted-foreground">
                {query.trim()
                  ? t("column.listEmptySearch")
                  : statusFilter === "todos"
                    ? t("column.listEmpty")
                    : t("column.listEmptyStatus")}
              </li>
            )}
            {listed.map((person) => (
              <li key={person.id}>
                <button
                  type="button"
                  onClick={() => pick(person.id)}
                  className="flex w-full items-center gap-3 rounded-xl p-2 text-left hover:bg-accent"
                >
                  <span className="min-w-0">
                    <span className="block truncate font-medium">{person.nome}</span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {person.tipo === "pj" ? tc("tipo.pj") : tc("tipo.npc")}
                      {person.papel ? ` · ${person.papel}` : ""}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </aside>
      {personagemDraftState && (
        <PersonagemEditor
          draft={personagemDraftState}
          modules={modules}
          busy={busy}
          onChange={(patch) =>
            setPersonagemDraft((current) => (current ? { ...current, ...patch } : current))
          }
          onUploadPortrait={(file) => void uploadPortrait(file)}
          onSave={() => void savePersonagem()}
          onCancel={() => setPersonagemDraft(null)}
        />
      )}
      {vinculoDraftState && (
        <VinculoEditor
          draft={vinculoDraftState}
          personagens={personagens}
          busy={busy}
          onChange={(patch) =>
            setVinculoDraft((current) => (current ? { ...current, ...patch } : current))
          }
          onSave={() => void saveVinculo()}
          onCancel={() => setVinculoDraft(null)}
        />
      )}
      <AlertDialog
        open={pendingDelete != null}
        onOpenChange={(open) => !open && setPendingDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {pendingDelete?.kind === "vinculo"
                ? t("page.confirmRemoveVinculo")
                : t("page.confirmRemovePersonagem")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {pendingDelete?.kind === "vinculo"
                ? t("page.confirmRemoveVinculo")
                : t("page.confirmRemovePersonagem")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{tc("buttons.cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={() => void confirmDelete()}>
              {tc("buttons.remove")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}

function Legend() {
  const { t } = useTranslation("relacoes");
  return (
    <div className="glass absolute top-32 left-3 z-10 hidden w-56 rounded-2xl p-4 md:block lg:left-4">
      <p className="eyebrow mb-3">{t("v2.bondTypes")}</p>
      <ul className="space-y-2">
        {VINCULO_TIPOS.map((tipo) => {
          const stroke = edgeStyle[tipo];
          return (
            <li key={tipo} className="flex items-center gap-2 text-xs">
              <svg width="34" height="8" aria-hidden>
                <line
                  x1="2"
                  y1="4"
                  x2="32"
                  y2="4"
                  stroke={stroke.color}
                  strokeWidth={stroke.w}
                  strokeDasharray={stroke.dash}
                  strokeLinecap="round"
                />
              </svg>
              <span className="w-4 text-center">{stroke.glyph}</span>
              {t(`vinculoTipo.${tipo}`)}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function Profile({
  person,
  people,
  bonds,
  locais,
  activeTipos,
  isGm,
  onClose,
  onOpen,
  onEdit,
  onDelete,
  onEditBond,
  onDeleteBond,
}: {
  person: Personagem;
  people: Personagem[];
  bonds: Vinculo[];
  locais: { id: number; nome: string }[];
  activeTipos: Set<VinculoTipo>;
  isGm: boolean;
  onClose: () => void;
  onOpen: (id: number) => void;
  onEdit: () => void;
  onDelete: () => void;
  onEditBond: (id: number) => void;
  onDeleteBond: (id: number) => void;
}) {
  const { t } = useTranslation("relacoes");
  const { t: tc } = useTranslation("comum");
  const byId = new Map(people.map((p) => [p.id, p]));
  const shown = bonds.filter((bond) => {
    if (activeTipos.size === 0) return true;
    return (
      (bond.tipo_ab != null && activeTipos.has(bond.tipo_ab)) ||
      (bond.tipo_ba != null && activeTipos.has(bond.tipo_ba))
    );
  });
  const places = person.local_ids
    .map((id) => locais.find((local) => local.id === id))
    .filter((local): local is { id: number; nome: string } => local != null);
  const fadiga = person.extensoes_mecanica["fadiga"];

  return (
    <div className="mt-4" aria-label={t("v2.profile", { name: person.nome })}>
      {person.retrato_url && (
        <img
          src={person.retrato_url}
          alt={t("v2.illustration", { name: person.nome })}
          className="aspect-square w-full object-cover"
        />
      )}
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <p className="eyebrow">
            {person.tipo === "pj" ? tc("tipo.pj") : tc("tipo.npc")}
            {person.faccao ? ` · ${person.faccao}` : ""}
          </p>
          <h1 className="font-display text-2xl leading-tight font-medium">{person.nome}</h1>
          <p className="text-sm text-seal">
            {person.papel ? `${person.papel} · ` : ""}
            {tc(`status.${person.status ?? "desconhecido"}`)}
            {typeof fadiga === "number" ? ` · ${t("personagemForm.fadiga")} ${fadiga}` : ""}
          </p>
          {isGm && person.visivel_para_todos === false && (
            <p className="text-xs text-seal">{t("personagemForm.ocultoAosJogadores")}</p>
          )}
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label={t("v2.closeProfile")}
          className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-accent"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      {person.descricao.trim() && (
        <div className="mt-4">
          <RichContent markdown={person.descricao} />
        </div>
      )}
      {isGm && Boolean(person.notas_mecanicas?.trim()) && (
        <section className="mt-4" aria-label={t("personagemForm.notasMecanicas")}>
          <h2 className="eyebrow mb-2">{t("personagemForm.notasMecanicas")}</h2>
          <RichContent markdown={person.notas_mecanicas ?? ""} />
        </section>
      )}
      {isGm && (
        <div className="mt-3 flex gap-2">
          <Button type="button" size="sm" onClick={onEdit}>
            {tc("buttons.edit")}
          </Button>
          <Button type="button" size="sm" variant="outline" onClick={onDelete}>
            {tc("buttons.remove")}
          </Button>
        </div>
      )}
      <h2 className="eyebrow mt-6 mb-2">{t("detail.vinculosCount", { count: shown.length })}</h2>
      {shown.length === 0 && (
        <p className="text-sm text-muted-foreground">{t("detail.noVinculos")}</p>
      )}
      <ul className="divide-y divide-border">
        {shown.map((bond) => {
          const otherId =
            bond.personagem_a_id === person.id ? bond.personagem_b_id : bond.personagem_a_id;
          const other = byId.get(otherId);
          const mine = tipoFromPerspective(bond, person.id);
          const theirs = tipoFromPerspective(bond, otherId);
          const myQual = qualFromPerspective(bond, person.id);
          const theirQual = qualFromPerspective(bond, otherId);
          const myNote = notaFromPerspective(bond, person.id);
          const theirNote = notaFromPerspective(bond, otherId);
          const duas = isDuasVias(bond);
          return (
            <li key={bond.id} className="py-2.5" data-vinculo-detail={bond.id}>
              <button
                type="button"
                className="text-left font-medium"
                onClick={() => onOpen(otherId)}
              >
                {other?.nome ?? t("detail.removed")}
              </button>
              {mine && (
                <p className="text-xs text-muted-foreground">
                  {edgeStyle[mine].glyph} {formatTipoWithQual(t(`vinculoTipo.${mine}`), myQual)}
                  {!duas && bond.direcao == null && ` · ${t("v2.mutual")}`}
                  {!duas &&
                    bond.direcao === "a_para_b" &&
                    (person.id === bond.personagem_a_id
                      ? ` · ${t("v2.feels")}`
                      : ` · ${t("v2.target")}`)}
                  {!duas &&
                    bond.direcao === "b_para_a" &&
                    (person.id === bond.personagem_b_id
                      ? ` · ${t("v2.feels")}`
                      : ` · ${t("v2.target")}`)}
                </p>
              )}
              {myNote && <p className="text-xs">{myNote}</p>}
              {theirs && (duas || mine == null) && (
                <p className="text-xs text-muted-foreground">
                  {t("detail.veTeComo")} {formatTipoWithQual(t(`vinculoTipo.${theirs}`), theirQual)}
                  {theirNote ? ` — ${theirNote}` : ""}
                </p>
              )}
              {isGm && !bond.publico && (
                <p className="text-xs text-seal">{t("graph.privateMarker")}</p>
              )}
              {isGm &&
                (tipHiddenFromPlayers(bond, person.id) || tipHiddenFromPlayers(bond, otherId)) && (
                  <p className="text-xs text-seal">{t("graph.unknownMarker")}</p>
                )}
              {isGm && (
                <div className="mt-1 flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => onEditBond(bond.id)}
                  >
                    {tc("buttons.edit")}
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => onDeleteBond(bond.id)}
                  >
                    {tc("buttons.remove")}
                  </Button>
                </div>
              )}
            </li>
          );
        })}
      </ul>
      {places.length > 0 && (
        <>
          <h2 className="eyebrow mt-6 mb-2">{t("v2.places")}</h2>
          <div className="flex flex-wrap gap-1.5">
            {places.map((local) => (
              <Link
                key={local.id}
                to="/"
                search={{ local: local.id }}
                className="rounded-full border border-border px-2.5 py-1 text-xs hover:text-seal"
              >
                {local.nome}
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
