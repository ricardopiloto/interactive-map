import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useCampaignKey, type CampaignConfig } from "@/api/campaign";
import {
  timelineApi,
  type Evento,
  type EventoDraft,
  type Arco,
  type ArcoDraft,
  type Item,
  type ItemDraft,
  type Proposta,
  type Descoberta,
} from "@/api/timeline";
import type { Sessao } from "@/api/sessoes";
import { mapApi, localPayload, type Local } from "@/api/map";
import { useEditMode } from "@/auth/EditModeContext";
import { RichContent } from "@/components/codex/RichContent";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { ArcTimeline } from "@/components/codex/ArcTimeline";

const palette = ["#a34834", "#376c72", "#9a6d28", "#694e86", "#547348", "#8c5069"];
type Data = { eventos: Evento[]; arcos: Arco[]; sessoes: Sessao[]; descoberta: Descoberta };
type Editor =
  | { kind: "event"; id: number | undefined; draft: EventoDraft }
  | { kind: "arc"; id: number | undefined; draft: ArcoDraft }
  | { kind: "item"; id: number | undefined; draft: ItemDraft };
function Checks({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { id: number; nome: string }[];
  value: number[];
  onChange: (ids: number[]) => void;
}) {
  return (
    <fieldset className="space-y-2">
      <legend className="text-sm font-medium">{label}</legend>
      <div className="max-h-32 overflow-y-auto rounded-xl border p-2">
        {options.map((o) => (
          <label key={o.id} className="flex gap-2 text-sm">
            <input
              type="checkbox"
              checked={value.includes(o.id)}
              onChange={() =>
                onChange(
                  value.includes(o.id) ? value.filter((id) => id !== o.id) : [...value, o.id],
                )
              }
            />
            {o.nome}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
export function Timeline() {
  const slug = useCampaignKey();
  const config = useOutletContext<CampaignConfig>();
  const { t } = useTranslation("linhaTempo");
  const { t: tc } = useTranslation("comum");
  const { enabled, ready, isDono } = useEditMode();
  const [mode, setMode] = useState<"chron" | "arcs" | "discovery">("chron");
  const [data, setData] = useState<Data | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [catalog, setCatalog] = useState<{
    locais: Local[];
    personagens: { id: number; nome: string }[];
  }>({ locais: [], personagens: [] });
  const [revision, reload] = useState(0);
  const [error, setError] = useState("");
  const [editor, setEditor] = useState<Editor | null>(null);
  const [busy, setBusy] = useState(false);
  const [suggesting, setSuggesting] = useState(false);
  const [message, setMessage] = useState("");
  const [filterArc, setFilterArc] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [proposals, setProposals] = useState<Proposta[]>([]);
  const [showItems, setShowItems] = useState(false);
  const [showArcs, setShowArcs] = useState(false);
  const [arcLocalIds, setArcLocalIds] = useState<number[]>([]);
  const gm = ready && enabled;
  const ia = isDono && Boolean(config?.modulos_ativos.includes("ia_arcos"));
  useEffect(() => {
    setMode("chron");
    setFilterArc("all");
    setFilterType("all");
    setEditor(null);
    setShowItems(false);
    setShowArcs(false);
    setProposals([]);
    setCatalog({ locais: [], personagens: [] });
    setItems([]);
  }, [slug]);
  useEffect(() => {
    if (!gm) {
      setEditor(null);
      setShowItems(false);
      setShowArcs(false);
      setProposals([]);
    }
  }, [gm]);
  useEffect(() => {
    if (!ready) return;
    let active = true;
    setData(null);
    setError("");
    void timelineApi
      .load(slug, gm, gm && isDono)
      .then((v) => {
        if (active) setData(v);
      })
      .catch(() => {
        if (active) setError(t("loadError"));
      });
    if (gm) {
      void timelineApi.catalogs(slug).then((v) => {
        if (active) setCatalog(v);
      });
      if (isDono)
        void timelineApi.items(slug).then((v) => {
          if (active) setItems(v.itens);
        });
    }
    return () => {
      active = false;
    };
  }, [slug, gm, ready, isDono, revision, t]);
  function arcDraft(a?: Arco): ArcoDraft {
    const unused = palette.filter((c) => !data?.arcos.some((x) => x.cor === c));
    return a
      ? {
          titulo: a.titulo,
          resumo: a.resumo,
          ordem: a.ordem,
          cor: a.cor,
          visivel_para_todos: a.visivel_para_todos,
          sessao_ids: a.sessao_ids,
          sessao_transicao_id: a.sessao_transicao_id,
        }
      : {
          titulo: "",
          resumo: "",
          ordem: data?.arcos.length ?? 0,
          cor: (unused.length ? unused : palette)[
            Math.floor(Math.random() * (unused.length || palette.length))
          ]!,
          visivel_para_todos: true,
          sessao_ids: [],
          sessao_transicao_id: null,
        };
  }
  function editEvent(e?: Evento) {
    setMessage("");
    setEditor({
      kind: "event",
      id: e?.id,
      draft: e
        ? {
            titulo: e.titulo,
            ano: e.ano,
            mes: e.mes,
            rotulo_era: e.rotulo_era,
            descricao: e.descricao,
            sessao_id: e.sessao_id,
            visivel_para_todos: e.visivel_para_todos !== false,
            local_ids: e.locais.map((x) => x.id),
            personagem_ids: e.personagens.map((x) => x.id),
          }
        : {
            titulo: "",
            ano: 0,
            mes: null,
            rotulo_era: null,
            descricao: "",
            sessao_id: null,
            visivel_para_todos: true,
            local_ids: [],
            personagem_ids: [],
          },
    });
  }
  function editArc(a?: Arco) {
    setMessage("");
    setArcLocalIds(a ? catalog.locais.filter((l) => l.arco_id === a.id).map((l) => l.id) : []);
    setEditor({ kind: "arc", id: a?.id, draft: arcDraft(a) });
  }
  function editItem(i?: Item) {
    setMessage("");
    setEditor({
      kind: "item",
      id: i?.id,
      draft: i
        ? {
            nome: i.nome,
            descricao: i.descricao,
            visivel_para_todos: i.visivel_para_todos,
            sessao_ids: i.sessoes.map((x) => x.id),
            evento_ids: i.eventos.map((x) => x.id),
          }
        : { nome: "", descricao: "", visivel_para_todos: true, sessao_ids: [], evento_ids: [] },
    });
  }
  function patch(p: Record<string, unknown>) {
    setEditor((v) => (v ? ({ ...v, draft: { ...v.draft, ...p } } as Editor) : null));
  }
  async function save() {
    if (!editor) return;
    setBusy(true);
    setError("");
    try {
      if (editor.kind === "event") {
        if (editor.id) await timelineApi.updateEvent(slug, editor.id, editor.draft);
        else await timelineApi.createEvent(slug, editor.draft);
      } else if (editor.kind === "arc") {
        const saved = editor.id
          ? await timelineApi.updateArc(slug, editor.id, editor.draft)
          : await timelineApi.createArc(slug, editor.draft);
        setEditor((current) => (current?.kind === "arc" ? { ...current, id: saved.id } : current));
        for (const local of catalog.locais) {
          const should = arcLocalIds.includes(local.id);
          if ((should && local.arco_id !== saved.id) || (!should && local.arco_id === saved.id))
            await mapApi.updateLocal(
              slug,
              local.id,
              localPayload(local, { arco_id: should ? saved.id : null }),
            );
        }
      } else {
        if (editor.id) await timelineApi.updateItem(slug, editor.id, editor.draft);
        else await timelineApi.createItem(slug, editor.draft);
      }
      setEditor(null);
      if (editor.kind === "arc") setProposals([]);
      reload((x) => x + 1);
    } catch (e) {
      setError(String(e));
    } finally {
      setBusy(false);
    }
  }
  async function remove(kind: "event" | "arc" | "item", id: number) {
    if (
      !window.confirm(
        t(
          kind === "item"
            ? "item.deleteConfirmBody"
            : kind === "event"
              ? "deleteConfirmBody"
              : "arcos.deleteConfirm",
        ),
      )
    )
      return;
    try {
      if (kind === "event") await timelineApi.deleteEvent(slug, id);
      else if (kind === "arc") await timelineApi.deleteArc(slug, id);
      else await timelineApi.deleteItem(slug, id);
      reload((x) => x + 1);
    } catch (e) {
      setError(String(e));
    }
  }
  async function suggest() {
    if (editor?.kind !== "event" || !ia || !editor.draft.descricao.trim()) return;
    setSuggesting(true);
    try {
      const s = await timelineApi.suggestEvent(slug, editor.draft.descricao);
      if (s.estado === "sugestoes")
        patch({
          local_ids: [...new Set([...editor.draft.local_ids, ...s.local_ids])],
          personagem_ids: [...new Set([...editor.draft.personagem_ids, ...s.personagem_ids])],
        });
      else setMessage(t(s.estado === "vazio" ? "suggestEmpty" : "suggestFail"));
    } catch {
      setMessage(t("suggestFail"));
    } finally {
      setSuggesting(false);
    }
  }
  async function propose() {
    if (!ia) return;
    setSuggesting(true);
    setMessage("");
    try {
      const r = await timelineApi.proposeArcs(slug);
      setProposals(r.propostas);
      if (r.estado !== "propostas")
        setMessage(
          r.estado === "sessoes_insuficientes" ? t("arcos.insufficient") : t("arcos.proposalFail"),
        );
    } catch {
      setMessage(t("arcos.proposalFail"));
    } finally {
      setSuggesting(false);
    }
  }
  const sessions = data?.sessoes ?? [];
  const events = data?.eventos ?? [];
  const arcs = data?.arcos ?? [];
  const prepSessions = gm
    ? sessions.filter((s) => s.visivel_para_todos === false && Boolean(s.notas_preparo?.trim()))
    : [];
  const sorted = [...events].sort((a, b) => a.ano - b.ano || (a.mes ?? 0) - (b.mes ?? 0));
  const groups = new Map<string, Evento[]>();
  for (const e of sorted) {
    const k = `${e.rotulo_era || ""}|${e.ano}|${e.mes ?? ""}`;
    groups.set(k, [...(groups.get(k) ?? []), e]);
  }
  return (
    <main className="mx-auto min-h-screen max-w-6xl px-4 pt-24 pb-28 lg:pb-16">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="eyebrow">{t("v2.worldEvents")}</p>
          <h1 className="font-display text-4xl">{t("title")}</h1>
          <p className="text-muted-foreground">{t(gm ? "subtitleGm" : "subtitlePlayer")}</p>
        </div>
        {gm && (
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => editEvent()}>{t("new")}</Button>
            <Button variant="outline" onClick={() => setShowArcs(true)}>
              {t("arcos.manage")}
            </Button>
            {isDono && (
              <Button variant="outline" onClick={() => setShowItems(true)}>
                {t("item.section")}
              </Button>
            )}
            {ia && (
              <Button variant="outline" disabled={suggesting} onClick={() => void propose()}>
                {t(suggesting ? "arcos.generating" : "arcos.propose")}
              </Button>
            )}
          </div>
        )}
      </header>
      <nav className="mt-8 flex gap-2" aria-label={t("modeSelectorAria")}>
        {(["chron", "arcs", "discovery"] as const).map((m, i) => (
          <Button
            key={m}
            aria-pressed={mode === m}
            variant={mode === m ? "default" : "outline"}
            onClick={() => setMode(m)}
          >
            {t(["modeCronologico", "modeArcos", "modeDescoberta"][i]!)}
          </Button>
        ))}
      </nav>
      {prepSessions.length > 0 && (
        <aside className="mt-6 space-y-2 rounded-2xl border border-dashed border-border bg-card/60 p-4">
          <p className="text-sm font-medium">{t("prepSessionsHeading")}</p>
          <ul className="space-y-1 text-sm text-muted-foreground">
            {prepSessions.map((s) => (
              <li key={s.id}>
                {t("sessionMeta", { numero: s.numero, titulo: s.titulo })}
                <small className="ml-2">{t("prepNotesBadge")}</small>
                <small className="ml-2">{t("hiddenBadge")}</small>
              </li>
            ))}
          </ul>
        </aside>
      )}
      {error && (
        <p role="alert" className="mt-4 text-destructive">
          {error}
        </p>
      )}
      {message && (
        <p role="status" className="mt-4">
          {message}{" "}
          {(message === t("arcos.insufficient") || message === t("arcos.proposalFail")) && (
            <Button variant="outline" onClick={() => setShowArcs(true)}>
              {t("arcos.manage")}
            </Button>
          )}
        </p>
      )}
      {proposals.length > 0 && (
        <section className="mt-6 rounded-2xl border bg-card p-4">
          <h2 className="font-display text-xl">{t("arcos.proposals")}</h2>
          {proposals.map((p, i) => (
            <div key={i} className="mt-3 flex items-center justify-between">
              <span>
                {p.titulo} · {p.sessao_ids.length}
              </span>
              <Button
                onClick={() => {
                  setArcLocalIds(p.local_ids);
                  setEditor({
                    kind: "arc",
                    id: undefined,
                    draft: {
                      ...arcDraft(),
                      titulo: p.titulo,
                      resumo: p.resumo,
                      sessao_ids: p.sessao_ids,
                      sessao_transicao_id: p.sessao_transicao_id,
                    },
                  });
                }}
              >
                {t("arcos.review")}
              </Button>
              <Button
                variant="ghost"
                onClick={() => setProposals((current) => current.filter((_, index) => index !== i))}
              >
                {t("arcos.discard")}
              </Button>
            </div>
          ))}
        </section>
      )}
      {!data && !error && (
        <p role="status" className="mt-8">
          {tc("loading", { defaultValue: "Carregando…" })}
        </p>
      )}
      {data && mode === "chron" && (
        <section className="mt-8 space-y-7">
          {groups.size === 0 && <p>{t(gm ? "emptyGm" : "empty")}</p>}
          {[...groups].map(([key, list]) => (
            <div key={key}>
              <h2 className="mb-3 border-b pb-2 font-display text-2xl">
                {list[0]!.rotulo_era && <span>{list[0]!.rotulo_era} · </span>}
                {t(list[0]!.mes ? "yearMonthLabel" : "yearLabel", {
                  ano: list[0]!.ano,
                  mes: list[0]!.mes,
                })}
              </h2>
              <div className="space-y-3">
                {list.map((e) => (
                  <details key={e.id} className="rounded-2xl border bg-card p-5 shadow-float">
                    <summary className="cursor-pointer font-display text-xl">
                      {e.titulo}
                      {gm && e.visivel_para_todos === false && (
                        <small className="ml-2 text-muted-foreground">{t("hiddenBadge")}</small>
                      )}
                    </summary>
                    <div className="mt-4">
                      <RichContent markdown={e.descricao} />
                      <div className="mt-3 flex flex-wrap gap-2 text-sm text-muted-foreground">
                        {e.locais.map((x) => (
                          <span key={x.id}>{x.nome}</span>
                        ))}
                        {e.personagens.map((x) => (
                          <span key={x.id}>{x.nome}</span>
                        ))}
                        {e.sessao_id && (
                          <span>
                            {t("fieldSessao")}: {sessions.find((s) => s.id === e.sessao_id)?.titulo}
                          </span>
                        )}
                      </div>
                      {gm && (
                        <div className="mt-4 flex gap-2">
                          <Button variant="outline" onClick={() => editEvent(e)}>
                            {t("edit")}
                          </Button>
                          <Button variant="outline" onClick={() => void remove("event", e.id)}>
                            {t("delete")}
                          </Button>
                        </div>
                      )}
                    </div>
                  </details>
                ))}
              </div>
            </div>
          ))}
        </section>
      )}
      {data && mode === "arcs" && (
        <section className="mt-8">
          <label className="text-sm">
            {t("arcos.filterAria")}{" "}
            <select
              className="ml-2 rounded border bg-card p-2"
              value={filterArc}
              onChange={(e) => setFilterArc(e.target.value)}
            >
              <option value="all">{t("arcos.filterAll")}</option>
              {arcs.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.titulo}
                </option>
              ))}
              <option value="none">{t("arcos.semArco")}</option>
            </select>
          </label>
          {gm && (
            <div className="mt-4 flex flex-wrap gap-2">
              {arcs.map((a) => (
                <div
                  key={a.id}
                  className="flex items-center gap-1 rounded-xl border p-2"
                  style={{ borderColor: a.cor ?? undefined }}
                >
                  <span>{a.titulo}</span>
                  <Button size="sm" variant="ghost" onClick={() => editArc(a)}>
                    {t("arcos.edit")}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => void remove("arc", a.id)}>
                    {t("arcos.delete")}
                  </Button>
                </div>
              ))}
            </div>
          )}
          {sessions.length === 0 ? (
            <p className="mt-6">{t("arcos.emptyTitle")}</p>
          ) : (
            <ArcTimeline
              sessoes={sessions}
              eventos={events}
              arcos={arcs}
              filter={filterArc}
              gm={gm}
            />
          )}
        </section>
      )}
      {data && mode === "discovery" && (
        <section className="mt-8">
          <label>
            {t("descoberta.filterAria")}{" "}
            <select
              className="ml-2 rounded border bg-card p-2"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="all">{t("descoberta.filterTodos")}</option>
              {(["personagem", "local", "faccao", "item"] as const).map((k) => (
                <option key={k} value={k}>
                  {t(`descoberta.tipo_${k}`)}
                </option>
              ))}
            </select>
          </label>
          {gm &&
            isDono &&
            data.descoberta.alertas?.map((a, i) => (
              <p
                key={i}
                role="alert"
                className="mt-3 rounded border border-destructive p-3 text-destructive"
              >
                {t("descoberta.alerta", {
                  personagem: a.personagem_nome,
                  oculta: a.sessao_oculta_numero,
                  titulo: a.sessao_oculta_titulo,
                  visivel: a.sessao_visivel_numero,
                })}
              </p>
            ))}
          {data.descoberta.entidades.length === 0 ? (
            <div className="mt-8">
              <p>{t("descoberta.emptyTitle")}</p>
              <Button variant="outline" onClick={() => setMode("chron")}>
                {t("descoberta.backToCronologico")}
              </Button>
            </div>
          ) : (
            <>
              {filterType !== "all" &&
                !data.descoberta.entidades.some((entity) => entity.tipo === filterType) && (
                  <p className="mt-6 text-muted-foreground">{t("descoberta.filterEmpty")}</p>
                )}
              {(["personagem", "local", "faccao", "item"] as const)
                .filter((k) => filterType === "all" || filterType === k)
                .map((k) => (
                  <div key={k} className="mt-6">
                    <h2 className="font-display text-2xl">{t(`descoberta.tipo_${k}`)}</h2>
                    {data.descoberta.entidades
                      .filter((x) => x.tipo === k)
                      .map((x) => (
                        <article
                          key={`${k}:${x.id ?? x.nome}`}
                          className="mt-3 rounded-2xl border bg-card p-4"
                        >
                          <h3 className="font-display text-xl">{x.nome}</h3>
                          {x.descricao && <RichContent markdown={x.descricao} />}
                          <ol className="mt-3 space-y-2">
                            {x.aparicoes.map((a, i) => (
                              <li key={`${a.origem}:${a.id}`} className="text-sm">
                                <strong>
                                  {i === 0 ? t("descoberta.first") : t("descoberta.reappearance")}
                                </strong>{" "}
                                · {a.titulo}{" "}
                                {a.ano != null && `· ${a.ano}${a.mes ? `/${a.mes}` : ""}`}
                                {a.intervalo && (
                                  <span className="text-muted-foreground">
                                    {" "}
                                    ·{" "}
                                    {a.intervalo.anos
                                      ? `${t("arcos.elapsedYears", { count: a.intervalo.anos })} `
                                      : ""}
                                    {a.intervalo.meses
                                      ? t("arcos.elapsedMonths", { count: a.intervalo.meses })
                                      : ""}
                                    {a.intervalo.sessoes != null
                                      ? ` · ${t("descoberta.intervalSessions", { count: a.intervalo.sessoes })}`
                                      : ""}
                                  </span>
                                )}
                              </li>
                            ))}
                          </ol>
                        </article>
                      ))}
                  </div>
                ))}
            </>
          )}
        </section>
      )}
      {showArcs && (
        <Dialog open onOpenChange={setShowArcs}>
          <DialogContent className="max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{t("arcos.manage")}</DialogTitle>
            </DialogHeader>
            <Button
              onClick={() => {
                setShowArcs(false);
                editArc();
              }}
            >
              {t("arcos.new")}
            </Button>
            {arcs.map((a) => (
              <div key={a.id} className="flex justify-between border-b py-2">
                <span>{a.titulo}</span>
                <div>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setShowArcs(false);
                      editArc(a);
                    }}
                  >
                    {t("arcos.edit")}
                  </Button>
                  <Button variant="ghost" onClick={() => void remove("arc", a.id)}>
                    {t("arcos.delete")}
                  </Button>
                </div>
              </div>
            ))}
          </DialogContent>
        </Dialog>
      )}
      {showItems && (
        <Dialog open onOpenChange={setShowItems}>
          <DialogContent className="max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{t("item.section")}</DialogTitle>
            </DialogHeader>
            <Button
              onClick={() => {
                setShowItems(false);
                editItem();
              }}
            >
              {t("item.new")}
            </Button>
            {items.map((i) => (
              <div key={i.id} className="flex justify-between border-b py-2">
                <span>{i.nome}</span>
                <div>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setShowItems(false);
                      editItem(i);
                    }}
                  >
                    {t("item.edit")}
                  </Button>
                  <Button variant="ghost" onClick={() => void remove("item", i.id)}>
                    {t("item.delete")}
                  </Button>
                </div>
              </div>
            ))}
          </DialogContent>
        </Dialog>
      )}
      {editor && (
        <Dialog open onOpenChange={(v) => !v && setEditor(null)}>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editor.kind === "event"
                  ? t(editor.id ? "edit" : "new")
                  : editor.kind === "arc"
                    ? t(editor.id ? "arcos.edit" : "arcos.new")
                    : t(editor.id ? "item.edit" : "item.new")}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              {editor.kind === "event" && (
                <>
                  <label>
                    {t("fieldTitulo")}
                    <Input
                      value={editor.draft.titulo}
                      onChange={(e) => patch({ titulo: e.target.value })}
                    />
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <label>
                      {t("fieldAno")}
                      <Input
                        type="number"
                        value={editor.draft.ano}
                        onChange={(e) => patch({ ano: Number(e.target.value) })}
                      />
                    </label>
                    <label>
                      {t("fieldMes")}
                      <Input
                        type="number"
                        min={1}
                        max={12}
                        value={editor.draft.mes ?? ""}
                        onChange={(e) =>
                          patch({ mes: e.target.value ? Number(e.target.value) : null })
                        }
                      />
                    </label>
                  </div>
                  <label>
                    {t("fieldEra")}
                    <Input
                      value={editor.draft.rotulo_era ?? ""}
                      onChange={(e) => patch({ rotulo_era: e.target.value || null })}
                    />
                  </label>
                  <label>
                    {t("fieldDescricao")}
                    <Textarea
                      value={editor.draft.descricao}
                      onChange={(e) => patch({ descricao: e.target.value })}
                    />
                  </label>
                  {ia && (
                    <Button
                      variant="outline"
                      disabled={suggesting || !editor.draft.descricao.trim()}
                      onClick={() => void suggest()}
                    >
                      {t(suggesting ? "suggestLoading" : "suggestButton")}
                    </Button>
                  )}
                  {message && <p role="status">{message}</p>}
                  <label>
                    {t("fieldSessao")}
                    <select
                      className="block w-full rounded border bg-card p-2"
                      value={editor.draft.sessao_id ?? ""}
                      onChange={(e) =>
                        patch({ sessao_id: e.target.value ? Number(e.target.value) : null })
                      }
                    >
                      <option value="">{t("fieldSessaoNone")}</option>
                      {sessions.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.numero}. {s.titulo}
                        </option>
                      ))}
                    </select>
                  </label>
                  <Checks
                    label={t("fieldLocais")}
                    options={catalog.locais}
                    value={editor.draft.local_ids}
                    onChange={(v) => patch({ local_ids: v })}
                  />
                  <Checks
                    label={t("fieldPersonagens")}
                    options={catalog.personagens}
                    value={editor.draft.personagem_ids}
                    onChange={(v) => patch({ personagem_ids: v })}
                  />
                </>
              )}
              {editor.kind === "arc" && (
                <>
                  <label>
                    {t("fieldTitulo")}
                    <Input
                      value={editor.draft.titulo}
                      onChange={(e) => patch({ titulo: e.target.value })}
                    />
                  </label>
                  <label>
                    {t("arcos.summary")}
                    <Textarea
                      value={editor.draft.resumo}
                      onChange={(e) => patch({ resumo: e.target.value })}
                    />
                  </label>
                  <label>
                    {t("arcos.color")}
                    <Input
                      type="color"
                      value={editor.draft.cor ?? palette[0]}
                      onChange={(e) => patch({ cor: e.target.value })}
                    />
                  </label>
                  <label>
                    {t("arcos.order")}
                    <Input
                      type="number"
                      min={0}
                      value={editor.draft.ordem}
                      onChange={(e) => patch({ ordem: Number(e.target.value) })}
                    />
                  </label>
                  <Checks
                    label={t("arcos.locations")}
                    options={catalog.locais}
                    value={arcLocalIds}
                    onChange={setArcLocalIds}
                  />
                  <Checks
                    label={t("arcos.sessions")}
                    options={sessions.map((s) => ({ id: s.id, nome: `${s.numero}. ${s.titulo}` }))}
                    value={editor.draft.sessao_ids}
                    onChange={(v) => patch({ sessao_ids: v })}
                  />
                  <label>
                    {t("arcos.transition")}
                    <select
                      className="block w-full rounded border bg-card p-2"
                      value={editor.draft.sessao_transicao_id ?? ""}
                      onChange={(e) =>
                        patch({
                          sessao_transicao_id: e.target.value ? Number(e.target.value) : null,
                        })
                      }
                    >
                      <option value="">—</option>
                      {sessions.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.numero}. {s.titulo}
                        </option>
                      ))}
                    </select>
                  </label>
                </>
              )}
              {editor.kind === "item" && (
                <>
                  <label>
                    {t("item.fieldNome")}
                    <Input
                      value={editor.draft.nome}
                      onChange={(e) => patch({ nome: e.target.value })}
                    />
                  </label>
                  <label>
                    {t("item.fieldDescricao")}
                    <Textarea
                      value={editor.draft.descricao}
                      onChange={(e) => patch({ descricao: e.target.value })}
                    />
                  </label>
                  <Checks
                    label={t("item.fieldSessoes")}
                    options={sessions.map((s) => ({ id: s.id, nome: `${s.numero}. ${s.titulo}` }))}
                    value={editor.draft.sessao_ids}
                    onChange={(v) => patch({ sessao_ids: v })}
                  />
                  <Checks
                    label={t("item.fieldEventos")}
                    options={events.map((e) => ({ id: e.id, nome: e.titulo }))}
                    value={editor.draft.evento_ids}
                    onChange={(v) => patch({ evento_ids: v })}
                  />
                </>
              )}
              {error && (
                <p role="alert" className="text-sm text-destructive">
                  {error}
                </p>
              )}
              <label className="flex gap-2">
                <input
                  type="checkbox"
                  checked={editor.draft.visivel_para_todos}
                  onChange={(e) => patch({ visivel_para_todos: e.target.checked })}
                />
                {t("fieldVisivel")}
              </label>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditor(null)}>
                {tc("buttons.cancel")}
              </Button>
              <Button disabled={busy} onClick={() => void save()}>
                {tc("buttons.save", { defaultValue: "Salvar" })}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </main>
  );
}
