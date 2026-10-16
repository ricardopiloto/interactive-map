import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  TransformComponent,
  TransformWrapper,
  useControls,
  type ReactZoomPanPinchRef,
} from "react-zoom-pan-pinch";
import type { Personagem, PersonagemStatus, Vinculo, VinculoTipo } from "@/api/relacoes";
import { NODE_BOX, layoutRadialByTipo } from "@/lib/graphLayout";
import {
  edgeDisplayTipo,
  edgeMatchesTipos,
  edgeStyle,
  formatTipoWithQual,
  isDuasVias,
  tipHiddenFromPlayers,
} from "@/lib/vinculoView";

const DISC = 28;
const GRAB_SLOP_PX = 4;

type Shift = { x: number; y: number };

function graphExtent(svg: SVGSVGElement) {
  const box = svg.viewBox?.baseVal;
  if (box && box.width > 0 && box.height > 0) return { width: box.width, height: box.height };
  const raw = svg.getAttribute("viewBox");
  if (!raw) return { width: 1, height: 1 };
  const parts = raw
    .trim()
    .split(/[\s,]+/)
    .map(Number);
  const spanX = parts[2];
  const spanY = parts[3];
  if (spanX != null && spanY != null && spanX > 0 && spanY > 0) {
    return { width: spanX, height: spanY };
  }
  return { width: 1, height: 1 };
}

/** Screen pixels per graph unit, including the viewport transform. */
function pixelsPerGraphUnit(svg: SVGSVGElement, scale: number) {
  const graph = graphExtent(svg);
  const widthAttr = Number(svg.getAttribute("width"));
  const heightAttr = Number(svg.getAttribute("height"));
  const natural =
    widthAttr > 0 && heightAttr > 0
      ? { width: widthAttr, height: heightAttr }
      : { width: graph.width, height: graph.height };
  return { x: (natural.width / graph.width) * scale, y: (natural.height / graph.height) * scale };
}

function GraphControls({ apiRef }: { apiRef: React.RefObject<ReactZoomPanPinchRef | null> }) {
  const { t } = useTranslation("relacoes");
  const { zoomIn, zoomOut } = useControls();
  return (
    <div className="glass absolute top-20 left-3 z-10 flex gap-1 rounded-full p-1">
      <button type="button" className="rounded-full px-3 py-1 text-xs" onClick={() => zoomIn()}>
        {t("graph.zoomIn")}
      </button>
      <button type="button" className="rounded-full px-3 py-1 text-xs" onClick={() => zoomOut()}>
        {t("graph.zoomOut")}
      </button>
      <button
        type="button"
        className="rounded-full px-3 py-1 text-xs"
        aria-label={t("graph.fitViewAria")}
        onClick={() => void apiRef.current?.fitToView({ mode: "contain", animationTime: 0 })}
      >
        {t("graph.fitView")}
      </button>
    </div>
  );
}

function initials(nome: string) {
  const parts = nome.trim().split(/\s+/).filter(Boolean);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase();
}

function matchesQuery(nome: string, query: string) {
  const needle = query.trim().toLocaleLowerCase();
  if (!needle) return true;
  return nome.toLocaleLowerCase().includes(needle);
}

function statusMark(status: PersonagemStatus | null) {
  if (status === "morto") return " †";
  if (status === "desaparecido") return " ?";
  return "";
}

function pointAlong(start: { x: number; y: number }, end: { x: number; y: number }, t: number) {
  return {
    x: start.x + (end.x - start.x) * t,
    y: start.y + (end.y - start.y) * t,
  };
}

function trimEnd(from: { x: number; y: number }, to: { x: number; y: number }, amount: number) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const len = Math.hypot(dx, dy) || 1;
  return { x: to.x - (dx / len) * amount, y: to.y - (dy / len) * amount };
}

export function RelationsGraph({
  campaignSlug,
  personagens,
  vinculos,
  selectedId,
  isolate,
  activeTipos,
  query,
  isGm,
  onSelect,
}: {
  campaignSlug: string;
  personagens: Personagem[];
  vinculos: Vinculo[];
  selectedId: number | null;
  isolate: boolean;
  activeTipos: Set<VinculoTipo>;
  query: string;
  isGm: boolean;
  onSelect: (id: number | null) => void;
}) {
  const { t } = useTranslation("relacoes");
  // Kept in memory for this visit only. The radial layout stays the position of record.
  const [sessionShifts, setSessionShifts] = useState<Map<number, Shift>>(() => new Map());
  const [failedPortraits, setFailedPortraits] = useState<Set<number>>(() => new Set());
  const [grabbedId, setGrabbedId] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<ReactZoomPanPinchRef | null>(null);
  const scaleRef = useRef(1);
  const shiftsRef = useRef(sessionShifts);
  const releaseGrabRef = useRef<((quiet?: boolean) => void) | null>(null);
  const skipClickRef = useRef(false);
  const seenSlugRef = useRef(campaignSlug);
  shiftsRef.current = sessionShifts;
  const byId = useMemo(() => new Map(personagens.map((p) => [p.id, p])), [personagens]);
  const box = useMemo(
    () => ({
      width: Math.max(NODE_BOX.width, ...personagens.map((p) => p.nome.length * 8 + 24), 0),
      height: NODE_BOX.height,
    }),
    [personagens],
  );
  const frame = useMemo(
    () =>
      layoutRadialByTipo(
        personagens.map((p) => ({ id: p.id, tipo: p.tipo })),
        box,
      ),
    [personagens, box],
  );
  useEffect(() => {
    void apiRef.current?.fitToView({ mode: "contain", animationTime: 0 });
  }, [campaignSlug, frame.width, frame.height]);
  const placed = useMemo(() => {
    const map = new Map(frame.nodes.map((node) => [node.id, node]));
    for (const [id, shift] of sessionShifts) {
      const node = map.get(id);
      if (!node || (shift.x === 0 && shift.y === 0)) continue;
      map.set(id, { ...node, x: node.x + shift.x, y: node.y + shift.y });
    }
    return map;
  }, [frame.nodes, sessionShifts]);
  const edges = vinculos.filter((v) => edgeMatchesTipos(v, activeTipos));
  const related = new Set<number>();
  if (selectedId != null) {
    related.add(selectedId);
    for (const bond of edges) {
      if (bond.personagem_a_id === selectedId) related.add(bond.personagem_b_id);
      if (bond.personagem_b_id === selectedId) related.add(bond.personagem_a_id);
    }
  }
  const isolated = isolate && selectedId != null;

  function nodeOpacity(id: number) {
    if (isolated && !related.has(id)) return 0.08;
    if (selectedId != null && !related.has(id)) return 0.25;
    if (!matchesQuery(byId.get(id)?.nome ?? "", query)) return 0.25;
    return 1;
  }

  function edgeOn(bond: Vinculo) {
    if (isolated) return bond.personagem_a_id === selectedId || bond.personagem_b_id === selectedId;
    if (selectedId == null) return true;
    return bond.personagem_a_id === selectedId || bond.personagem_b_id === selectedId;
  }

  function consumeSuppressedClick() {
    if (!skipClickRef.current) return false;
    skipClickRef.current = false;
    return true;
  }

  useEffect(() => {
    return () => releaseGrabRef.current?.(true);
  }, []);

  useEffect(() => {
    if (seenSlugRef.current === campaignSlug) return;
    seenSlugRef.current = campaignSlug;
    releaseGrabRef.current?.();
    releaseGrabRef.current = null;
    skipClickRef.current = false;
    setGrabbedId(null);
    setSessionShifts(new Map());
  }, [campaignSlug]);

  function beginGrab(event: React.PointerEvent<SVGGElement>, id: number) {
    const button = event.nativeEvent.button;
    if (button > 0 || releaseGrabRef.current) return;
    event.stopPropagation();
    setGrabbedId(id);
    const host = event.currentTarget;
    const pointerId = event.nativeEvent.pointerId;
    try {
      host.setPointerCapture(pointerId);
    } catch {
      // Capture is optional; window listeners still follow the pointer.
    }
    const originX = event.clientX;
    const originY = event.clientY;
    const start = shiftsRef.current.get(id) ?? { x: 0, y: 0 };
    let moved = false;

    const end = (quiet = false) => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      if (releaseGrabRef.current === end) releaseGrabRef.current = null;
      try {
        if (host.hasPointerCapture(pointerId)) host.releasePointerCapture(pointerId);
      } catch {
        // The node may already be gone after a campaign change.
      }
      if (quiet) return;
      setGrabbedId(null);
      if (moved) {
        skipClickRef.current = true;
        requestAnimationFrame(() => {
          skipClickRef.current = false;
        });
      }
    };

    const onMove = (native: PointerEvent) => {
      if (native.pointerId !== pointerId) return;
      const dx = native.clientX - originX;
      const dy = native.clientY - originY;
      if (!moved && Math.hypot(dx, dy) <= GRAB_SLOP_PX) return;
      if (!Number.isFinite(dx) || !Number.isFinite(dy)) return;
      moved = true;
      const svg = svgRef.current;
      const ratio = svg ? pixelsPerGraphUnit(svg, scaleRef.current) : { x: 1, y: 1 };
      const unitX = ratio.x > 0 && Number.isFinite(ratio.x) ? ratio.x : 1;
      const unitY = ratio.y > 0 && Number.isFinite(ratio.y) ? ratio.y : 1;
      const next = { x: start.x + dx / unitX, y: start.y + dy / unitY };
      setSessionShifts((prev) => {
        const current = prev.get(id);
        if (current && current.x === next.x && current.y === next.y) return prev;
        const map = new Map(prev);
        map.set(id, next);
        return map;
      });
    };

    const onUp = (native: PointerEvent) => {
      if (native.pointerId !== pointerId) return;
      end();
    };

    releaseGrabRef.current = end;
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
  }

  return (
    <div
      ref={stageRef}
      className="absolute inset-0 overflow-hidden pt-16 pb-24 lg:pr-[400px]"
      data-testid="relations-stage"
      data-viewport-scale="1"
      data-viewport-x="0"
      data-viewport-y="0"
    >
      <TransformWrapper
        ref={apiRef}
        minScale={0.05}
        maxScale={4}
        centerOnInit
        wheel={{ step: 0.01 }}
        pinch={{ step: 5 }}
        panning={{ disabled: grabbedId != null }}
        doubleClick={{ disabled: true }}
        onInit={(ref) => {
          apiRef.current = ref;
          void ref.fitToView({ mode: "contain", animationTime: 0 });
        }}
        onTransform={(_ref, state) => {
          scaleRef.current = state.scale;
          if (stageRef.current) {
            stageRef.current.dataset["viewportScale"] = String(state.scale);
            stageRef.current.dataset["viewportX"] = String(state.positionX);
            stageRef.current.dataset["viewportY"] = String(state.positionY);
          }
        }}
      >
        <GraphControls apiRef={apiRef} />
        <TransformComponent wrapperStyle={{ width: "100%", height: "100%" }}>
          <svg
            ref={svgRef}
            width={frame.width}
            height={frame.height}
            viewBox={`0 0 ${frame.width} ${frame.height}`}
            overflow="visible"
            role="img"
            aria-label={t("v2.network")}
            onClick={() => {
              if (consumeSuppressedClick()) return;
              onSelect(null);
            }}
          >
            <defs>
              <marker
                id="bond-arrow"
                viewBox="0 0 10 10"
                refX="8"
                refY="5"
                markerWidth="7"
                markerHeight="7"
                orient="auto-start-reverse"
              >
                <path d="M0,0 L10,5 L0,10 z" fill="var(--foreground)" />
              </marker>
              {edges.filter(isDuasVias).map((bond) => {
                const a = placed.get(bond.personagem_a_id);
                const b = placed.get(bond.personagem_b_id);
                if (!a || !b || !bond.tipo_ab || !bond.tipo_ba) return null;
                return (
                  <linearGradient
                    key={bond.id}
                    id={`bond-grad-${bond.id}`}
                    gradientUnits="userSpaceOnUse"
                    x1={a.x}
                    y1={a.y}
                    x2={b.x}
                    y2={b.y}
                  >
                    <stop offset="0%" stopColor={edgeStyle[bond.tipo_ab].color} />
                    <stop offset="42%" stopColor={edgeStyle[bond.tipo_ab].color} />
                    <stop offset="58%" stopColor={edgeStyle[bond.tipo_ba].color} />
                    <stop offset="100%" stopColor={edgeStyle[bond.tipo_ba].color} />
                  </linearGradient>
                );
              })}
            </defs>
            {edges.map((bond) => {
              const a = placed.get(bond.personagem_a_id);
              const b = placed.get(bond.personagem_b_id);
              const tipo = edgeDisplayTipo(bond);
              if (!a || !b || !tipo) return null;
              const duas = isDuasVias(bond);
              const styleA = edgeStyle[bond.tipo_ab ?? tipo];
              const styleB = edgeStyle[bond.tipo_ba ?? tipo];
              const on = edgeOn(bond);
              if (isolated && !on) return null;
              const start = trimEnd(b, a, DISC + 8);
              const end = trimEnd(a, b, DISC + 8);
              const nomeA = byId.get(bond.personagem_a_id)?.nome ?? "?";
              const nomeB = byId.get(bond.personagem_b_id)?.nome ?? "?";
              const labelA = formatTipoWithQual(
                t(`vinculoTipo.${bond.tipo_ab ?? tipo}`),
                bond.qualificador_ab,
              );
              const labelB = bond.tipo_ba
                ? formatTipoWithQual(t(`vinculoTipo.${bond.tipo_ba}`), bond.qualificador_ba)
                : "";
              const midLabel = formatTipoWithQual(
                t(`vinculoTipo.${tipo}`),
                bond.qualificador_ab || bond.qualificador_ba,
              );
              const aria = t("graph.edgeAria", {
                nomeA,
                nomeB,
                tipo: duas ? `${labelA} / ${labelB}` : midLabel,
              });
              return (
                <g key={bond.id} data-vinculo-id={bond.id} opacity={on ? 1 : 0.12}>
                  <line
                    x1={start.x}
                    y1={start.y}
                    x2={end.x}
                    y2={end.y}
                    stroke={duas ? `url(#bond-grad-${bond.id})` : styleA.color}
                    strokeWidth={duas ? Math.max(styleA.w, styleB.w) : styleA.w}
                    strokeDasharray={styleA.dash ?? styleB.dash}
                    strokeLinecap="round"
                    markerEnd={bond.direcao === "a_para_b" ? "url(#bond-arrow)" : undefined}
                    markerStart={bond.direcao === "b_para_a" ? "url(#bond-arrow)" : undefined}
                  />
                  {!duas && tipo === "vinculo_sangue" && (
                    <line
                      x1={start.x}
                      y1={start.y}
                      x2={end.x}
                      y2={end.y}
                      stroke="var(--background)"
                      strokeWidth={1.2}
                    />
                  )}
                  <title>{bond.publico ? aria : t("graph.edgeAriaOculto", { label: aria })}</title>
                  {isGm && !bond.publico && (
                    <EdgeNote point={pointAlong(start, end, 0.5)} text={t("graph.privateMarker")} />
                  )}
                  {isGm && tipHiddenFromPlayers(bond, bond.personagem_a_id) && (
                    <EdgeNote
                      point={pointAlong(start, end, 0.28)}
                      text={t("graph.unknownMarker")}
                    />
                  )}
                  {isGm && tipHiddenFromPlayers(bond, bond.personagem_b_id) && (
                    <EdgeNote
                      point={pointAlong(start, end, 0.72)}
                      text={t("graph.unknownMarker")}
                    />
                  )}
                  {on && selectedId != null && duas && (
                    <>
                      <EdgeLabel point={pointAlong(start, end, 0.3)} text={labelA} />
                      <EdgeLabel point={pointAlong(start, end, 0.7)} text={labelB} />
                    </>
                  )}
                  {on && selectedId != null && !duas && (
                    <EdgeLabel
                      point={pointAlong(start, end, 0.5)}
                      text={bond.direcao ? `${midLabel} →` : midLabel}
                    />
                  )}
                </g>
              );
            })}
            {frame.nodes.map((node) => {
              const person = byId.get(node.id);
              const spot = placed.get(node.id) ?? node;
              if (!person) return null;
              const selected = person.id === selectedId;
              const grabbed = person.id === grabbedId;
              const radius = selected ? 38 : DISC;
              const faded = nodeOpacity(person.id) < 1;
              return (
                <g
                  key={person.id}
                  data-node-id={person.id}
                  data-dimmed={faded ? "true" : "false"}
                  transform={`translate(${spot.x},${spot.y})`}
                  opacity={nodeOpacity(person.id)}
                  className={
                    grabbed
                      ? "cursor-grabbing touch-none select-none"
                      : "cursor-grab touch-none select-none"
                  }
                  onPointerDown={(event) => beginGrab(event, person.id)}
                  onMouseDown={(event) => event.stopPropagation()}
                  onClick={(event) => {
                    event.stopPropagation();
                    if (consumeSuppressedClick()) return;
                    onSelect(selected ? null : person.id);
                  }}
                  role="button"
                  aria-label={person.nome}
                  tabIndex={0}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") onSelect(selected ? null : person.id);
                  }}
                >
                  {person.retrato_url && (
                    <defs>
                      <clipPath id={`avatar-clip-${person.id}`}>
                        <circle r={radius} />
                      </clipPath>
                    </defs>
                  )}
                  <circle
                    r={radius}
                    fill={person.tipo === "pj" ? "var(--primary)" : "var(--card)"}
                  />
                  {person.retrato_url && !failedPortraits.has(person.id) && (
                    <image
                      href={person.retrato_url}
                      x={-radius}
                      y={-radius}
                      width={radius * 2}
                      height={radius * 2}
                      clipPath={`url(#avatar-clip-${person.id})`}
                      preserveAspectRatio="xMidYMid slice"
                      onError={() =>
                        setFailedPortraits((previous) => new Set(previous).add(person.id))
                      }
                    />
                  )}
                  {(!person.retrato_url || failedPortraits.has(person.id)) && (
                    <text
                      textAnchor="middle"
                      dy={radius * 0.35}
                      fontSize={radius * 0.7}
                      fontFamily="var(--font-display)"
                      fill={
                        person.tipo === "pj" ? "var(--primary-foreground)" : "var(--foreground)"
                      }
                    >
                      {initials(person.nome)}
                    </text>
                  )}
                  <circle
                    r={radius}
                    fill="none"
                    stroke={selected || grabbed ? "var(--seal)" : "var(--border)"}
                    strokeWidth={selected || grabbed ? 3 : 1.5}
                    strokeDasharray={person.status === "morto" ? "3 3" : undefined}
                    pointerEvents="none"
                  />
                  {person.tipo === "pj" && (
                    <circle r={radius + 6} fill="none" stroke="var(--seal)" strokeWidth={1.5} />
                  )}
                  <text
                    textAnchor="middle"
                    y={radius + 22}
                    fontSize={14}
                    fontFamily="var(--font-display)"
                    fill="var(--foreground)"
                  >
                    {person.nome}
                    {statusMark(person.status)}
                  </text>
                  {isGm && person.visivel_para_todos === false && (
                    <text y={radius + 38} textAnchor="middle" fontSize={10} fill="var(--seal)">
                      {t("graph.ocultoAria")}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
        </TransformComponent>
      </TransformWrapper>
    </div>
  );
}

function EdgeLabel({ point, text }: { point: { x: number; y: number }; text: string }) {
  const width = Math.max(72, text.length * 6.4 + 16);
  return (
    <g transform={`translate(${point.x}, ${point.y})`}>
      <rect
        x={-width / 2}
        y={-12}
        width={width}
        height={24}
        rx={12}
        fill="var(--card)"
        stroke="var(--border)"
      />
      <text
        textAnchor="middle"
        dy={4}
        fontSize={11}
        fill="var(--foreground)"
        fontFamily="var(--font-sans)"
      >
        {text}
      </text>
    </g>
  );
}

function EdgeNote({ point, text }: { point: { x: number; y: number }; text: string }) {
  return (
    <text
      x={point.x}
      y={point.y - 14}
      textAnchor="middle"
      fontSize={10}
      fill="var(--seal)"
      fontFamily="var(--font-sans)"
    >
      {text}
    </text>
  );
}
