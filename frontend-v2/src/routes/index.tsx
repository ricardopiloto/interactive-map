import { useEffect, useRef, useState } from "react";
import { useOutletContext, useParams } from "react-router-dom";
import { Footprints, Plus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { ApiError, api, campaignPath } from "@/api/client";
import type { CampaignConfig } from "@/api/campaign";
import {
  localPayload,
  mapApi,
  useMapData,
  type GrupoFormato,
  type Local,
  type Npc,
} from "@/api/map";
import { useEditMode } from "@/auth/EditModeContext";
import { LocationInspector } from "@/components/codex/LocationInspector";
import { LocalEditor, NpcEditor } from "@/components/codex/MapEditors";
import {
  emptyLocalDraft,
  emptyNpcDraft,
  localToDraft,
  npcToDraft,
  type LocalDraft,
  type NpcDraft,
} from "@/components/codex/map-drafts";
import { WorldMap } from "@/components/codex/WorldMap";
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
import { useIsMobile } from "@/hooks/use-mobile";
import { useNavigate, useSearch } from "@/lib/navigation";

type Placement = "none" | "add" | "reposition" | "move-group";

function message(error: unknown, fallback: string) {
  return error instanceof ApiError && error.codigo ? error.codigo : fallback;
}

export function MapPage() {
  const { slug = "" } = useParams();
  const config = useOutletContext<CampaignConfig>();
  const { t } = useTranslation("mapa");
  const { t: tc } = useTranslation("comum");
  const { t: ta } = useTranslation("admin");
  const { enabled: editing } = useEditMode();
  const search = useSearch();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { data, error, loading, reload } = useMapData(slug, editing);
  const [mapUrl, setMapUrl] = useState<string | null | undefined>(undefined);
  const [placement, setPlacement] = useState<Placement>("none");
  const [localDraft, setLocalDraft] = useState<LocalDraft | null>(null);
  const [npcDraft, setNpcDraft] = useState<NpcDraft | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ kind: "local" | "npc"; id: number } | null>(
    null,
  );
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [retryPoint, setRetryPoint] = useState<{ x: number; y: number } | null>(null);
  const replaceRef = useRef<HTMLInputElement>(null);
  const locais = data?.locais ?? [];
  const npcs = data?.npcs ?? [];
  const selected = locais.find((local) => String(local.id) === search["local"]) ?? null;
  const image = mapUrl === undefined ? config.map_url : mapUrl;
  const visited = locais.filter((local) => local.estado_exploracao === "visitado").length;

  useEffect(() => {
    if (editing) return;
    setPlacement("none");
    setLocalDraft(null);
    setNpcDraft(null);
    setDeleteTarget(null);
  }, [editing]);

  function select(id?: number) {
    navigate({ search: id == null ? {} : { local: id }, replace: true });
  }

  async function saveLocal() {
    if (!localDraft || !localDraft.nome.trim()) return;
    setBusy(true);
    setNotice(null);
    try {
      const payload = {
        nome: localDraft.nome.trim(),
        descricao: localDraft.descricao,
        x: localDraft.x,
        y: localDraft.y,
        imagem_url: localDraft.imagem_url,
        data_sessao: localDraft.data_sessao.trim() || null,
        estado_exploracao: localDraft.estado_exploracao,
        arco_id: localDraft.arco_id,
        npc_ids: localDraft.npc_ids,
        saida_ids: localDraft.saida_ids,
        cor_pin: localDraft.cor_pin,
        waypoint_id: localDraft.waypoint_id,
        visivel_para_todos: localDraft.visivel_para_todos,
      };
      const saved = localDraft.isNew
        ? await mapApi.createLocal(slug, payload)
        : await mapApi.updateLocal(slug, localDraft.id!, payload);
      setLocalDraft(null);
      setPlacement("none");
      reload();
      select(saved.id);
    } catch (reason) {
      setNotice(message(reason, t("mapPage.saveLocalError")));
    } finally {
      setBusy(false);
    }
  }

  async function syncNpcPlaces(npcId: number, localIds: number[]) {
    const current = data?.locais ?? [];
    for (const local of current) {
      const should = localIds.includes(local.id);
      const has = local.npc_ids.includes(npcId);
      if (should === has) continue;
      const npc_ids = should
        ? [...local.npc_ids, npcId]
        : local.npc_ids.filter((id) => id !== npcId);
      await mapApi.updateLocal(slug, local.id, localPayload(local, { npc_ids }));
    }
  }

  async function saveNpc() {
    if (!npcDraft || !npcDraft.nome.trim()) return;
    setBusy(true);
    setNotice(null);
    try {
      const payload = {
        nome: npcDraft.nome.trim(),
        tipo: "npc" as const,
        papel: npcDraft.papel.trim() || null,
        descricao: npcDraft.descricao,
        faccao: npcDraft.faccao.trim() || null,
        status: npcDraft.status,
        retrato_url: npcDraft.retrato_url,
      };
      const saved = npcDraft.isNew
        ? await mapApi.createNpc(slug, payload)
        : await mapApi.updateNpc(slug, npcDraft.id!, payload);
      await syncNpcPlaces(saved.id, npcDraft.localIds);
      setNpcDraft(null);
      reload();
    } catch (reason) {
      setNotice(message(reason, t("mapPage.saveNpcError")));
    } finally {
      setBusy(false);
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setBusy(true);
    setNotice(null);
    try {
      if (deleteTarget.kind === "local") {
        await mapApi.deleteLocal(slug, deleteTarget.id);
        if (selected?.id === deleteTarget.id) select(undefined);
      } else {
        await mapApi.deleteNpc(slug, deleteTarget.id);
      }
      setDeleteTarget(null);
      reload();
    } catch (reason) {
      setNotice(message(reason, t("mapPage.saveLocalError")));
    } finally {
      setBusy(false);
    }
  }

  async function saveGroup(x: number, y: number, formato?: GrupoFormato) {
    if (!data) return;
    setBusy(true);
    setNotice(null);
    setRetryPoint({ x, y });
    try {
      await mapApi.updateGrupo(slug, {
        x,
        y,
        formato: formato ?? data.grupo.formato,
      });
      setRetryPoint(null);
      setPlacement("none");
      reload();
    } catch {
      setNotice(t("mapPage.saveGroupError"));
    } finally {
      setBusy(false);
    }
  }

  async function changeFormato(formato: GrupoFormato) {
    if (!data) return;
    setNotice(null);
    try {
      await mapApi.updateGrupo(slug, { x: data.grupo.x, y: data.grupo.y, formato });
      reload();
    } catch {
      setNotice(t("mapPage.saveGroupFormatError"));
    }
  }

  async function toggleVisibility(local: Local) {
    setNotice(null);
    try {
      await mapApi.updateLocal(
        slug,
        local.id,
        localPayload(local, { visivel_para_todos: local.visivel_para_todos === false }),
      );
      reload();
    } catch (reason) {
      setNotice(message(reason, t("mapPage.saveLocalError")));
    }
  }

  async function upload(category: "map" | "locals" | "portraits", file: File) {
    const uploaded = await mapApi.upload(slug, category, file);
    return uploaded.url;
  }

  async function replaceMap(file: File) {
    setNotice(null);
    try {
      await upload("map", file);
      const next = await api.get<CampaignConfig>(campaignPath(slug, "config"));
      setMapUrl(next.map_url);
    } catch (reason) {
      setNotice(message(reason, tc("image.uploadFail")));
    }
  }

  function place(point: { x: number; y: number }) {
    if (placement === "add") {
      setLocalDraft(emptyLocalDraft(point.x, point.y, data?.arcos[0]?.id ?? null));
      setPlacement("none");
    } else if (placement === "reposition" && localDraft) {
      setLocalDraft({ ...localDraft, x: point.x, y: point.y });
      setPlacement("none");
    } else if (placement === "move-group") {
      void saveGroup(point.x, point.y);
    }
  }

  const placeLabel =
    placement === "move-group"
      ? t("mapPage.moveGroupHint")
      : placement === "reposition"
        ? t("mapPage.repositionLocalHint")
        : t("panel.addHint");

  return (
    <main className="fixed inset-0">
      {loading && !data && (
        <p role="status" className="absolute top-20 left-4 z-20 text-sm">
          {tc("loading.campaign")}
        </p>
      )}
      {error && (
        <p role="alert" className="absolute top-20 left-4 z-20 text-sm">
          {tc("errors.loadData")}
        </p>
      )}
      {notice && (
        <p
          role="alert"
          className="glass absolute top-20 left-1/2 z-30 -translate-x-1/2 rounded-full px-4 py-2 text-sm"
        >
          {notice}
        </p>
      )}
      <WorldMap
        pins={locais.map((local) => ({
          id: String(local.id),
          name: local.nome,
          x: local.x * 100,
          y: local.y * 100,
          visited: local.estado_exploracao === "visitado",
          color: local.cor_pin,
        }))}
        selected={selected ? String(selected.id) : undefined}
        onSelect={(id) => {
          if (placement !== "none") return;
          select(Number(id));
        }}
        mapUrl={image}
        group={
          data
            ? { x: data.grupo.x * 100, y: data.grupo.y * 100, formato: data.grupo.formato }
            : null
        }
        focusOffsetX={selected && !isMobile ? 440 : 0}
        interactive={placement === "none"}
        placing={placement !== "none"}
        placeLabel={placeLabel}
        onPlace={place}
        onReplaceMap={editing ? () => replaceRef.current?.click() : undefined}
      >
        {!image && (
          <p className="absolute top-24 left-4 z-10 max-w-xs text-sm text-muted-foreground">
            {t("v2.noMap")}
          </p>
        )}
        {placement !== "none" && (
          <div className="glass absolute top-20 left-1/2 z-20 flex -translate-x-1/2 items-center gap-3 rounded-full px-4 py-2 text-sm">
            <span>
              {busy && placement === "move-group" ? t("mapPage.savingGroup") : placeLabel}
            </span>
            {retryPoint && !busy && (
              <button
                type="button"
                className="underline"
                onClick={() => void saveGroup(retryPoint.x, retryPoint.y)}
              >
                {t("mapPage.retryGroupSave")}
              </button>
            )}
            {!busy && (
              <button
                type="button"
                className="underline"
                onClick={() => {
                  setPlacement("none");
                  setRetryPoint(null);
                  setNotice(null);
                }}
              >
                {t("mapPage.cancelPlacement")}
              </button>
            )}
          </div>
        )}
        {!selected && placement === "none" && (
          <div className="absolute bottom-24 left-3 z-10 w-[min(320px,calc(100vw-90px))] lg:bottom-6 lg:left-4">
            <div className="glass rounded-2xl p-4">
              <p className="eyebrow">{t("v2.where")}</p>
              <p className="mt-1 flex items-center gap-2 font-display text-xl">
                <Footprints className="h-4 w-4 text-verdigris" /> {t("v2.group")}
              </p>
              <div className="mt-4 flex items-center gap-4 border-t border-border pt-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <span className="h-3 w-3 rounded-full border-2 border-card bg-primary" />
                  {t("v2.visited")} ({visited})
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-3 w-3 rounded-full border-2 border-dashed border-primary bg-card" />
                  {t("v2.known")} ({locais.length - visited})
                </span>
              </div>
            </div>
            {editing && data && (
              <div className="mt-2 flex flex-col gap-2">
                <button
                  type="button"
                  className="flex w-full items-center justify-center gap-2 rounded-full border-2 border-dashed border-edit bg-card py-2.5 text-sm font-medium"
                  onClick={() => {
                    setLocalDraft(null);
                    select(undefined);
                    setPlacement("add");
                  }}
                >
                  <Plus className="h-4 w-4" /> {t("v2.addPlace")}
                </button>
                <button
                  type="button"
                  className="glass rounded-full py-2 text-sm"
                  onClick={() => setNpcDraft(emptyNpcDraft())}
                >
                  {t("mapPage.newNpc")}
                </button>
              </div>
            )}
          </div>
        )}
        {editing && data && placement === "none" && (
          <div className="absolute top-20 left-4 z-20 flex flex-col gap-2">
            <button
              type="button"
              className="glass rounded-full px-4 py-2 text-sm"
              onClick={() => setPlacement("move-group")}
            >
              {t("panel.moveGroup")}
            </button>
            <button
              type="button"
              className="glass rounded-full px-4 py-2 text-sm"
              onClick={() =>
                void changeFormato(data.grupo.formato === "brasao" ? "bandeira" : "brasao")
              }
            >
              {data.grupo.formato === "brasao"
                ? t("panel.formatoBandeira")
                : t("panel.formatoBrasao")}
            </button>
          </div>
        )}
        {selected && placement === "none" && data && (
          <LocationInspector
            local={selected}
            locais={locais}
            npcs={npcs}
            arco={data.arcos.find((arco) => arco.id === selected.arco_id) ?? null}
            editing={editing}
            onClose={() => select(undefined)}
            onEdit={() => setLocalDraft(localToDraft(selected))}
            onDelete={() => setDeleteTarget({ kind: "local", id: selected.id })}
            onToggleVisibility={() => void toggleVisibility(selected)}
            onEditNpc={(npc: Npc) => setNpcDraft(npcToDraft(npc))}
            onNewNpc={() => setNpcDraft(emptyNpcDraft(selected.id))}
          />
        )}
      </WorldMap>
      <input
        ref={replaceRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        hidden
        aria-label={t("controls.replaceMap")}
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = "";
          if (file) void replaceMap(file);
        }}
      />
      {localDraft && placement === "none" && data && (
        <LocalEditor
          draft={localDraft}
          locais={locais}
          npcs={npcs}
          arcos={data.arcos}
          waypoints={data.waypoints}
          busy={busy}
          onChange={(patch) => setLocalDraft({ ...localDraft, ...patch })}
          onUploadImage={(file) => {
            void upload("locals", file)
              .then((url) =>
                setLocalDraft((current) => (current ? { ...current, imagem_url: url } : current)),
              )
              .catch((reason: unknown) => setNotice(message(reason, tc("image.uploadFail"))));
          }}
          onReposition={() => setPlacement("reposition")}
          onSave={() => void saveLocal()}
          onCancel={() => setLocalDraft(null)}
        />
      )}
      {npcDraft && (
        <NpcEditor
          draft={npcDraft}
          locais={locais}
          busy={busy}
          onChange={(patch) => setNpcDraft({ ...npcDraft, ...patch })}
          onUploadPortrait={(file) => {
            void upload("portraits", file)
              .then((url) =>
                setNpcDraft((current) => (current ? { ...current, retrato_url: url } : current)),
              )
              .catch((reason: unknown) => setNotice(message(reason, tc("image.uploadFail"))));
          }}
          onSave={() => void saveNpc()}
          onDelete={
            npcDraft.id == null
              ? undefined
              : () => {
                  const id = npcDraft.id!;
                  setNpcDraft(null);
                  setDeleteTarget({ kind: "npc", id });
                }
          }
          onCancel={() => setNpcDraft(null)}
        />
      )}
      <AlertDialog
        open={deleteTarget != null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {deleteTarget?.kind === "npc" ? ta("npc.confirmDelete") : ta("local.confirmDelete")}
            </AlertDialogTitle>
            <AlertDialogDescription>{tc("buttons.delete")}</AlertDialogDescription>
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
