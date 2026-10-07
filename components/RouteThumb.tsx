import { useMemo } from "react";
import { View } from "react-native";
import { Image } from "expo-image";
import { legPath } from "../lib/geo";
import { colors } from "../lib/theme";
import type { LngLat, RouteVenueWithVenue } from "../types/route";

const WIDTH = 80;
const HEIGHT = 89;
const PAD = 11;
const MAX_POINTS = 28;
const THUMB_PAPER = "#F4E8C9";

// Generic street backdrop from the Figma thumbnail; the route on top is real.
const STREETS = [
  { source: require("../assets/icons/thumb-street-west.svg"), left: -5, top: 4, width: 31, height: 42 },
  { source: require("../assets/icons/thumb-street-north.svg"), left: 3, top: 4, width: 69, height: 31 },
  { source: require("../assets/icons/thumb-street-center.svg"), left: 2, top: 30, width: 65, height: 42 },
  { source: require("../assets/icons/thumb-street-east.svg"), left: 61, top: 30, width: 14, height: 49 },
  { source: require("../assets/icons/thumb-street-south.svg"), left: 0, top: 56, width: 74, height: 22 },
  { source: require("../assets/icons/thumb-water.svg"), left: -4, top: 48, width: 69, height: 31 },
];

type Point = { x: number; y: number };

// Fits the route's real geometry into the thumbnail, north up.
function project(stops: RouteVenueWithVenue[]): { line: Point[]; dots: Point[] } {
  const stopCoords: LngLat[] = stops.flatMap(({ venue }) =>
    venue.latitude != null && venue.longitude != null
      ? [[venue.longitude, venue.latitude] as LngLat]
      : []
  );
  if (stopCoords.length === 0) return { line: [], dots: [] };

  const path = stops.flatMap((_, index) => legPath(stops, index) ?? []);
  const step = Math.max(1, Math.ceil(path.length / MAX_POINTS));
  const sampled = path.filter((_, index) => index % step === 0 || index === path.length - 1);

  const all = [...sampled, ...stopCoords];
  const lngScale = Math.cos((stopCoords[0][1] * Math.PI) / 180);
  const xs = all.map(([lng]) => lng * lngScale);
  const ys = all.map(([, lat]) => lat);
  const minX = Math.min(...xs);
  const maxY = Math.max(...ys);
  const spanX = Math.max(...xs) - minX || 1e-6;
  const spanY = maxY - Math.min(...ys) || 1e-6;
  const scale = Math.min((WIDTH - PAD * 2) / spanX, (HEIGHT - PAD * 2) / spanY);
  const offsetX = (WIDTH - spanX * scale) / 2;
  const offsetY = (HEIGHT - spanY * scale) / 2;

  const toPoint = ([lng, lat]: LngLat): Point => ({
    x: offsetX + (lng * lngScale - minX) * scale,
    y: offsetY + (maxY - lat) * scale,
  });
  return { line: sampled.map(toPoint), dots: stopCoords.map(toPoint) };
}

function Segment({ from, to, color, shift }: { from: Point; to: Point; color: string; shift: number }) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const length = Math.hypot(dx, dy);
  if (length < 0.5) return null;
  const thickness = 3;
  return (
    <View
      style={{
        position: "absolute",
        // Rounded ends overlap at the joints so bends stay continuous.
        width: length + thickness,
        height: thickness,
        borderRadius: thickness / 2,
        backgroundColor: color,
        left: (from.x + to.x) / 2 - (length + thickness) / 2 + shift,
        top: (from.y + to.y) / 2 - thickness / 2 + shift,
        transform: [{ rotate: `${Math.atan2(dy, dx)}rad` }],
      }}
    />
  );
}

// Small map of a route for list cards: ochre line with an ink offset, one dot per stop.
export default function RouteThumb({ stops }: { stops: RouteVenueWithVenue[] }) {
  const { line, dots } = useMemo(() => project(stops), [stops]);

  return (
    <View
      accessible={false}
      className="items-center justify-center self-stretch border-r-[1.5px] border-ink"
      style={{ width: WIDTH, backgroundColor: THUMB_PAPER, overflow: "hidden" }}
    >
      <View style={{ width: WIDTH, height: HEIGHT }}>
        {STREETS.map(({ source, ...box }, index) => (
          <Image key={index} source={source} style={{ position: "absolute", ...box }} />
        ))}
        {[colors.ink, colors.ochre].map((color, layer) =>
          line.slice(1).map((point, index) => (
            <Segment
              key={`${layer}-${index}`}
              from={line[index]}
              to={point}
              color={color}
              shift={layer === 0 ? 1 : 0}
            />
          ))
        )}
        {dots.map((dot, index) => (
          <View
            key={index}
            style={{
              position: "absolute",
              left: dot.x - 4.5,
              top: dot.y - 4.5,
              width: 9,
              height: 9,
              borderRadius: 4.5,
              borderWidth: 1.5,
              borderColor: colors.ink,
              backgroundColor: THUMB_PAPER,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <View style={{ width: 3, height: 3, borderRadius: 1.5, backgroundColor: colors.ink }} />
          </View>
        ))}
      </View>
    </View>
  );
}
