import type { Venue } from "./venue";

export type RouteKind = "curated" | "community";

export interface CrawlRoute {
  id: string;
  city: string;
  slug: string;
  name: string;
  tagline: string | null;
  description: string | null;
  neighborhood: string | null;
  kind: RouteKind;
  created_by: string | null;
  is_published: boolean;
  sort_order: number;
  created_at: string;
}

export type LngLat = [number, number];

export interface LegStep {
  type: string;
  modifier: string | null;
  name: string | null;
  distance: number;
  duration: number;
  location: LngLat;
}

export interface RouteVenue {
  id: string;
  route_id: string;
  venue_id: string;
  order_index: number;
  note: string | null;
  // The walking leg arriving at this stop from the previous one; null on the first stop
  // or until scripts/compute-route-legs.mjs has been run for the route.
  leg_geometry: LngLat[] | null;
  leg_distance_m: number | null;
  leg_duration_s: number | null;
  leg_steps: LegStep[] | null;
}

export interface RouteVenueWithVenue extends RouteVenue {
  venue: Venue;
}

export interface CrawlRouteWithStops extends CrawlRoute {
  stops: RouteVenueWithVenue[];
}
