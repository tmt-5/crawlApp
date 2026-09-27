export type Position = { latitude: number; longitude: number };

export type LocationError = "denied" | "unavailable";

export const locationSupported = typeof navigator !== "undefined" && "geolocation" in navigator;

// Browser geolocation. Only runs while the page is open; browsers don't allow
// background location for web pages.
export function watchPosition(
  onPosition: (position: Position) => void,
  onError: (error: LocationError) => void
): () => void {
  if (!locationSupported) {
    onError("unavailable");
    return () => {};
  }
  const id = navigator.geolocation.watchPosition(
    ({ coords }) => onPosition({ latitude: coords.latitude, longitude: coords.longitude }),
    (error) => onError(error.code === error.PERMISSION_DENIED ? "denied" : "unavailable"),
    { enableHighAccuracy: true, maximumAge: 10_000, timeout: 30_000 }
  );
  return () => navigator.geolocation.clearWatch(id);
}
