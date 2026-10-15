import { expect, it } from "vitest";
import type { Waypoint } from "@/api/map";
import type { RouteSegment } from "@/api/routes";
import {
  MI_TO_KM,
  ORIGIN_SNAP,
  FINISH_SNAP,
  formatDistancia,
  isNamedWaypoint,
  milesToScaleInput,
  namedWaypointOptions,
  nearestWaypoint,
  polylinePath,
  scaleInputToMiles,
  segmentPoints,
} from "./routeView";

const porto: Waypoint = { id: 1, nome: "Porto", x: 0.1, y: 0.2, local_id: null };
const anon: Waypoint = { id: 2, nome: null, x: 0.4, y: 0.4, local_id: 9 };
const blank: Waypoint = { id: 3, nome: "  ", x: 0.8, y: 0.8, local_id: null };

it("formata milhas da API e converte só na exibição em km", () => {
  expect(formatDistancia(10, "mi")).toBe("10 mi");
  expect(formatDistancia(10, "km")).toBe(`${Math.round(10 * MI_TO_KM)} km`);
});

it("preserva pontos intermediários próximos de nós durante o desenho", () => {
  const near: Waypoint = { id: 2, nome: "Próximo", x: 0.115, y: 0.2, local_id: null };
  const waypoints = [porto, near];
  expect(nearestWaypoint(waypoints, 0.103, 0.2, ORIGIN_SNAP)?.id).toBe(1);
  expect(nearestWaypoint(waypoints, 0.106, 0.2, FINISH_SNAP)).toBeNull();
  expect(nearestWaypoint(waypoints, 0.109, 0.2, FINISH_SNAP)).toBeNull();
  expect(nearestWaypoint(waypoints, 0.111, 0.2, FINISH_SNAP)?.id).toBe(2);
  expect(nearestWaypoint(waypoints, 0.115, 0.2, FINISH_SNAP)?.id).toBe(2);
});

it("converte a escala de km para milhas por unidade de mapa", () => {
  expect(scaleInputToMiles("160.9344", "km")).toBeCloseTo(100, 4);
  expect(milesToScaleInput(100, "km")).toBe("160.9344");
  expect(scaleInputToMiles("80", "mi")).toBe(80);
  expect(scaleInputToMiles("0", "mi")).toBeNull();
});

it("só oferece nós com nome próprio ou local ligado", () => {
  const locais = [{ id: 9, nome: "Altdorf" }] as never;
  expect(isNamedWaypoint(blank, new Map())).toBe(false);
  expect(namedWaypointOptions([porto, anon, blank], locais).map((option) => option.label)).toEqual([
    "Altdorf",
    "Porto",
  ]);
});

it("desenha a polilinha com os pontos da API, sem curva local", () => {
  const segment: RouteSegment = {
    id: 4,
    waypoint_a_id: 1,
    waypoint_b_id: 2,
    tipo: "rio",
    pontos_intermediarios: [{ x: 0.5, y: 0.25 }],
    distancia_milhas: 12,
    modificador_velocidade: null,
  };
  const path = polylinePath(
    segmentPoints(segment, new Map([porto, anon].map((waypoint) => [waypoint.id, waypoint]))),
  );
  expect(path).toBe("M10.00,20.00 L50.00,25.00 L40.00,40.00");
  expect(path.includes("Q")).toBe(false);
});
