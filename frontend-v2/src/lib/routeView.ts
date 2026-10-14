import type { Local, Waypoint } from "@/api/map";
import type { MapPoint, RouteSegment, RouteTipo } from "@/api/routes";

/** Statute mile, used only to present miles returned by the API. */
export const MI_TO_KM = 1.609344;

export type DistanceUnit = "mi" | "km";

/** Clicking this close to a node (map units, 0–1) counts as clicking the node. */
export const NODE_SNAP = 0.02;

export function distanceUnit(value: string | null | undefined): DistanceUnit {
  return value === "km" ? "km" : "mi";
}

export function foldText(value: string): string {
  return value.normalize("NFD").replace(/\p{M}/gu, "").toLocaleLowerCase();
}

export function isNamedWaypoint(waypoint: Waypoint, locaisById: Map<number, string>): boolean {
  if (waypoint.nome?.trim()) return true;
  if (waypoint.local_id == null) return false;
  return Boolean(locaisById.get(waypoint.local_id)?.trim());
}

export function waypointOptionLabel(waypoint: Waypoint, locaisById: Map<number, string>): string {
  const nome = waypoint.nome?.trim();
  if (nome) return nome;
  if (waypoint.local_id != null) {
    const localNome = locaisById.get(waypoint.local_id)?.trim();
    if (localNome) return localNome;
  }
  return `Nó ${waypoint.id}`;
}

export function locaisById(locais: Local[]): Map<number, string> {
  return new Map(locais.map((local) => [local.id, local.nome]));
}

export function namedWaypointOptions(waypoints: Waypoint[], locais: Local[]) {
  const names = locaisById(locais);
  return waypoints
    .filter((waypoint) => isNamedWaypoint(waypoint, names))
    .map((waypoint) => ({ id: waypoint.id, label: waypointOptionLabel(waypoint, names) }))
    .sort((a, b) => a.label.localeCompare(b.label, undefined, { sensitivity: "base" }));
}

export function eligibleLocais(locais: Local[], waypoints: Waypoint[], waypointId: number | null) {
  const taken = new Set(
    waypoints
      .filter((waypoint) => waypoint.local_id != null && waypoint.id !== waypointId)
      .map((waypoint) => waypoint.local_id as number),
  );
  return locais.filter((local) => !taken.has(local.id));
}

export function nearestWaypoint(
  waypoints: Waypoint[],
  x: number,
  y: number,
  maxDist = NODE_SNAP,
): Waypoint | null {
  let best: Waypoint | null = null;
  let bestDistance = maxDist;
  for (const waypoint of waypoints) {
    const distance = Math.hypot(waypoint.x - x, waypoint.y - y);
    if (distance <= bestDistance) {
      best = waypoint;
      bestDistance = distance;
    }
  }
  return best;
}

/** SVG path in the map overlay viewBox (0–100). Points come from the API, in 0–1. */
export function polylinePath(points: MapPoint[]): string {
  if (points.length === 0) return "";
  return points
    .map((point, index) => {
      const command = index === 0 ? "M" : "L";
      return `${command}${(point.x * 100).toFixed(2)},${(point.y * 100).toFixed(2)}`;
    })
    .join(" ");
}

export function segmentPoints(segment: RouteSegment, byId: Map<number, Waypoint>): MapPoint[] {
  const start = byId.get(segment.waypoint_a_id);
  const end = byId.get(segment.waypoint_b_id);
  if (!start || !end) return [];
  return [start, ...segment.pontos_intermediarios, end];
}

export function formatDistancia(distanciaMilhas: number, unit: DistanceUnit): string {
  const raw = unit === "km" ? distanciaMilhas * MI_TO_KM : distanciaMilhas;
  const value = Number.isFinite(raw) ? Math.round(raw) : 0;
  return `${value} ${unit}`;
}

export function formatBp(value: number): string {
  if (!Number.isFinite(value)) return "0 bp";
  const rounded =
    Math.abs(value - Math.round(value)) < 1e-6 ? Math.round(value) : Math.round(value * 10) / 10;
  return `${rounded} bp`;
}

/** Scale is stored as miles per map unit. km is a view of that same number. */
export function milesToScaleInput(miles: number, unit: DistanceUnit): string {
  const shown = unit === "km" ? miles * MI_TO_KM : miles;
  if (!Number.isFinite(shown)) return "";
  return String(Math.round(shown * 1e6) / 1e6);
}

export function scaleInputToMiles(value: string, unit: DistanceUnit): number | null {
  const parsed = Number(value.trim());
  if (!Number.isFinite(parsed) || parsed <= 0) return null;
  return unit === "km" ? parsed / MI_TO_KM : parsed;
}

export function tipoColor(tipo: string): string {
  if (tipo === "rio") return "var(--verdigris)";
  if (tipo === "trilha") return "var(--ochre)";
  return "var(--seal)";
}

export function tipoDash(tipo: string): string | undefined {
  if (tipo === "rio") return "0.8 0.6";
  if (tipo === "trilha") return "0.3 0.5";
  return undefined;
}

export function routeTitle(tipos: string[], label: (tipo: RouteTipo | string) => string): string {
  const names = tipos.map((tipo) => label(tipo)).filter(Boolean);
  return names.join(", ");
}

export function disambiguateTitles(titles: string[]): string[] {
  const seen = new Map<string, number>();
  return titles.map((title) => {
    const count = (seen.get(title) ?? 0) + 1;
    seen.set(title, count);
    return count === 1 ? title : `${title} (${count})`;
  });
}
