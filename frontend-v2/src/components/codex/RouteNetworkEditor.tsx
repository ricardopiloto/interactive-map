import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import type { Local, Waypoint } from "@/api/map";
import type { MapScale, RouteSegment, RouteTipo } from "@/api/routes";
import {
  eligibleLocais,
  formatDistancia,
  locaisById,
  milesToScaleInput,
  scaleInputToMiles,
  waypointOptionLabel,
  type DistanceUnit,
} from "@/lib/routeView";

const fieldClass =
  "w-full appearance-none rounded-xl border border-border bg-card px-3 py-2 text-sm";

export function RouteNetworkEditor({
  locais,
  waypoints,
  segments,
  scale,
  unit,
  busy,
  notice,
  mode,
  nodeName,
  segTipo,
  draftOriginId,
  draftMidCount,
  selectedId,
  onNodeName,
  onSegTipo,
  onStartPlace,
  onStartDraw,
  onUndoPoint,
  onCancelDraw,
  onSelect,
  onRename,
  onLink,
  onDeleteWaypoint,
  onDeleteSegment,
  onSaveScale,
  onBack,
}: {
  locais: Local[];
  waypoints: Waypoint[];
  segments: RouteSegment[];
  scale: MapScale | null;
  unit: DistanceUnit;
  busy: boolean;
  notice: string | null;
  mode: "idle" | "place-node" | "draw-segment";
  nodeName: string;
  segTipo: RouteTipo;
  draftOriginId: number | null;
  draftMidCount: number;
  selectedId: number | null;
  onNodeName: (value: string) => void;
  onSegTipo: (value: RouteTipo) => void;
  onStartPlace: () => void;
  onStartDraw: () => void;
  onUndoPoint: () => void;
  onCancelDraw: () => void;
  onSelect: (id: number) => void;
  onRename: (id: number, nome: string) => void;
  onLink: (id: number, localId: number | null) => void;
  onDeleteWaypoint: (id: number) => void;
  onDeleteSegment: (id: number) => void;
  onSaveScale: (miles: number) => void;
  onBack: () => void;
}) {
  const { t } = useTranslation("admin");
  const { t: tm } = useTranslation("mapa");
  const { t: tc } = useTranslation("comum");
  const names = locaisById(locais);
  const selected = waypoints.find((waypoint) => waypoint.id === selectedId) ?? null;
  const selectedNome = selected?.nome ?? "";
  const scaleMiles = scale?.miles_per_map_unit;
  const [rename, setRename] = useState(selectedNome);
  const [scaleText, setScaleText] = useState(
    scaleMiles == null ? "" : milesToScaleInput(scaleMiles, unit),
  );
  const [scaleError, setScaleError] = useState<string | null>(null);

  useEffect(() => {
    setRename(selectedNome);
  }, [selected?.id, selectedNome]);

  useEffect(() => {
    if (scaleMiles == null) return;
    setScaleText(milesToScaleInput(scaleMiles, unit));
  }, [scaleMiles, unit]);

  const scaleUnit = unit === "km" ? "km" : "mi";

  return (
    <aside
      className="glass absolute inset-x-2 bottom-20 z-20 max-h-[70vh] overflow-y-auto rounded-2xl p-5 lg:top-20 lg:right-auto lg:bottom-auto lg:left-4 lg:w-[420px]"
      aria-label={t("digitizer.title")}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-medium">{t("digitizer.title")}</h1>
          <p className="text-sm text-muted-foreground">{t("digitizer.subtitle")}</p>
        </div>
        <button type="button" className="text-sm text-muted-foreground" onClick={onBack}>
          {t("digitizer.planejar")}
        </button>
      </div>

      <form
        className="mt-4 flex items-end gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          const miles = scaleInputToMiles(scaleText, unit);
          if (miles == null) {
            setScaleError(t("digitizer.escalaInvalida"));
            return;
          }
          setScaleError(null);
          onSaveScale(miles);
        }}
      >
        <label className="block flex-1 text-sm">
          <span className="eyebrow">{t("digitizer.escalaComUnidade", { unit: scaleUnit })}</span>
          <input
            aria-label={t("digitizer.escalaComUnidade", { unit: scaleUnit })}
            className={fieldClass}
            inputMode="decimal"
            value={scaleText}
            onChange={(event) => setScaleText(event.target.value)}
          />
        </label>
        <button
          type="submit"
          className="rounded-xl bg-seal px-3 py-2 text-sm text-seal-foreground disabled:opacity-60"
          disabled={busy}
        >
          {t("digitizer.salvarEscala")}
        </button>
      </form>
      {scaleError && (
        <p role="alert" className="mt-2 text-sm text-destructive">
          {scaleError}
        </p>
      )}

      <label className="mt-4 block text-sm">
        <span className="eyebrow">{t("digitizer.nomeOpcional")}</span>
        <input
          aria-label={t("digitizer.nomeOpcional")}
          className={fieldClass}
          value={nodeName}
          onChange={(event) => onNodeName(event.target.value)}
        />
      </label>
      <label className="mt-3 block text-sm">
        <span className="eyebrow">{t("digitizer.tipoVia")}</span>
        <select
          aria-label={t("digitizer.tipoVia")}
          className={fieldClass}
          value={segTipo}
          onChange={(event) => onSegTipo(event.target.value as RouteTipo)}
        >
          <option value="estrada">{tm("routeEnums.tipoVia.estrada")}</option>
          <option value="rio">{tm("routeEnums.tipoVia.rio")}</option>
          <option value="trilha">{tm("routeEnums.tipoVia.trilha")}</option>
        </select>
      </label>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          className="rounded-xl border border-border px-3 py-2 text-sm"
          aria-pressed={mode === "place-node"}
          onClick={onStartPlace}
        >
          {t("digitizer.novoNo")}
        </button>
        <button
          type="button"
          className="rounded-xl border border-border px-3 py-2 text-sm"
          aria-pressed={mode === "draw-segment"}
          onClick={onStartDraw}
        >
          {t("digitizer.tracarSegmento")}
        </button>
      </div>
      {mode === "place-node" && (
        <p className="mt-2 text-sm text-muted-foreground">{t("digitizer.novoNo")}</p>
      )}
      {mode === "draw-segment" && (
        <div className="mt-3 space-y-2">
          <p className="text-sm text-muted-foreground">
            {draftOriginId == null ? t("digitizer.hintOrigem") : t("digitizer.hintDestino")}
          </p>
          <p className="text-xs text-muted-foreground" data-testid="draft-mids">
            {draftMidCount}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              className="text-sm"
              onClick={onUndoPoint}
              disabled={draftMidCount === 0}
            >
              {t("digitizer.desfazerPonto")}
            </button>
            <button type="button" className="text-sm" onClick={onCancelDraw}>
              {t("digitizer.cancelarTraco")}
            </button>
          </div>
        </div>
      )}

      {notice && (
        <p role="alert" className="mt-3 text-sm text-destructive">
          {notice}
        </p>
      )}

      <h2 className="eyebrow mt-6">{t("digitizer.waypoints", { count: waypoints.length })}</h2>
      {waypoints.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t("digitizer.semNos")}</p>
      ) : (
        <ul className="mt-2 space-y-1">
          {waypoints.map((waypoint) => {
            const label = waypointOptionLabel(waypoint, names);
            return (
              <li key={waypoint.id} className="flex items-center gap-2">
                <button
                  type="button"
                  className="flex-1 rounded-lg px-2 py-1 text-left text-sm hover:bg-accent"
                  aria-current={waypoint.id === selectedId ? "true" : undefined}
                  onClick={() => onSelect(waypoint.id)}
                >
                  {label}
                </button>
                <button
                  type="button"
                  className="text-xs text-muted-foreground"
                  aria-label={`${t("digitizer.apagar")} ${label}`}
                  onClick={() => onDeleteWaypoint(waypoint.id)}
                >
                  {t("digitizer.apagar")}
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {selected && (
        <form
          className="mt-3 space-y-2 rounded-xl border border-border p-3"
          aria-label={t("digitizer.noSelecionado")}
          onSubmit={(event) => {
            event.preventDefault();
            onRename(selected.id, rename.trim());
          }}
        >
          <label className="block text-sm">
            <span className="eyebrow">{tc("form.nome")}</span>
            <input
              aria-label={tc("form.nome")}
              className={fieldClass}
              value={rename}
              onChange={(event) => setRename(event.target.value)}
            />
          </label>
          <button type="submit" className="text-sm" disabled={busy}>
            {t("digitizer.renomear")}
          </button>
          <label className="block text-sm">
            <span className="eyebrow">{t("digitizer.vincularLocal")}</span>
            <select
              aria-label={t("digitizer.localDoNo", {
                nome: waypointOptionLabel(selected, names),
              })}
              className={fieldClass}
              value={selected.local_id ?? ""}
              onChange={(event) => {
                const raw = event.target.value;
                onLink(selected.id, raw === "" ? null : Number(raw));
              }}
            >
              <option value="">{t("digitizer.semLocal")}</option>
              {eligibleLocais(locais, waypoints, selected.id).map((local) => (
                <option key={local.id} value={local.id}>
                  {local.nome}
                </option>
              ))}
            </select>
          </label>
        </form>
      )}

      <h2 className="eyebrow mt-6">{t("digitizer.arestas", { count: segments.length })}</h2>
      {segments.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t("digitizer.semSegmentos")}</p>
      ) : (
        <ul className="mt-2 space-y-1">
          {segments.map((segment) => {
            const from = waypoints.find((waypoint) => waypoint.id === segment.waypoint_a_id);
            const to = waypoints.find((waypoint) => waypoint.id === segment.waypoint_b_id);
            const identity = `${from ? waypointOptionLabel(from, names) : segment.waypoint_a_id} ↔ ${
              to ? waypointOptionLabel(to, names) : segment.waypoint_b_id
            }`;
            return (
              <li key={segment.id} className="flex items-center gap-2 text-sm">
                <span className="flex-1">
                  {identity}
                  {" · "}
                  {tm(`routeEnums.tipoVia.${segment.tipo}`)}
                  {" · "}
                  <span data-testid={`segment-${segment.id}-distance`}>
                    {formatDistancia(segment.distancia_milhas, unit)}
                  </span>
                </span>
                <button
                  type="button"
                  className="text-xs text-muted-foreground"
                  aria-label={`${t("digitizer.apagar")} ${identity}`}
                  onClick={() => onDeleteSegment(segment.id)}
                >
                  {t("digitizer.apagar")}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </aside>
  );
}
