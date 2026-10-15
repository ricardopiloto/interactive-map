import { useEffect, useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useCampaignKey, type CampaignConfig } from "@/api/campaign";
import type { Local, Waypoint } from "@/api/map";
import { ApiError } from "@/api/client";
import {
  routeApi,
  useRouteBundle,
  type MapPoint,
  type RoutePlanItem,
  type RouteSegment,
  type RouteTipo,
} from "@/api/routes";
import { useEditMode } from "@/auth/EditModeContext";
import { RouteNetworkEditor } from "@/components/codex/RouteNetworkEditor";
import { RoutePlannerPanel, type TravelOptions } from "@/components/codex/RoutePlannerPanel";
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
import { useNavigate, useSearch } from "@/lib/navigation";
import {
  distanceUnit,
  FINISH_SNAP,
  locaisById,
  namedWaypointOptions,
  nearestWaypoint,
  polylinePath,
  segmentPoints,
  tipoColor,
  tipoDash,
  waypointOptionLabel,
} from "@/lib/routeView";

type Surface = "plan" | "network";
type DrawMode = "idle" | "place-node" | "draw-segment" | "move-node";

const noLocais: Local[] = [];
const noWaypoints: Waypoint[] = [];
const noSegments: RouteSegment[] = [];

const initialTravel: TravelOptions = {
  ritmo: "normal",
  modo: "pago",
  ordenacao: "mais_rapida",
  preferencia: "nenhuma",
  velocidade: "4",
};

function message(error: unknown, fallback: string) {
  return error instanceof ApiError && error.codigo ? error.codigo : fallback;
}

function readId(value: string | undefined): number | null {
  if (!value) return null;
  const parsed = Number(value);
  return Number.isInteger(parsed) ? parsed : null;
}

export function RoutePage() {
  const slug = useCampaignKey();
  const config = useOutletContext<CampaignConfig>();
  const { enabled: editing } = useEditMode();
  const { t } = useTranslation("mapa");
  const { t: ta } = useTranslation("admin");
  const { t: tc } = useTranslation("comum");
  const search = useSearch();
  const navigate = useNavigate();
  const bundle = useRouteBundle(slug, editing);
  const [surface, setSurface] = useState<Surface>("plan");
  const [origemId, setOrigemId] = useState<number | null>(() => readId(search["de"]));
  const [destinoId, setDestinoId] = useState<number | null>(() => readId(search["para"]));
  const [travel, setTravel] = useState<TravelOptions>(initialTravel);
  const [plan, setPlan] = useState<RoutePlanItem[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [mode, setMode] = useState<DrawMode>("idle");
  const [nodeName, setNodeName] = useState("");
  const [segTipo, setSegTipo] = useState<RouteTipo>("estrada");
  const [draftOrigin, setDraftOrigin] = useState<number | null>(null);
  const [draftMids, setDraftMids] = useState<MapPoint[]>([]);
  const [selectedNode, setSelectedNode] = useState<number | null>(null);
  const [pendingDelete, setPendingDelete] = useState<{
    kind: "waypoint" | "segment";
    id: number;
  } | null>(null);

  const locais = bundle.data?.locais ?? noLocais;
  const waypoints = bundle.data?.waypoints ?? noWaypoints;
  const segments = bundle.data?.segments ?? noSegments;
  const unit = distanceUnit(config.unidade_distancia);
  const names = useMemo(() => locaisById(locais), [locais]);
  const byId = useMemo(
    () => new Map(waypoints.map((waypoint) => [waypoint.id, waypoint])),
    [waypoints],
  );
  const options = useMemo(() => namedWaypointOptions(waypoints, locais), [waypoints, locais]);
  const visibleNodes =
    surface === "network"
      ? waypoints
      : waypoints.filter((waypoint) => options.some((option) => option.id === waypoint.id));

  useEffect(() => {
    if (editing) return;
    setSurface("plan");
    setMode("idle");
    setDraftOrigin(null);
    setDraftMids([]);
  }, [editing]);

  function writeSearch(de: number | null, para: number | null) {
    navigate({
      search: {
        ...(de == null ? {} : { de }),
        ...(para == null ? {} : { para }),
      },
      replace: true,
    });
  }

  async function runPlan(origem: number, destino: number, optionsNow: TravelOptions) {
    if (origem === destino) {
      setNotice(t("routePlanner.errDifferent"));
      setPlan([]);
      return;
    }
    let velocidadeMph: number | undefined;
    if (optionsNow.modo === "proprio") {
      const trimmed = optionsNow.velocidade.trim();
      const parsed = Number(trimmed);
      if (!trimmed) {
        setNotice(t("routePlanner.errSpeedRequired"));
        return;
      }
      if (!Number.isFinite(parsed) || parsed <= 0) {
        setNotice(t("routePlanner.errSpeedInvalid"));
        return;
      }
      velocidadeMph = parsed;
    }
    setBusy(true);
    setNotice(null);
    try {
      const response = await routeApi.plan(slug, {
        origemId: origem,
        destinoId: destino,
        ritmo: optionsNow.ritmo,
        ordenacao: optionsNow.ordenacao,
        modo: optionsNow.modo,
        preferencia: optionsNow.preferencia,
        ...(velocidadeMph == null ? {} : { velocidadeMph }),
      });
      if (response.rotas.length === 0) {
        setNotice(t("routePlanner.errNoRoute"));
        setPlan([]);
        return;
      }
      setPlan(response.rotas);
      setSelectedIndex(0);
    } catch (error) {
      setNotice(message(error, t("routePlanner.errCalculate")));
      setPlan([]);
    } finally {
      setBusy(false);
    }
  }

  function updateTravel(patch: Partial<TravelOptions>) {
    const next = { ...travel, ...patch };
    setTravel(next);
    const recalculates =
      patch.modo != null ||
      patch.ordenacao != null ||
      patch.preferencia != null ||
      patch.ritmo != null;
    if (recalculates && origemId != null && destinoId != null) {
      void runPlan(origemId, destinoId, next);
    }
  }

  function choosePlannerPoint(id: number) {
    if (origemId == null) {
      setOrigemId(id);
      writeSearch(id, destinoId);
      setNotice(null);
      return;
    }
    setDestinoId(id);
    writeSearch(origemId, id);
    if (id === origemId) {
      setNotice(t("routePlanner.errDifferent"));
      setPlan([]);
      return;
    }
    void runPlan(origemId, id, travel);
  }

  async function chooseDrawNode(id: number) {
    if (draftOrigin == null) {
      setDraftOrigin(id);
      setSelectedNode(id);
      setNotice(null);
      return;
    }
    if (draftOrigin === id) {
      setNotice(ta("digitizer.selfLoop"));
      return;
    }
    setBusy(true);
    setNotice(null);
    try {
      await routeApi.createSegment(slug, {
        waypoint_a_id: draftOrigin,
        waypoint_b_id: id,
        tipo: segTipo,
        pontos_intermediarios: draftMids,
      });
      setDraftOrigin(null);
      setDraftMids([]);
      bundle.reload();
    } catch (error) {
      setNotice(message(error, ta("digitizer.falhaSalvarSegmento")));
    } finally {
      setBusy(false);
    }
  }

  async function onPlace(point: MapPoint) {
    if (mode === "move-node" && selectedNode != null) {
      setBusy(true);
      setNotice(null);
      try {
        await routeApi.updateWaypoint(slug, selectedNode, { x: point.x, y: point.y });
        setMode("idle");
        bundle.reload();
      } catch (error) {
        setNotice(message(error, ta("digitizer.falhaCriarNo")));
      } finally {
        setBusy(false);
      }
      return;
    }
    if (mode === "place-node") {
      setBusy(true);
      setNotice(null);
      try {
        const created = await routeApi.createWaypoint(slug, {
          nome: nodeName.trim() || null,
          x: point.x,
          y: point.y,
        });
        setNodeName("");
        setMode("idle");
        setSelectedNode(created.id);
        bundle.reload();
      } catch (error) {
        setNotice(message(error, ta("digitizer.falhaCriarNo")));
      } finally {
        setBusy(false);
      }
      return;
    }
    if (mode !== "draw-segment") return;
    const hit = nearestWaypoint(
      waypoints,
      point.x,
      point.y,
      draftOrigin == null ? undefined : FINISH_SNAP,
    );
    if (hit) {
      void chooseDrawNode(hit.id);
      return;
    }
    if (draftOrigin == null) {
      setNotice(ta("digitizer.errClicarOrigem"));
      return;
    }
    setDraftMids((points) => [...points, point]);
  }

  async function renameNode(id: number, nome: string) {
    setBusy(true);
    setNotice(null);
    try {
      await routeApi.updateWaypoint(slug, id, { nome: nome || null });
      bundle.reload();
    } catch (error) {
      setNotice(message(error, ta("digitizer.falhaCriarNo")));
    } finally {
      setBusy(false);
    }
  }

  async function linkNode(id: number, localId: number | null) {
    setBusy(true);
    setNotice(null);
    try {
      await routeApi.updateWaypoint(slug, id, { local_id: localId });
      bundle.reload();
    } catch (error) {
      setNotice(message(error, ta("digitizer.falhaVincularLocal")));
    } finally {
      setBusy(false);
    }
  }

  async function saveScale(miles: number) {
    setBusy(true);
    setNotice(null);
    try {
      await routeApi.updateScale(slug, miles);
      bundle.reload();
    } catch (error) {
      setNotice(message(error, ta("digitizer.falhaSalvarEscala")));
    } finally {
      setBusy(false);
    }
  }

  async function confirmDelete() {
    if (!pendingDelete) return;
    const target = pendingDelete;
    setPendingDelete(null);
    setBusy(true);
    setNotice(null);
    try {
      if (target.kind === "waypoint") {
        await routeApi.deleteWaypoint(slug, target.id);
        if (origemId === target.id) setOrigemId(null);
        if (destinoId === target.id) setDestinoId(null);
        if (selectedNode === target.id) setSelectedNode(null);
        if (draftOrigin === target.id) {
          setDraftOrigin(null);
          setDraftMids([]);
        }
      } else {
        await routeApi.deleteSegment(slug, target.id);
      }
      bundle.reload();
    } catch (error) {
      setNotice(message(error, ta("digitizer.falhaSalvarSegmento")));
    } finally {
      setBusy(false);
    }
  }

  function onPin(id: string) {
    const waypointId = Number(id);
    if (surface === "network") {
      if (mode === "draw-segment") void chooseDrawNode(waypointId);
      else setSelectedNode(waypointId);
      return;
    }
    choosePlannerPoint(waypointId);
  }

  const draftPoints = useMemo(() => {
    if (draftOrigin == null) return [];
    const origin = byId.get(draftOrigin);
    if (!origin) return [];
    return [origin, ...draftMids];
  }, [byId, draftMids, draftOrigin]);

  const overlay = (
    <>
      {surface === "network"
        ? segments.map((segment) => (
            <path
              key={segment.id}
              d={polylinePath(segmentPoints(segment, byId))}
              fill="none"
              stroke={tipoColor(segment.tipo)}
              strokeDasharray={tipoDash(segment.tipo)}
              vectorEffect="non-scaling-stroke"
              strokeLinecap="round"
              style={{ strokeWidth: 3 }}
            />
          ))
        : plan.map((route, index) => (
            <path
              key={`${route.waypoint_ids.join("-")}-${index}`}
              d={polylinePath(route.geometria)}
              fill="none"
              stroke={tipoColor(route.tipos[0] ?? "estrada")}
              strokeDasharray={tipoDash(route.tipos[0] ?? "estrada")}
              opacity={index === selectedIndex ? 1 : 0.4}
              vectorEffect="non-scaling-stroke"
              strokeLinecap="round"
              style={{ strokeWidth: index === selectedIndex ? 5 : 2.5 }}
            />
          ))}
      {draftPoints.length > 0 && (
        <path
          d={polylinePath(draftPoints)}
          fill="none"
          stroke={tipoColor(segTipo)}
          strokeDasharray={tipoDash(segTipo)}
          vectorEffect="non-scaling-stroke"
          strokeLinecap="round"
          style={{ strokeWidth: 3 }}
        />
      )}
    </>
  );

  const selectedPin =
    surface === "network"
      ? String(draftOrigin ?? selectedNode ?? "")
      : String(destinoId ?? origemId ?? "");

  return (
    <main className="fixed inset-0">
      {bundle.loading && !bundle.data && (
        <p role="status" className="sr-only">
          {t("routePlanner.calculating")}
        </p>
      )}
      {bundle.error && (
        <p role="alert" className="absolute top-20 left-4 z-30 text-sm text-destructive">
          {message(bundle.error, ta("digitizer.falhaCarregarRede"))}
        </p>
      )}
      <WorldMap
        mapUrl={config.map_url}
        pins={visibleNodes.map((waypoint: Waypoint) => ({
          id: String(waypoint.id),
          name: waypointOptionLabel(waypoint, names),
          x: waypoint.x * 100,
          y: waypoint.y * 100,
          visited: waypoint.nome?.trim() != null && waypoint.nome.trim() !== "",
        }))}
        selected={selectedPin || undefined}
        focusOnSelect={false}
        onSelect={onPin}
        overlay={overlay}
        placing={surface === "network" && mode !== "idle"}
        placeLabel={
          mode === "place-node"
            ? ta("digitizer.novoNo")
            : mode === "move-node"
              ? ta("digitizer.moverNo")
              : ta("digitizer.tracarSegmento")
        }
        onPlace={(point) => void onPlace(point)}
        onContextMenu={
          mode === "draw-segment" && draftMids.length > 0
            ? () => setDraftMids((points) => points.slice(0, -1))
            : undefined
        }
      >
        {surface === "network" && editing ? (
          <RouteNetworkEditor
            locais={locais}
            waypoints={waypoints}
            segments={segments}
            scale={bundle.data?.scale ?? null}
            unit={unit}
            busy={busy}
            notice={notice}
            mode={mode}
            nodeName={nodeName}
            segTipo={segTipo}
            draftOriginId={draftOrigin}
            draftMidCount={draftMids.length}
            selectedId={selectedNode}
            onNodeName={setNodeName}
            onSegTipo={setSegTipo}
            onStartPlace={() => {
              setMode("place-node");
              setDraftOrigin(null);
              setDraftMids([]);
              setNotice(null);
            }}
            onStartDraw={() => {
              setMode("draw-segment");
              setDraftOrigin(null);
              setDraftMids([]);
              setNotice(null);
            }}
            onStartMove={() => {
              setMode("move-node");
              setDraftOrigin(null);
              setDraftMids([]);
              setNotice(null);
            }}
            onUndoPoint={() => setDraftMids((points) => points.slice(0, -1))}
            onCancelDraw={() => {
              setMode("idle");
              setDraftOrigin(null);
              setDraftMids([]);
            }}
            onSelect={setSelectedNode}
            onRename={(id, nome) => void renameNode(id, nome)}
            onLink={(id, localId) => void linkNode(id, localId)}
            onDeleteWaypoint={(id) => setPendingDelete({ kind: "waypoint", id })}
            onDeleteSegment={(id) => setPendingDelete({ kind: "segment", id })}
            onSaveScale={(miles) => void saveScale(miles)}
            onBack={() => {
              setSurface("plan");
              setMode("idle");
              setDraftOrigin(null);
              setDraftMids([]);
              setNotice(null);
            }}
          />
        ) : (
          <RoutePlannerPanel
            options={options}
            travel={travel}
            origemId={origemId}
            destinoId={destinoId}
            unit={unit}
            plan={plan}
            selectedIndex={selectedIndex}
            busy={busy}
            notice={notice}
            namedCount={options.length}
            waypointCount={waypoints.length}
            onOrigem={(id) => {
              setOrigemId(id);
              writeSearch(id, destinoId);
            }}
            onDestino={(id) => {
              setDestinoId(id);
              writeSearch(origemId, id);
            }}
            onTravel={updateTravel}
            onCalculate={() => {
              if (origemId == null || destinoId == null) {
                setNotice(t("routePlanner.errOriginDest"));
                return;
              }
              void runPlan(origemId, destinoId, travel);
            }}
            onSelect={setSelectedIndex}
            onOpenNetwork={
              editing
                ? () => {
                    setSurface("network");
                    setNotice(null);
                    setPlan([]);
                  }
                : undefined
            }
          />
        )}
      </WorldMap>
      <AlertDialog
        open={pendingDelete != null}
        onOpenChange={(open) => !open && setPendingDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {pendingDelete?.kind === "waypoint"
                ? ta("digitizer.confirmRemoverNo")
                : ta("digitizer.confirmRemoverSegmento")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {pendingDelete?.kind === "waypoint"
                ? ta("digitizer.confirmRemoverNo")
                : ta("digitizer.confirmRemoverSegmento")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{tc("buttons.cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={() => void confirmDelete()}>
              {ta("digitizer.apagar")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}
