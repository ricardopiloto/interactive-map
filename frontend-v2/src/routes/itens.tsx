import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useCampaignKey } from "@/api/campaign";
import { ApiError } from "@/api/client";
import { listItensPublicos, timelineApi, type Item, type ItemPublico } from "@/api/timeline";
import { useEditMode } from "@/auth/EditModeContext";
import { RichContent } from "@/components/codex/RichContent";
import { badgeVariants } from "@/components/ui/badge";
import { Link, useNavigate, useSearch } from "@/lib/navigation";
import { cn } from "@/lib/utils";

type ItemView = ItemPublico & { visivel_para_todos?: boolean };

function EntityChip({
  kind,
  id,
  nome,
  numero,
}: {
  kind: "sessao" | "evento";
  id: number;
  nome: string;
  numero?: number;
}) {
  const { t } = useTranslation("itens");
  const label = kind === "sessao" ? t("chipSession") : t("chipEvent");
  const to = kind === "sessao" ? "/sessoes" : "/linha-do-tempo";
  const chipSearch = kind === "sessao" && numero != null ? { s: numero } : {};
  return (
    <Link
      to={to}
      search={chipSearch}
      className={cn(badgeVariants({ variant: "outline" }), "hover:border-seal hover:text-seal")}
    >
      <span className="sr-only">{label}: </span>
      {kind === "sessao" && numero != null ? `${String(numero).padStart(2, "0")} · ${nome}` : nome}
    </Link>
  );
}

function failure(error: unknown, fallback: string, translate: (key: string) => string) {
  if (error instanceof ApiError && error.codigo) {
    return translate(`errors.${error.codigo}`);
  }
  return fallback;
}

export function Items() {
  const slug = useCampaignKey();
  const { t } = useTranslation("itens");
  const { t: tc } = useTranslation("comum");
  const { enabled, ready, isDono } = useEditMode();
  const search = useSearch();
  const navigate = useNavigate();
  const [items, setItems] = useState<ItemView[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  // Modo GM (toggle) + dono: admin client (inclui ocultos). Caso contrário, lista pública.
  const asGm = ready && enabled && isDono;

  useEffect(() => {
    if (!ready) return;
    let active = true;
    setLoading(true);
    setError(null);
    const load = asGm
      ? timelineApi.items(slug).then((v) => v.itens as Item[])
      : listItensPublicos(slug).then((v) => v.itens);
    void load
      .then((rows) => {
        if (active) setItems(rows);
      })
      .catch((reason) => {
        if (active) {
          setItems([]);
          setError(
            failure(reason, t("loadError"), (key) => tc(key, { defaultValue: t("loadError") })),
          );
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [slug, asGm, ready, t, tc]);

  const requested = search["item"];
  const filtered = items.filter((item) =>
    item.nome.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()),
  );
  const selected =
    requested != null
      ? (items.find((item) => String(item.id) === requested) ?? null)
      : (filtered[0] ?? null);
  const notFound = requested != null && selected == null && !loading && error == null;

  function select(id?: number) {
    navigate({ search: id == null ? {} : { item: id }, replace: true });
  }

  return (
    <main className="mx-auto grid min-h-screen max-w-6xl gap-10 px-4 pt-24 pb-28 lg:grid-cols-[300px_1fr] lg:pb-16">
      <nav aria-label={t("listAria")} className="lg:sticky lg:top-24 lg:self-start">
        <p className="eyebrow">{t("eyebrow")}</p>
        <h1 className="mt-1 font-display text-3xl font-medium">{t("title")}</h1>
        {asGm && (
          <Link
            to="/linha-do-tempo"
            className="mt-4 inline-flex text-sm text-seal underline underline-offset-4 hover:text-foreground"
          >
            {t("manageLink")}
          </Link>
        )}
        {loading ? (
          <p role="status" className="mt-6 text-sm text-muted-foreground">
            {t("loading")}
          </p>
        ) : error ? (
          <p role="alert" className="mt-6 text-sm text-destructive">
            {error}
          </p>
        ) : items.length === 0 ? (
          <p className="mt-6 text-sm text-muted-foreground">{asGm ? t("emptyGm") : t("empty")}</p>
        ) : (
          <>
            <label className="mt-6 block">
              <span className="sr-only">{t("search")}</span>
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={t("searchPlaceholder")}
                aria-label={t("search")}
                className="w-full rounded-xl border border-border bg-card px-3 py-2 text-sm outline-none focus-visible:border-seal"
              />
            </label>
            <ol className="mt-4 flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:gap-0 lg:overflow-visible">
              {filtered.map((item) => (
                <li key={item.id} className="shrink-0">
                  <button
                    type="button"
                    onClick={() => select(item.id)}
                    aria-current={item.id === selected?.id ? "true" : undefined}
                    className={cn(
                      "flex w-full items-baseline gap-3 rounded-xl border border-transparent p-3 text-left transition-colors",
                      item.id === selected?.id
                        ? "border-border bg-card shadow-float"
                        : "hover:bg-accent",
                    )}
                  >
                    <span className="min-w-0">
                      <span className="block font-medium whitespace-nowrap lg:whitespace-normal">
                        {item.nome}
                      </span>
                      {asGm && item.visivel_para_todos === false && (
                        <span className={cn(badgeVariants({ variant: "secondary" }), "mt-1")}>
                          {t("hiddenBadge")}
                        </span>
                      )}
                    </span>
                  </button>
                </li>
              ))}
            </ol>
            {filtered.length === 0 && (
              <p className="mt-4 text-sm text-muted-foreground">
                {tc("empty.nenhumaCorrespondencia")}
              </p>
            )}
          </>
        )}
      </nav>

      {notFound ? (
        <p role="status" className="max-w-2xl text-sm text-muted-foreground">
          {t("notFound")}
        </p>
      ) : selected ? (
        <article className="max-w-2xl animate-in fade-in" key={selected.id}>
          <p className="eyebrow">{t("title")}</p>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <h2 className="font-display text-5xl leading-[1.05] font-medium text-balance md:text-6xl">
              {selected.nome}
            </h2>
            {asGm && selected.visivel_para_todos === false && (
              <span className={badgeVariants({ variant: "secondary" })}>{t("hiddenBadge")}</span>
            )}
          </div>
          <div className="my-8 h-px w-24 bg-seal" />
          {selected.descricao ? (
            <div className="font-display text-xl leading-[1.7] text-pretty">
              <RichContent markdown={selected.descricao} />
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">{t("noDescription")}</p>
          )}
          <footer className="mt-12 grid gap-6 border-t border-border pt-6 sm:grid-cols-2">
            <div>
              <h3 className="eyebrow mb-2">{t("sessions")}</h3>
              <div className="flex flex-wrap gap-1.5">
                {selected.sessoes.length === 0 ? (
                  <p className="text-sm text-muted-foreground">{tc("empty.nenhumItem")}</p>
                ) : (
                  selected.sessoes.map((sessao) => (
                    <EntityChip
                      key={sessao.id}
                      kind="sessao"
                      id={sessao.id}
                      nome={sessao.titulo}
                      numero={sessao.numero}
                    />
                  ))
                )}
              </div>
            </div>
            <div>
              <h3 className="eyebrow mb-2">{t("events")}</h3>
              <div className="flex flex-wrap gap-1.5">
                {selected.eventos.length === 0 ? (
                  <p className="text-sm text-muted-foreground">{tc("empty.nenhumItem")}</p>
                ) : (
                  selected.eventos.map((evento) => (
                    <EntityChip key={evento.id} kind="evento" id={evento.id} nome={evento.titulo} />
                  ))
                )}
              </div>
            </div>
          </footer>
        </article>
      ) : (
        !loading &&
        !error &&
        items.length > 0 && (
          <p className="max-w-2xl text-sm text-muted-foreground">{t("selectHint")}</p>
        )
      )}
    </main>
  );
}
