import { useState } from "react";
import { ChevronLeft, Pencil, Plus, Trash2 } from "lucide-react";
import { useOutletContext } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useCampaignKey, type CampaignConfig } from "@/api/campaign";
import { ApiError } from "@/api/client";
import {
  sessoesApi,
  useSessoes,
  type AlertaInconsistencia,
  type Sessao,
  type SessaoPayload,
} from "@/api/sessoes";
import { useEditMode } from "@/auth/EditModeContext";
import { SessionEditor, type SessaoDraft } from "@/components/codex/SessionEditor";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { badgeVariants } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link, useNavigate, useSearch } from "@/lib/navigation";
import { cn } from "@/lib/utils";

function failure(error: unknown, fallback: string, translate: (key: string) => string) {
  if (error instanceof ApiError && error.codigo) {
    return translate(`errors.${error.codigo}`);
  }
  return fallback;
}

function payloadOf(draft: SessaoDraft): SessaoPayload {
  return {
    numero: draft.numero,
    titulo: draft.titulo.trim(),
    data_rotulo: draft.data_rotulo.trim() || null,
    resumo: draft.resumo,
    notas_preparo: draft.notas_preparo,
    visivel_para_todos: draft.visivel_para_todos,
    local_ids: draft.local_ids,
    personagem_ids: draft.personagem_ids,
  };
}

function draftFrom(sessao: Sessao): SessaoDraft {
  return {
    isNew: false,
    id: sessao.id,
    numero: sessao.numero,
    titulo: sessao.titulo,
    data_rotulo: sessao.data_rotulo ?? "",
    resumo: sessao.resumo,
    notas_preparo: sessao.notas_preparo ?? "",
    visivel_para_todos: sessao.visivel_para_todos !== false,
    local_ids: sessao.locais.map((local) => local.id),
    personagem_ids: sessao.personagens.map((personagem) => personagem.id),
  };
}

function mergeIds(current: number[], suggested: number[]) {
  return [...new Set([...current, ...suggested])];
}

function EntityChip({
  kind,
  id,
  nome,
}: {
  kind: "local" | "personagem";
  id: number;
  nome: string;
}) {
  const { t } = useTranslation("sessoes");
  const label = kind === "local" ? t("chipLocal") : t("chipPersonagem");
  return (
    <Link
      to={kind === "local" ? "/" : "/relacoes"}
      search={kind === "local" ? { local: id } : { personagem: id }}
      className={cn(badgeVariants({ variant: "outline" }), "hover:border-seal hover:text-seal")}
    >
      <span className="sr-only">{label}: </span>
      {nome}
    </Link>
  );
}

function InconsistencyAlerts({ alertas }: { alertas: AlertaInconsistencia[] }) {
  const { t } = useTranslation("sessoes");
  if (alertas.length === 0) return null;
  return (
    <div className="mt-3 space-y-2">
      {alertas.map((alerta) => (
        <Alert key={`${alerta.personagem_id}:${alerta.sessao_oculta_id}`} variant="destructive">
          <AlertDescription>
            {t("alertaInconsistencia", {
              personagem: alerta.personagem_nome,
              numero: alerta.sessao_oculta_numero,
              titulo: alerta.sessao_oculta_titulo,
            })}
          </AlertDescription>
        </Alert>
      ))}
    </div>
  );
}

export function Sessions() {
  const slug = useCampaignKey();
  const config = useOutletContext<CampaignConfig>();
  const { t } = useTranslation("sessoes");
  const { t: tc } = useTranslation("comum");
  const { enabled, ready, isDono } = useEditMode();
  const search = useSearch();
  const navigate = useNavigate();
  const asGm = ready ? enabled : null;
  const { data, error, loading, reload } = useSessoes(slug, asGm);
  const [draft, setDraft] = useState<SessaoDraft | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [suggesting, setSuggesting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [sugestaoMsg, setSugestaoMsg] = useState<string | null>(null);

  const sessoes = data?.sessoes ?? [];
  const requested = Number(search["s"]);
  const matched = sessoes.find((sessao) => sessao.numero === requested) ?? null;
  /** Mobile: list when no `?s=`; detail only when the param matches a session. Desktop keeps list+detail. */
  const hasExplicitSession = matched != null;
  const current = matched ?? sessoes[0] ?? null;
  const iaAtiva = Boolean(config?.modulos_ativos.includes("ia_arcos"));
  const arcTitle = current?.arco_id
    ? data?.arcos.find((arco) => arco.id === current.arco_id)?.titulo
    : undefined;

  function explain(reason: unknown, fallback: string) {
    if (reason instanceof ApiError && reason.codigo) {
      const translated = tc(`errors.${reason.codigo}`, { defaultValue: "" });
      if (translated) return translated;
    }
    return fallback;
  }

  async function startCreate(options?: { preparar?: boolean }) {
    setFormError(null);
    setSugestaoMsg(null);
    setBusy(true);
    try {
      const { numero } = await sessoesApi.proximoNumero(slug);
      const preparar = Boolean(options?.preparar);
      setDraft({
        isNew: true,
        numero,
        titulo: "",
        data_rotulo: "",
        resumo: "",
        notas_preparo: "",
        visivel_para_todos: !preparar,
        local_ids: [],
        personagem_ids: [],
        focusNotasPreparo: preparar,
      });
    } catch (reason) {
      setFormError(explain(reason, t("saveError")));
    } finally {
      setBusy(false);
    }
  }

  async function suggest() {
    if (!draft || !iaAtiva || !draft.resumo.trim() || suggesting) return;
    setSuggesting(true);
    setSugestaoMsg(null);
    try {
      const resposta = await sessoesApi.sugerir(slug, draft.resumo);
      if (resposta.estado === "sugestoes") {
        setDraft((atual) =>
          atual
            ? {
                ...atual,
                local_ids: mergeIds(atual.local_ids, resposta.local_ids),
                personagem_ids: mergeIds(atual.personagem_ids, resposta.personagem_ids),
              }
            : atual,
        );
        return;
      }
      setSugestaoMsg(resposta.estado === "vazio" ? t("suggestEmpty") : t("suggestFail"));
    } catch (reason) {
      setSugestaoMsg(explain(reason, t("suggestFail")));
    } finally {
      setSuggesting(false);
    }
  }

  async function saveDraft() {
    if (!draft || !draft.titulo.trim()) return;
    setBusy(true);
    setFormError(null);
    const body = payloadOf(draft);
    try {
      const saved = draft.isNew
        ? await sessoesApi.create(slug, body)
        : await sessoesApi.update(slug, draft.id!, body);
      setDraft(null);
      navigate({ search: { s: saved.numero }, replace: true });
      reload();
    } catch (reason) {
      setFormError(explain(reason, t("saveError")));
    } finally {
      setBusy(false);
    }
  }

  async function confirmDelete() {
    const id = pendingDeleteId;
    if (id == null) return;
    setBusy(true);
    setFormError(null);
    try {
      await sessoesApi.remove(slug, id);
      if (current?.id === id) navigate({ search: {}, replace: true });
      setPendingDeleteId(null);
      reload();
    } catch (reason) {
      setFormError(explain(reason, t("saveError")));
      setPendingDeleteId(null);
    } finally {
      setBusy(false);
    }
  }

  const meta = current
    ? [
        t("v2.session", { number: current.numero }),
        current.data_rotulo,
        arcTitle ? t("v2.arc", { arc: arcTitle }) : null,
      ]
        .filter(Boolean)
        .join(" · ")
    : "";

  return (
    <main className="scroll-ink mx-auto grid fixed inset-0 max-w-6xl gap-10 overflow-y-auto px-4 pt-24 pb-28 lg:grid-cols-[300px_1fr] lg:grid-rows-1 lg:overflow-hidden lg:pb-16">
      <nav
        aria-label={t("v2.archive")}
        className={cn(
          "scroll-ink lg:h-full lg:min-h-0 lg:overflow-y-auto lg:pr-1",
          hasExplicitSession && "hidden lg:block",
        )}
      >
        <p className="eyebrow">{t("v2.tableJournal")}</p>
        <h1 className="mt-1 font-display text-3xl font-medium">{t("v2.sessionsTitle")}</h1>
        {enabled && (
          <div className="mt-4 flex flex-wrap gap-2">
            <Button type="button" onClick={() => void startCreate()} disabled={busy}>
              <Plus aria-hidden /> {t("new")}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => void startCreate({ preparar: true })}
              disabled={busy}
            >
              {t("prepareNext")}
            </Button>
          </div>
        )}
        {loading ? (
          <p role="status" className="mt-6 text-sm text-muted-foreground">
            {t("loading")}
          </p>
        ) : error ? (
          <p role="alert" className="mt-6 text-sm text-destructive">
            {failure(error, t("loadError"), (key) => tc(key, { defaultValue: t("loadError") }))}
          </p>
        ) : sessoes.length === 0 ? (
          <p className="mt-6 text-sm text-muted-foreground">
            {enabled ? t("emptyGm") : t("empty")}
          </p>
        ) : (
          <ol className="mt-6 flex flex-col gap-0">
            {sessoes.map((sessao) => {
              const selectedExplicit = hasExplicitSession && sessao.id === matched.id;
              const selectedDesktopDefault = !hasExplicitSession && sessao.id === current?.id;
              return (
                <li key={sessao.id}>
                  <Link
                    to="/sessoes"
                    search={{ s: sessao.numero }}
                    className={cn(
                      "flex items-baseline gap-4 rounded-xl border border-transparent p-3 transition-colors hover:bg-accent",
                      selectedExplicit && "border-border bg-card shadow-float hover:bg-card",
                      selectedDesktopDefault &&
                        "lg:border-border lg:bg-card lg:shadow-float lg:hover:bg-card",
                    )}
                    aria-current={selectedExplicit ? "page" : undefined}
                  >
                    <span
                      className={cn(
                        "font-display text-2xl tabular-nums text-muted-foreground lg:text-3xl",
                        selectedExplicit && "text-seal",
                        selectedDesktopDefault && "lg:text-seal",
                      )}
                    >
                      {String(sessao.numero).padStart(2, "0")}
                    </span>
                    <span className="min-w-0">
                      <span className="block font-medium whitespace-normal">{sessao.titulo}</span>
                      {sessao.data_rotulo && (
                        <span className="block font-mono text-[11px] text-muted-foreground">
                          {sessao.data_rotulo}
                        </span>
                      )}
                      {enabled && sessao.visivel_para_todos === false && (
                        <span className={cn(badgeVariants({ variant: "secondary" }), "mt-1")}>
                          {t("hiddenBadge")}
                        </span>
                      )}
                    </span>
                  </Link>
                  {isDono && <InconsistencyAlerts alertas={sessao.alertas_inconsistencia ?? []} />}
                </li>
              );
            })}
          </ol>
        )}
      </nav>

      {current && (
        <article
          className={cn(
            "scroll-ink max-w-2xl animate-in fade-in lg:h-full lg:min-h-0 lg:overflow-y-auto lg:pr-1",
            !hasExplicitSession && "hidden lg:block",
          )}
          key={current.id}
        >
          <Link
            to="/sessoes"
            search={{}}
            className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground lg:hidden"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden />
            {t("v2.backToList")}
          </Link>
          <div className="flex items-start justify-between gap-4">
            <p className="eyebrow">{meta}</p>
            {enabled && (
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  aria-label={t("edit")}
                  onClick={() => {
                    setFormError(null);
                    setSugestaoMsg(null);
                    setDraft(draftFrom(current));
                  }}
                >
                  <Pencil aria-hidden />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  aria-label={t("delete")}
                  onClick={() => setPendingDeleteId(current.id)}
                >
                  <Trash2 aria-hidden />
                </Button>
              </div>
            )}
          </div>
          <h2 className="mt-3 font-display text-5xl leading-[1.05] font-medium text-balance md:text-6xl">
            {current.titulo}
          </h2>
          {formError && !draft && (
            <p role="alert" className="mt-4 text-sm text-destructive">
              {formError}
            </p>
          )}
          <div className="my-8 h-px w-24 bg-seal" />
          {enabled && current.notas_preparo?.trim() && (
            <section className="mb-8">
              <h3 className="eyebrow mb-2">{t("fieldNotasPreparo")}</h3>
              <div className="font-display text-lg leading-[1.7] text-pretty text-muted-foreground">
                <RichContent markdown={current.notas_preparo} />
              </div>
            </section>
          )}
          {current.resumo && (
            <div className="drop-cap font-display text-xl leading-[1.7] text-pretty">
              <RichContent markdown={current.resumo} />
            </div>
          )}
          <footer className="mt-12 grid gap-6 border-t border-border pt-6 sm:grid-cols-2">
            <div>
              <h3 className="eyebrow mb-2">{t("v2.placesVisited")}</h3>
              <div className="flex flex-wrap gap-1.5">
                {current.locais.map((local) => (
                  <EntityChip key={local.id} kind="local" id={local.id} nome={local.nome} />
                ))}
              </div>
            </div>
            <div>
              <h3 className="eyebrow mb-2">{t("v2.whoWasThere")}</h3>
              <div className="flex flex-wrap gap-1.5">
                {current.personagens.map((personagem) => (
                  <EntityChip
                    key={personagem.id}
                    kind="personagem"
                    id={personagem.id}
                    nome={personagem.nome}
                  />
                ))}
              </div>
            </div>
          </footer>
        </article>
      )}

      {draft && (
        <SessionEditor
          draft={draft}
          locais={data?.locais ?? []}
          personagens={data?.personagens ?? []}
          iaAtiva={iaAtiva}
          busy={busy}
          suggesting={suggesting}
          sugestaoMsg={sugestaoMsg}
          error={formError}
          onChange={(patch) => setDraft((atual) => (atual ? { ...atual, ...patch } : atual))}
          onSuggest={() => void suggest()}
          onSave={() => void saveDraft()}
          onCancel={() => {
            setDraft(null);
            setFormError(null);
            setSugestaoMsg(null);
          }}
        />
      )}

      <AlertDialog
        open={pendingDeleteId != null}
        onOpenChange={(open) => !open && setPendingDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("deleteConfirmTitle")}</AlertDialogTitle>
            <AlertDialogDescription>{t("deleteConfirmBody")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{tc("buttons.cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={() => void confirmDelete()}>
              {tc("buttons.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}
