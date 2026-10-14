import { ArrowDown } from "lucide-react";
import { useTranslation } from "react-i18next";
import type {
  ModoTransporte,
  OrdenacaoRota,
  PreferenciaVia,
  Ritmo,
  RoutePlanItem,
} from "@/api/routes";
import { WaypointCombobox, type WaypointOption } from "@/components/codex/WaypointCombobox";
import {
  disambiguateTitles,
  formatBp,
  formatDistancia,
  routeTitle,
  type DistanceUnit,
} from "@/lib/routeView";
import { cn } from "@/lib/utils";

export interface TravelOptions {
  ritmo: Ritmo;
  modo: ModoTransporte;
  ordenacao: OrdenacaoRota;
  preferencia: PreferenciaVia;
  velocidade: string;
}

const optionClass =
  "w-full appearance-none rounded-xl border border-border bg-card px-3 py-2 text-sm";

export function RoutePlannerPanel({
  options,
  travel,
  origemId,
  destinoId,
  unit,
  plan,
  selectedIndex,
  busy,
  notice,
  namedCount,
  waypointCount,
  onOrigem,
  onDestino,
  onTravel,
  onCalculate,
  onSelect,
  onOpenNetwork,
}: {
  options: WaypointOption[];
  travel: TravelOptions;
  origemId: number | null;
  destinoId: number | null;
  unit: DistanceUnit;
  plan: RoutePlanItem[];
  selectedIndex: number;
  busy: boolean;
  notice: string | null;
  namedCount: number;
  waypointCount: number;
  onOrigem: (id: number | null) => void;
  onDestino: (id: number | null) => void;
  onTravel: (patch: Partial<TravelOptions>) => void;
  onCalculate: () => void;
  onSelect: (index: number) => void;
  onOpenNetwork?: (() => void) | undefined;
}) {
  const { t } = useTranslation("mapa");
  const { t: ta } = useTranslation("admin");
  const titles = disambiguateTitles(
    plan.map((route) => {
      const base = routeTitle(route.tipos, (tipo) =>
        t(`routeEnums.tipoVia.${tipo}`, { defaultValue: tipo }),
      );
      return base || t("routePlanner.route");
    }),
  );
  const badge =
    travel.ordenacao === "mais_barata"
      ? t("routePlanner.badgeCheapest")
      : t("routePlanner.badgeFastest");

  return (
    <aside
      className="glass absolute inset-x-2 bottom-20 z-20 max-h-[60vh] overflow-y-auto rounded-2xl p-5 lg:top-20 lg:right-auto lg:bottom-auto lg:left-4 lg:w-[380px]"
      aria-label={t("v2.travelPlanner")}
    >
      <h1 className="font-display text-3xl font-medium">{t("v2.whereNext")}</h1>
      <div className="mt-4 space-y-1">
        <WaypointCombobox
          id="de"
          label={t("v2.from")}
          value={origemId}
          options={options}
          onChange={onOrigem}
        />
        <div className="flex justify-center py-1 text-muted-foreground">
          <ArrowDown className="h-4 w-4" />
        </div>
        <WaypointCombobox
          id="para"
          label={t("v2.to")}
          value={destinoId}
          options={options}
          onChange={onDestino}
        />
      </div>

      <details open className="mt-4">
        <summary className="cursor-pointer text-sm text-muted-foreground">
          {t("v2.preferences")}
        </summary>
        <div className="mt-3 space-y-3">
          <label className="block text-sm">
            <span className="eyebrow">{t("routePlanner.transport")}</span>
            <select
              aria-label={t("routePlanner.transport")}
              className={optionClass}
              value={travel.modo}
              onChange={(event) => onTravel({ modo: event.target.value as ModoTransporte })}
            >
              <option value="pago">{t("routeEnums.modo.pago")}</option>
              <option value="proprio">{t("routeEnums.modo.proprio")}</option>
            </select>
          </label>
          {travel.modo === "proprio" && (
            <label className="block text-sm">
              <span className="eyebrow">{t("routePlanner.speedMph")}</span>
              <input
                aria-label={t("routePlanner.speedMph")}
                className={optionClass}
                inputMode="decimal"
                value={travel.velocidade}
                onChange={(event) => onTravel({ velocidade: event.target.value })}
              />
            </label>
          )}
          <label className="block text-sm">
            <span className="eyebrow">{t("routePlanner.pace")}</span>
            <select
              aria-label={t("routePlanner.pace")}
              className={optionClass}
              value={travel.ritmo}
              onChange={(event) => onTravel({ ritmo: event.target.value as Ritmo })}
            >
              <option value="normal">{t("routeEnums.ritmo.normal")}</option>
              <option value="intenso">{t("routeEnums.ritmo.intenso")}</option>
            </select>
            <span className="mt-1 block text-xs text-muted-foreground">
              {travel.ritmo === "intenso"
                ? t("routeEnums.ritmo.intensoHint")
                : t("routeEnums.ritmo.normalHint")}
            </span>
          </label>
          <label className="block text-sm">
            <span className="eyebrow">{t("routePlanner.sortBy")}</span>
            <select
              aria-label={t("routePlanner.sortBy")}
              className={optionClass}
              value={travel.ordenacao}
              onChange={(event) => onTravel({ ordenacao: event.target.value as OrdenacaoRota })}
            >
              <option value="mais_rapida">{t("routeEnums.ordenacao.maisRapida")}</option>
              <option value="mais_barata">{t("routeEnums.ordenacao.maisBarata")}</option>
            </select>
          </label>
          <label className="block text-sm">
            <span className="eyebrow">{t("routePlanner.pathPref")}</span>
            <select
              aria-label={t("routePlanner.pathPref")}
              className={optionClass}
              value={travel.preferencia}
              onChange={(event) => onTravel({ preferencia: event.target.value as PreferenciaVia })}
            >
              <option value="nenhuma">{t("routeEnums.preferencia.nenhuma")}</option>
              <option value="rio">{t("routeEnums.preferencia.rio")}</option>
              <option value="estrada">{t("routeEnums.preferencia.estrada")}</option>
            </select>
          </label>
          <p className="text-sm">
            <span className="eyebrow">{t("routePlanner.unit")}</span>
            <span className="mt-1 block" data-testid="distance-unit">
              {unit === "km" ? t("routePlanner.unitKm") : t("routePlanner.unitMi")}
            </span>
          </p>
        </div>
      </details>

      <button
        type="button"
        className="mt-4 w-full rounded-xl bg-seal px-3 py-2 font-medium text-seal-foreground disabled:opacity-60"
        disabled={busy}
        onClick={onCalculate}
      >
        {busy ? t("routePlanner.calculating") : t("routePlanner.calculate")}
      </button>
      {notice && (
        <p role="alert" className="mt-3 text-sm text-destructive">
          {notice}
        </p>
      )}

      <h2 className="eyebrow mt-6 mb-2">{t("v2.possibleRoutes")}</h2>
      {plan.length > 0 ? (
        <ul className="space-y-2" role="radiogroup" aria-label={t("v2.possibleRoutes")}>
          {plan.map((route, index) => {
            const meta = t("routePlanner.meta", {
              dist: formatDistancia(route.distancia_milhas, unit),
              tempo: route.tempo_texto,
              via: t("routePlanner.viaBp", { n: formatBp(route.custo_dentro_bp) }),
              fora: t("routePlanner.foraBp", { n: formatBp(route.custo_fora_bp) }),
            });
            return (
              <li key={`${route.waypoint_ids.join("-")}-${index}`}>
                <button
                  type="button"
                  role="radio"
                  aria-checked={index === selectedIndex}
                  data-testid="route-option"
                  onClick={() => onSelect(index)}
                  className={cn(
                    "w-full rounded-xl border p-3 text-left",
                    index === selectedIndex
                      ? "border-seal bg-card shadow-float"
                      : "border-border hover:bg-accent",
                  )}
                >
                  <span className="block font-medium">
                    {titles[index]}
                    {index === 0 ? ` · ${badge}` : ""}
                  </span>
                  <span className="block text-xs text-muted-foreground">{meta}</span>
                </button>
                {index === selectedIndex && route.pernoites.length > 0 && (
                  <ol
                    className="mt-2 space-y-1 px-2 text-sm"
                    aria-label={t("routePlanner.overnightTitle")}
                  >
                    {route.pernoites.map((stop) => (
                      <li key={`${stop.dia}-${stop.tipo}-${stop.x}`}>
                        {t("routePlanner.overnightNight", { n: stop.dia })}
                        {" · "}
                        {stop.tipo === "local" && stop.nome
                          ? stop.nome
                          : t("routePlanner.overnightWild")}
                      </li>
                    ))}
                  </ol>
                )}
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="text-sm text-muted-foreground">
          {waypointCount === 0
            ? t("routePlanner.noNodes")
            : namedCount === 0
              ? t("routePlanner.noNamedNodes")
              : t("routePlanner.resultsHint")}
        </p>
      )}
      <p className="sr-only" aria-live="polite">
        {plan.length > 0 ? t("routePlanner.liveResults", { count: plan.length }) : ""}
      </p>
      {onOpenNetwork && (
        <button
          type="button"
          className="mt-4 text-sm text-muted-foreground hover:text-foreground"
          onClick={onOpenNetwork}
        >
          {ta("digitizer.title")}
        </button>
      )}
    </aside>
  );
}
