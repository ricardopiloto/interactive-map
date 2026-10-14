import { Eye, EyeOff, MapPin, Navigation, Pencil, Plus, Trash2, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "@/lib/navigation";
import { RichContent } from "@/components/codex/RichContent";
import type { Arco, Local, Npc } from "@/api/map";

const chip =
  "inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-2.5 py-1 text-xs font-medium text-foreground transition-colors hover:border-seal hover:text-seal";

export function LocationInspector({
  local,
  locais,
  npcs,
  arco,
  editing,
  onClose,
  onEdit,
  onDelete,
  onToggleVisibility,
  onEditNpc,
  onNewNpc,
}: {
  local: Local;
  locais: Local[];
  npcs: Npc[];
  arco: Arco | null;
  editing: boolean;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onToggleVisibility: () => void;
  onEditNpc: (npc: Npc) => void;
  onNewNpc: () => void;
}) {
  const { t } = useTranslation("mapa");
  const { t: tc } = useTranslation("comum");
  const { t: ta } = useTranslation("admin");
  const present = npcs.filter((npc) => local.npc_ids.includes(npc.id));
  const exits = local.saida_ids
    .map((id) => locais.find((item) => item.id === id))
    .filter((item): item is Local => item != null);
  const visited = local.estado_exploracao === "visitado";

  return (
    <aside
      aria-label={t("v2.details", { name: local.nome })}
      className="glass animate-in slide-in-from-bottom-6 lg:slide-in-from-right-6 absolute inset-x-2 bottom-20 z-20 flex max-h-[62vh] flex-col overflow-hidden rounded-2xl fade-in duration-300 lg:inset-x-auto lg:top-20 lg:right-4 lg:bottom-4 lg:max-h-none lg:w-[420px]"
    >
      <div className="mx-auto mt-2 h-1 w-10 rounded-full bg-border lg:hidden" aria-hidden />
      <div className="overflow-y-auto">
        {local.imagem_url ? (
          <img
            src={local.imagem_url}
            alt={t("v2.illustration", { name: local.nome })}
            className="aspect-[16/9] w-full object-cover"
          />
        ) : (
          <div className="h-2" />
        )}
        <div className="p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="eyebrow">
                {visited ? t("v2.visited") : t("v2.known")}
                {local.visivel_para_todos === false
                  ? ` · ${ta("localForm.ocultoAosJogadores")}`
                  : ""}
              </p>
              <h1 className="mt-1 font-display text-3xl leading-tight font-medium">{local.nome}</h1>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full hover:bg-accent"
              aria-label={t("v2.closeDetails")}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          {arco && <p className="mt-1 text-sm text-seal">{arco.titulo}</p>}
          {editing && (
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={onEdit}
                className="flex items-center gap-1.5 rounded-full border border-edit px-3 py-1.5 text-xs font-medium hover:bg-edit/15"
              >
                <Pencil className="h-3.5 w-3.5" /> {t("v2.edit")}
              </button>
              <button
                type="button"
                onClick={onToggleVisibility}
                className="flex items-center gap-1.5 rounded-full border border-edit px-3 py-1.5 text-xs font-medium hover:bg-edit/15"
              >
                {local.visivel_para_todos === false ? (
                  <Eye className="h-3.5 w-3.5" />
                ) : (
                  <EyeOff className="h-3.5 w-3.5" />
                )}
                {local.visivel_para_todos === false ? t("v2.showPlayers") : t("v2.hidePlayers")}
              </button>
              <button
                type="button"
                onClick={onDelete}
                className="flex items-center gap-1.5 rounded-full border border-edit px-3 py-1.5 text-xs font-medium hover:bg-edit/15"
              >
                <Trash2 className="h-3.5 w-3.5" /> {tc("buttons.delete")}
              </button>
            </div>
          )}
          <div className="mt-4 font-display text-[17px] leading-relaxed">
            {local.descricao.trim() ? (
              <RichContent markdown={local.descricao} />
            ) : (
              <p className="text-sm text-muted-foreground">{t("panel.noDescription")}</p>
            )}
          </div>
          <div className="mt-5 flex gap-2">
            <Link
              to="/rota"
              search={{ para: local.id }}
              className="flex flex-1 items-center justify-center gap-2 rounded-full bg-primary px-4 py-3 text-sm font-medium text-primary-foreground hover:opacity-90"
            >
              <Navigation className="h-4 w-4" /> {t("v2.travelHere")}
            </Link>
          </div>
          <section className="mt-5 border-t border-border pt-4">
            <div className="mb-2.5 flex items-center justify-between gap-2">
              <h2 className="eyebrow">{t("v2.relatedCharacters")}</h2>
              {editing && (
                <button
                  type="button"
                  onClick={onNewNpc}
                  className="flex items-center gap-1 text-xs font-medium text-seal"
                >
                  <Plus className="h-3.5 w-3.5" /> {t("mapPage.newNpc")}
                </button>
              )}
            </div>
            {present.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t("panel.empty")}</p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {present.map((npc) => (
                  <span key={npc.id} className="inline-flex items-center gap-1">
                    <Link to="/relacoes" search={{ personagem: npc.id }} className={chip}>
                      {npc.nome}
                    </Link>
                    {editing && (
                      <button
                        type="button"
                        className="rounded-full p-1 hover:bg-accent"
                        aria-label={`${t("v2.edit")} ${npc.nome}`}
                        onClick={() => onEditNpc(npc)}
                      >
                        <Pencil className="h-3 w-3" />
                      </button>
                    )}
                  </span>
                ))}
              </div>
            )}
          </section>
          {exits.length > 0 && (
            <section className="mt-5 border-t border-border pt-4">
              <h2 className="eyebrow mb-2.5">{t("panel.exits")}</h2>
              <div className="flex flex-wrap gap-1.5">
                {exits.map((exit) => (
                  <Link key={exit.id} to="/" search={{ local: exit.id }} className={chip}>
                    <MapPin className="h-3 w-3" aria-hidden />
                    {exit.nome}
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </aside>
  );
}
