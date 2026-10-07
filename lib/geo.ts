import type { LngLat, RouteVenueWithVenue } from "../types/route";

type Point = { latitude: number | null; longitude: number | null };

const EARTH_RADIUS_M = 6_371_000;
// Fallback for legs without a computed walking route: straight-line distance
// undercounts city walking; streets add roughly a third.
const STREET_FACTOR = 1.3;
const WALK_METERS_PER_MIN = 80;

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

// Straight-line distance, or null if either point lacks coordinates.
export function metersBetween(a: Point, b: Point): number | null {
  if (a.latitude == null || a.longitude == null || b.latitude == null || b.longitude == null) {
    return null;
  }
  const dLat = toRad(b.latitude - a.latitude);
  const dLng = toRad(b.longitude - a.longitude);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.latitude)) * Math.cos(toRad(b.latitude)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_M * Math.asin(Math.sqrt(h));
}

export type Walk = { meters: number; minutes: number };

// The walk arriving at stops[index] from the stop before it. Uses the computed
// street route when there is one, otherwise an estimate from coordinates.
export function legWalk(stops: RouteVenueWithVenue[], index: number): Walk | null {
  const stop = stops[index];
  const previous = stops[index - 1];
  if (!stop || !previous) return null;

  if (stop.leg_distance_m != null && stop.leg_duration_s != null) {
    return {
      meters: stop.leg_distance_m,
      minutes: Math.max(1, Math.round(stop.leg_duration_s / 60)),
    };
  }

  const straight = metersBetween(previous.venue, stop.venue);
  if (straight == null) return null;
  const meters = straight * STREET_FACTOR;
  return { meters, minutes: Math.max(1, Math.round(meters / WALK_METERS_PER_MIN)) };
}

export function routeWalk(stops: RouteVenueWithVenue[]): Walk {
  let meters = 0;
  let minutes = 0;
  for (let i = 1; i < stops.length; i++) {
    const leg = legWalk(stops, i);
    if (!leg) continue;
    meters += leg.meters;
    minutes += leg.minutes;
  }
  return { meters, minutes };
}

// The line to draw for the leg arriving at stops[index]: the street route when
// computed, a straight line otherwise.
export function legPath(stops: RouteVenueWithVenue[], index: number): LngLat[] | null {
  const stop = stops[index];
  const previous = stops[index - 1];
  if (!stop || !previous) return null;
  if (stop.leg_geometry && stop.leg_geometry.length > 1) return stop.leg_geometry;

  const { venue: a } = previous;
  const { venue: b } = stop;
  if (a.latitude == null || a.longitude == null || b.latitude == null || b.longitude == null) {
    return null;
  }
  return [
    [a.longitude, a.latitude],
    [b.longitude, b.latitude],
  ];
}

// "1,2" — Norwegian decimal comma, unit left to the caller.
export function formatKm(meters: number): string {
  return (meters / 1000).toFixed(1).replace(".", ",");
}

// "45 min", "2 t", "1 t 30 min".
export function formatMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest === 0 ? `${hours} t` : `${hours} t ${rest} min`;
}

// "800 m" under a kilometre, "1,2 km" above.
export function formatDistance(meters: number): string {
  return meters < 1000 ? `${Math.round(meters / 10) * 10} m` : `${formatKm(meters)} km`;
}
