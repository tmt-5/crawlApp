import type { RouteVenueWithVenue } from "../types/route";

export type StopStatus = "done" | "current" | "upcoming";

export type MapPerson = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  isMe: boolean;
};

export type MapPadding = { top: number; right: number; bottom: number; left: number };

export type CrawlMapProps = {
  stops: RouteVenueWithVenue[];
  // Index of the stop the group is at; -1 previews the route with nothing in progress.
  currentIndex: number;
  people?: MapPerson[];
  // "embedded" maps sit inside a scrolling page, so moving them takes two
  // fingers (or ctrl/cmd + scroll) and a one-finger swipe scrolls the page.
  mode?: "full" | "embedded";
  // Space taken by overlays (info card, sheet) that framing the route should keep clear of.
  framePadding?: Partial<MapPadding>;
  // Distance from the top of the map to the map controls.
  controlsTop?: number;
};

export function stopStatus(index: number, currentIndex: number): StopStatus {
  if (currentIndex < 0 || index > currentIndex) return "upcoming";
  return index < currentIndex ? "done" : "current";
}

// Legs are keyed by the stop they arrive at. The leg the group walks next is
// "current"; with no stop in progress every leg is drawn as current.
export type LegStatus = "walked" | "current" | "upcoming";

export function legStatus(arrivalIndex: number, currentIndex: number): LegStatus {
  if (currentIndex < 0) return "current";
  if (arrivalIndex <= currentIndex) return "walked";
  return arrivalIndex === currentIndex + 1 ? "current" : "upcoming";
}

export function initials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "?";
  const first = words[0][0];
  const last = words.length > 1 ? words[words.length - 1][0] : "";
  return (first + last).toUpperCase();
}
