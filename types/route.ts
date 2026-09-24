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

export interface RouteVenue {
  id: string;
  route_id: string;
  venue_id: string;
  order_index: number;
  note: string | null;
}

export interface RouteVenueWithVenue extends RouteVenue {
  venue: Venue;
}

export interface CrawlRouteWithStops extends CrawlRoute {
  stops: RouteVenueWithVenue[];
}
