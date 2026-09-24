import type { Venue } from "../types/venue";

const EARTH_RADIUS_M = 6_371_000;
// Straight-line distance undercounts city walking; streets add roughly a third.
const STREET_FACTOR = 1.3;
const WALK_METERS_PER_MIN = 80;

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

function distanceMeters(a: Venue, b: Venue): number | null {
  if (a.latitude == null || a.longitude == null || b.latitude == null || b.longitude == null) {
    return null;
  }
  const dLat = toRad(b.latitude - a.latitude);
  const dLng = toRad(b.longitude - a.longitude);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.latitude)) * Math.cos(toRad(b.latitude)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_M * Math.asin(Math.sqrt(h)) * STREET_FACTOR;
}

export function walkMinutes(from: Venue, to: Venue): number | null {
  const meters = distanceMeters(from, to);
  return meters == null ? null : Math.max(1, Math.round(meters / WALK_METERS_PER_MIN));
}

export function routeWalkMeters(venues: Venue[]): number {
  let total = 0;
  for (let i = 1; i < venues.length; i++) {
    total += distanceMeters(venues[i - 1], venues[i]) ?? 0;
  }
  return total;
}

// "1,2" — Norwegian decimal comma, unit left to the caller.
export function formatKm(meters: number): string {
  return (meters / 1000).toFixed(1).replace(".", ",");
}

export function walkMinutesForMeters(meters: number): number {
  return Math.round(meters / WALK_METERS_PER_MIN);
}
