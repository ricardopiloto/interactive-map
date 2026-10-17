import { useEffect, useRef, useState, type MouseEvent, type ReactNode } from "react";
import { Footprints, LocateFixed, Minus, Plus, Shield } from "lucide-react";
import {
  TransformComponent,
  TransformWrapper,
  useControls,
  type ReactZoomPanPinchRef,
} from "react-zoom-pan-pinch";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

/** Pin and party coordinates are percentages (0–100), matching the template overlay space. */
export interface MapPin {
  id: string;
  name: string;
  x: number;
  y: number;
  visited: boolean;
  color?: string;
  pernoite?: boolean;
}

export interface MapParty {
  x: number;
  y: number;
  formato: "bandeira" | "brasao";
}

export interface MapMarker {
  id: string;
  x: number;
  y: number;
  color: string;
  testid?: string;
  title?: string;
}

export interface MapProps {
  pins: MapPin[];
  markers?: MapMarker[];
  selected?: string | undefined;
  onSelect?: (id: string) => void;
  mapUrl?: string | null;
  group?: MapParty | null;
  overlay?: ReactNode;
  dim?: string[];
  focusOffsetX?: number;
  /** Fly the camera to the selected pin. Off when several pins must stay in view. */
  focusOnSelect?: boolean;
  className?: string;
  children?: ReactNode;
  interactive?: boolean;
  placing?: boolean;
  placeLabel?: string;
  /** Click on the map image, in unit coordinates (0–1). */
  onPlace?: (point: { x: number; y: number }) => void;
  onContextMenu?: (() => void) | undefined;
  onReplaceMap?: (() => void) | undefined;
}

function MapControls({
  onReplaceMap,
  hasGroup,
}: {
  onReplaceMap?: (() => void) | undefined;
  hasGroup: boolean;
}) {
  const { t } = useTranslation("mapa");
  const { zoomIn, zoomOut, zoomToElement } = useControls();
  return (
    <div className="absolute right-3 bottom-24 z-10 flex flex-col gap-1 lg:right-4 lg:bottom-6">
      {onReplaceMap && (
        <button
          type="button"
          onClick={onReplaceMap}
          className="glass rounded-full px-3 py-2 text-xs font-medium"
          aria-label={t("controls.replaceMap")}
        >
          {t("controls.replaceMapShort")}
        </button>
      )}
      <div className="glass flex flex-col rounded-full p-1">
        <button
          type="button"
          onClick={() => zoomIn()}
          className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-accent"
          aria-label={t("v2.zoomIn")}
        >
          <Plus className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => zoomOut()}
          className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-accent"
          aria-label={t("v2.zoomOut")}
        >
          <Minus className="h-4 w-4" />
        </button>
      </div>
      {hasGroup && (
        <button
          type="button"
          onClick={() => {
            const party = document.getElementById("map-party");
            if (party) void zoomToElement(party);
          }}
          className="glass flex h-12 w-12 items-center justify-center rounded-full"
          aria-label={t("v2.centerGroup")}
        >
          <LocateFixed className="h-4 w-4 text-verdigris" />
        </button>
      )}
    </div>
  );
}

function FocusSelected({
  id,
  offsetX,
  enabled,
}: {
  id?: string | undefined;
  offsetX: number;
  enabled: boolean;
}) {
  const { zoomToElement } = useControls();
  const zoomToElementRef = useRef(zoomToElement);
  zoomToElementRef.current = zoomToElement;
  useEffect(() => {
    if (!enabled || !id) return;
    const pin = document.getElementById(`map-pin-${id}`);
    if (pin) void zoomToElementRef.current(pin, 1.2, 400, "easeOut", offsetX);
  }, [enabled, id, offsetX]);
  return null;
}

export function WorldMap({
  pins,
  markers = [],
  selected,
  onSelect,
  mapUrl,
  group,
  overlay,
  dim = [],
  focusOffsetX = 0,
  focusOnSelect = true,
  className,
  children,
  interactive = true,
  placing = false,
  placeLabel,
  onPlace,
  onContextMenu,
  onReplaceMap,
}: MapProps) {
  const { t } = useTranslation("mapa");
  const apiRef = useRef<ReactZoomPanPinchRef | null>(null);
  const [scale, setScale] = useState(1);
  const [canvas, setCanvas] = useState({ w: 1920, h: 1280 });
  const [failed, setFailed] = useState(false);
  const pinScale = 1 / Math.max(scale, 0.55);

  useEffect(() => {
    setFailed(false);
  }, [mapUrl]);

  useEffect(() => {
    void apiRef.current?.fitToView({ mode: "cover", animationTime: 0 });
  }, [mapUrl, canvas.w, canvas.h]);

  function placeFromEvent(event: MouseEvent<HTMLDivElement>) {
    if (!onPlace) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = rect.width === 0 ? 0 : (event.clientX - rect.left) / rect.width;
    const y = rect.height === 0 ? 0 : (event.clientY - rect.top) / rect.height;
    onPlace({
      x: Math.min(1, Math.max(0, x)),
      y: Math.min(1, Math.max(0, y)),
    });
  }

  return (
    <div
      className={cn("relative h-full w-full overflow-hidden bg-muted select-none", className)}
      role="application"
      aria-label={t("v2.mapInstructions")}
    >
      <TransformWrapper
        ref={apiRef}
        minScale={0.5}
        maxScale={4}
        centerOnInit
        wheel={{ step: 0.01 }}
        pinch={{ step: 5 }}
        panning={{ disabled: false }}
        doubleClick={{ disabled: true }}
        onInit={(ref) => {
          apiRef.current = ref;
          void ref.fitToView({ mode: "cover", animationTime: 0 });
        }}
        onTransform={(_ref, state) => setScale(state.scale)}
      >
        <MapControls onReplaceMap={onReplaceMap} hasGroup={Boolean(group)} />
        <FocusSelected id={selected} offsetX={focusOffsetX} enabled={focusOnSelect} />
        <TransformComponent
          wrapperStyle={{ width: "100%", height: "100%" }}
          contentStyle={{ width: canvas.w, height: canvas.h }}
        >
          <div
            data-testid="map-stage"
            className="relative"
            style={{ width: canvas.w, height: canvas.h }}
            onClick={placing ? placeFromEvent : undefined}
            onContextMenu={
              onContextMenu
                ? (event) => {
                    event.preventDefault();
                    onContextMenu();
                  }
                : undefined
            }
            aria-label={placing ? placeLabel : undefined}
          >
            {failed || !mapUrl ? <div className="absolute inset-0 bg-muted" /> : null}
            {mapUrl ? (
              <img
                src={mapUrl}
                alt={t("v2.mapImage")}
                draggable={false}
                className="absolute inset-0 h-full w-full"
                onLoad={(event) => {
                  const image = event.currentTarget;
                  if (image.naturalWidth > 0 && image.naturalHeight > 0) {
                    setCanvas({ w: image.naturalWidth, h: image.naturalHeight });
                    setFailed(false);
                  }
                }}
                onError={() => setFailed(true)}
              />
            ) : null}
            {overlay && (
              <svg
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                className="pointer-events-none absolute inset-0 h-full w-full"
                aria-hidden
              >
                {overlay}
              </svg>
            )}
            {markers.map((marker) => (
              <div
                key={marker.id}
                data-testid={marker.testid}
                title={marker.title}
                className="pointer-events-none absolute h-3 w-3 rounded-full border-2 border-card"
                style={{
                  left: `${marker.x}%`,
                  top: `${marker.y}%`,
                  backgroundColor: marker.color,
                  transform: `scale(${1 / scale}) translate(-50%, -50%)`,
                }}
              />
            ))}
            {pins.map((pin) => {
              const isSel = pin.id === selected;
              return (
                <button
                  key={pin.id}
                  id={`map-pin-${pin.id}`}
                  type="button"
                  disabled={!interactive}
                  onClick={(event) => {
                    event.stopPropagation();
                    if (interactive) onSelect?.(pin.id);
                  }}
                  className={cn(
                    "group absolute transition-opacity",
                    dim.includes(pin.id) && "opacity-40",
                  )}
                  style={{
                    left: `${pin.x}%`,
                    top: `${pin.y}%`,
                  }}
                  aria-label={`${pin.name}, ${pin.visited ? t("v2.visited") : t("v2.knownNotVisited")}`}
                  aria-pressed={isSel}
                >
                  <span
                    className="relative flex h-6 w-6 items-center justify-center"
                    style={{
                      transform: `translate(-50%,-50%) scale(${pinScale})`,
                    }}
                  >
                    {isSel && (
                      <span className="animate-pulse-ring absolute inset-0 rounded-full border-2 border-seal" />
                    )}
                    {pin.pernoite && (
                      <span
                        className="absolute -inset-1 rounded-full border-[3px] border-amber-500"
                        data-testid={`overnight-pin-${pin.id}`}
                      />
                    )}
                    <span
                      className={cn(
                        "flex items-center justify-center rounded-full border-2 shadow-float transition-transform group-hover:scale-110",
                        isSel
                          ? "h-6 w-6 border-card bg-seal"
                          : pin.visited
                            ? "h-4 w-4 border-card"
                            : "h-4 w-4 border-dashed border-primary bg-card",
                      )}
                      style={isSel || !pin.color ? undefined : { backgroundColor: pin.color }}
                    />
                    <span
                      className={cn(
                        "absolute top-[calc(100%+0.375rem)] left-1/2 -translate-x-1/2 rounded-full px-2.5 py-0.5 font-display text-sm whitespace-nowrap shadow-float",
                        isSel ? "bg-seal text-seal-foreground" : "glass text-foreground",
                        !pin.visited && !isSel && "italic",
                      )}
                    >
                      {pin.name}
                    </span>
                  </span>
                </button>
              );
            })}
            {group && (
              <div
                id="map-party"
                data-formato={group.formato}
                className="pointer-events-none absolute"
                style={{
                  left: `${group.x}%`,
                  top: `${group.y}%`,
                  transform: `translate(-50%, -175%) scale(${pinScale})`,
                }}
              >
                {group.formato === "brasao" ? (
                  <span className="flex h-9 w-9 items-center justify-center rounded-md bg-seal text-seal-foreground shadow-float">
                    <Shield className="h-4 w-4" aria-hidden />
                    <span className="sr-only">{t("v2.group")}</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-1 rounded-full bg-verdigris px-2 py-1 text-[11px] font-semibold text-seal-foreground shadow-float">
                    <Footprints className="h-3 w-3" aria-hidden /> {t("v2.group")}
                  </span>
                )}
              </div>
            )}
          </div>
        </TransformComponent>
      </TransformWrapper>
      {children}
    </div>
  );
}
