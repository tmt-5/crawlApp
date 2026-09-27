// Native placeholder. Live location is web-only for now (see location.web.ts);
// the native app gets expo-location when it's picked up again.

export type Position = { latitude: number; longitude: number };

export type LocationError = "denied" | "unavailable";

export const locationSupported = false;

export function watchPosition(
  _onPosition: (position: Position) => void,
  onError: (error: LocationError) => void
): () => void {
  onError("unavailable");
  return () => {};
}
