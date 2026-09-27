import "maplibre-gl/dist/maplibre-gl.css";
import "./CrawlMap.web.css";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Pressable, View } from "react-native";
import maplibregl from "maplibre-gl";
import type { GeoJSONSource, LngLatBoundsLike, Map as MapLibreMap, Marker } from "maplibre-gl";
import { legPath } from "../lib/geo";
import { MAP_STYLE } from "../lib/mapStyle";
import type { LngLat } from "../types/route";
import {
  initials,
  legStatus,
  stopStatus,
  type CrawlMapProps,
  type MapPerson,
  type StopStatus,
} from "./CrawlMap.types";

const INK = "#241d18";
const PAPER = "#f4ece0";
const RAISED = "#fff8ec";
const OXBLOOD = "#8c2f24";
const MUSTARD = "#d9a026";
const SLATE = "#3f6b5f";

const OSLO: LngLat = [10.7522, 59.9139];
const HIT_SIZE = 44;
const CONTROLS_WIDTH = 52;
const MAX_FRAME_ZOOM = 16.5;

const LOCALE = {
  "CooperativeGesturesHandler.WindowsHelpText": "Hold Ctrl og scroll for å zoome",
  "CooperativeGesturesHandler.MacHelpText": "Hold ⌘ og scroll for å zoome",
  "CooperativeGesturesHandler.MobileHelpText": "Bruk to fingre for å flytte kartet",
};

export default function CrawlMap({
  stops,
  currentIndex,
  people = [],
  mode = "full",
  framePadding,
  controlsTop = 12,
}: CrawlMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const stopMarkers = useRef<Marker[]>([]);
  const peopleMarkers = useRef(new Map<string, Marker>());
  const [styleLoaded, setStyleLoaded] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);

  const padTop = framePadding?.top ?? 0;
  const padRight = framePadding?.right ?? 0;
  const padBottom = framePadding?.bottom ?? 0;
  const padLeft = framePadding?.left ?? 0;
  const padding = useMemo(
    () => ({
      top: 40 + padTop,
      right: 24 + CONTROLS_WIDTH + padRight,
      bottom: 48 + padBottom,
      left: 40 + padLeft,
    }),
    [padTop, padRight, padBottom, padLeft]
  );

  const legs = useMemo(
    () =>
      stops.map((_, index) => legPath(stops, index)).filter((path): path is LngLat[] => !!path),
    [stops]
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const map = new maplibregl.Map({
      container,
      style: MAP_STYLE,
      center: OSLO,
      zoom: 13,
      minZoom: 10,
      maxZoom: 19,
      attributionControl: { compact: false },
      cooperativeGestures: mode === "embedded",
      dragRotate: false,
      pitchWithRotate: false,
      touchPitch: false,
      locale: LOCALE,
    });
    map.touchZoomRotate.disableRotation();
    map.keyboard.disableRotation();
    map.on("load", () => {
      addRouteLayers(map);
      setStyleLoaded(true);
    });
    map.on("click", () => setSelected(null));

    const observer = new ResizeObserver(() => map.resize());
    observer.observe(container);
    mapRef.current = map;

    return () => {
      observer.disconnect();
      map.remove();
      mapRef.current = null;
      setStyleLoaded(false);
    };
    // The map is created once; `mode` is fixed for the lifetime of a screen.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const frameRoute = useCallback(
    (animate: boolean) => {
      const map = mapRef.current;
      if (!map) return;
      const points: LngLat[] = [...legs.flat()];
      for (const { venue } of stops) {
        if (venue.latitude != null && venue.longitude != null) {
          points.push([venue.longitude, venue.latitude]);
        }
      }
      if (points.length === 0) return;

      const lngs = points.map(([lng]) => lng);
      const lats = points.map(([, lat]) => lat);
      const bounds: LngLatBoundsLike = [
        [Math.min(...lngs), Math.min(...lats)],
        [Math.max(...lngs), Math.max(...lats)],
      ];
      map.fitBounds(bounds, { padding, maxZoom: MAX_FRAME_ZOOM, duration: animate ? 600 : 0 });
    },
    [legs, stops, padding]
  );

  // Frame the whole route when it loads or the space around it changes.
  useEffect(() => {
    frameRoute(false);
  }, [frameRoute]);

  useEffect(() => {
    const source = mapRef.current?.getSource("legs") as GeoJSONSource | undefined;
    if (!styleLoaded || !source) return;
    source.setData({
      type: "FeatureCollection",
      features: stops.flatMap((_, index) => {
        const path = legPath(stops, index);
        if (!path) return [];
        return [
          {
            type: "Feature" as const,
            properties: { status: legStatus(index, currentIndex) },
            geometry: { type: "LineString" as const, coordinates: path },
          },
        ];
      }),
    });
  }, [styleLoaded, stops, currentIndex]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    stopMarkers.current.forEach((marker) => marker.remove());
    stopMarkers.current = stops.flatMap(({ venue }, index) => {
      if (venue.latitude == null || venue.longitude == null) return [];
      const status = stopStatus(index, currentIndex);
      const showLabel = selected === index || (selected === null && status === "current");
      const element = stopElement(index + 1, status, showLabel ? venue.name : null, () =>
        setSelected((previous) => (previous === index ? null : index))
      );
      element.style.zIndex = showLabel ? "3" : status === "current" ? "2" : "1";
      return [new maplibregl.Marker({ element }).setLngLat([venue.longitude, venue.latitude]).addTo(map)];
    });
  }, [stops, currentIndex, selected]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const markers = peopleMarkers.current;
    const seen = new Set<string>();
    for (const person of people) {
      seen.add(person.id);
      const existing = markers.get(person.id);
      if (existing) {
        existing.setLngLat([person.longitude, person.latitude]);
      } else {
        markers.set(
          person.id,
          new maplibregl.Marker({ element: personElement(person) })
            .setLngLat([person.longitude, person.latitude])
            .addTo(map)
        );
      }
    }
    for (const [id, marker] of markers) {
      if (!seen.has(id)) {
        marker.remove();
        markers.delete(id);
      }
    }
  }, [people]);

  const me = people.find((person) => person.isMe);

  return (
    <View style={{ flex: 1, backgroundColor: PAPER }}>
      <div ref={containerRef} className="crawl-map" style={{ position: "absolute", inset: 0 }} />
      <View style={{ position: "absolute", top: controlsTop, right: 12, gap: 8 }}>
        <MapButton label="Zoom inn" onPress={() => mapRef.current?.zoomIn()}>
          <Bar horizontal />
          <Bar />
        </MapButton>
        <MapButton label="Zoom ut" onPress={() => mapRef.current?.zoomOut()}>
          <Bar horizontal />
        </MapButton>
        <MapButton label="Vis hele ruten" onPress={() => frameRoute(true)}>
          <FrameIcon />
        </MapButton>
        {me ? (
          <MapButton
            label="Vis meg"
            onPress={() =>
              mapRef.current?.easeTo({
                center: [me.longitude, me.latitude],
                zoom: Math.max(mapRef.current.getZoom(), 16),
                duration: 600,
              })
            }
          >
            <View className="h-3 w-3 rounded-full border-2 border-ink bg-oxblood" />
          </MapButton>
        ) : null}
      </View>
    </View>
  );
}

function addRouteLayers(map: MapLibreMap) {
  map.addSource("legs", { type: "geojson", data: { type: "FeatureCollection", features: [] } });
  const layout = { "line-cap": "round", "line-join": "round" } as const;
  map.addLayer({
    id: "legs-casing",
    type: "line",
    source: "legs",
    layout,
    paint: { "line-color": INK, "line-width": 9, "line-opacity": 0.18 },
  });
  map.addLayer({
    id: "legs-walked",
    type: "line",
    source: "legs",
    filter: ["==", ["get", "status"], "walked"],
    layout,
    paint: { "line-color": INK, "line-width": 5, "line-opacity": 0.5 },
  });
  map.addLayer({
    id: "legs-upcoming",
    type: "line",
    source: "legs",
    filter: ["==", ["get", "status"], "upcoming"],
    layout,
    paint: { "line-color": OXBLOOD, "line-width": 5, "line-dasharray": [0.4, 1.8] },
  });
  map.addLayer({
    id: "legs-current",
    type: "line",
    source: "legs",
    filter: ["==", ["get", "status"], "current"],
    layout,
    paint: { "line-color": OXBLOOD, "line-width": 5 },
  });
}

function stopElement(
  number: number,
  status: StopStatus,
  label: string | null,
  onClick: () => void
): HTMLElement {
  const size = status === "current" ? 40 : 30;
  const root = document.createElement("div");
  Object.assign(root.style, {
    width: `${HIT_SIZE}px`,
    height: `${HIT_SIZE}px`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  });

  const pin = document.createElement("div");
  Object.assign(pin.style, {
    width: `${size}px`,
    height: `${size}px`,
    boxSizing: "border-box",
    borderRadius: "50%",
    border: status === "current" ? `4px solid ${MUSTARD}` : `3px solid ${INK}`,
    background: status === "done" ? INK : status === "current" ? OXBLOOD : RAISED,
    color: status === "upcoming" ? INK : RAISED,
    boxShadow: `2px 2px 0 ${INK}`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: status === "done" ? "DMSans_700Bold" : "AlfaSlabOne_400Regular",
    fontSize: status === "current" ? "16px" : "12px",
    lineHeight: "1",
  });
  pin.textContent = status === "done" ? "✓" : String(number);
  root.appendChild(pin);

  if (label) {
    const plate = document.createElement("div");
    Object.assign(plate.style, {
      position: "absolute",
      left: `${(HIT_SIZE + size) / 2 + 6}px`,
      top: "50%",
      transform: "translateY(-50%)",
      whiteSpace: "nowrap",
      maxWidth: "140px",
      overflow: "hidden",
      textOverflow: "ellipsis",
      background: RAISED,
      border: `2px solid ${INK}`,
      boxShadow: `2px 2px 0 ${INK}`,
      padding: "3px 7px",
      fontFamily: "DMSans_700Bold",
      fontSize: "11px",
      letterSpacing: "0.08em",
      textTransform: "uppercase",
      color: INK,
      pointerEvents: "none",
    });
    plate.textContent = label;
    root.appendChild(plate);
  }

  root.addEventListener("click", (event) => {
    event.stopPropagation();
    onClick();
  });
  return root;
}

function personElement(person: MapPerson): HTMLElement {
  const element = document.createElement("div");
  Object.assign(element.style, {
    width: "32px",
    height: "32px",
    boxSizing: "border-box",
    borderRadius: "50%",
    border: `2px solid ${PAPER}`,
    background: person.isMe ? OXBLOOD : SLATE,
    boxShadow: `2px 2px 0 ${INK}`,
    color: PAPER,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "DMSans_700Bold",
    fontSize: "12px",
    zIndex: person.isMe ? "5" : "4",
  });
  element.textContent = initials(person.name);
  element.title = person.isMe ? `${person.name} (deg)` : person.name;
  return element;
}

function MapButton({
  label,
  onPress,
  children,
}: {
  label: string;
  onPress: () => void;
  children: React.ReactNode;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      className="h-10 w-10 items-center justify-center border-[3px] border-ink bg-mustard active:opacity-80"
      style={{
        shadowColor: INK,
        shadowOffset: { width: 3, height: 3 },
        shadowOpacity: 1,
        shadowRadius: 0,
      }}
    >
      {children}
    </Pressable>
  );
}

function Bar({ horizontal }: { horizontal?: boolean }) {
  return (
    <View
      className="absolute bg-ink"
      style={horizontal ? { width: 14, height: 3 } : { width: 3, height: 14 }}
    />
  );
}

// Four corner brackets: "fit everything in view".
function FrameIcon() {
  const corner = { position: "absolute" as const, width: 6, height: 6, borderColor: INK };
  return (
    <View style={{ width: 16, height: 16 }}>
      <View style={{ ...corner, top: 0, left: 0, borderTopWidth: 3, borderLeftWidth: 3 }} />
      <View style={{ ...corner, top: 0, right: 0, borderTopWidth: 3, borderRightWidth: 3 }} />
      <View style={{ ...corner, bottom: 0, left: 0, borderBottomWidth: 3, borderLeftWidth: 3 }} />
      <View style={{ ...corner, bottom: 0, right: 0, borderBottomWidth: 3, borderRightWidth: 3 }} />
    </View>
  );
}
