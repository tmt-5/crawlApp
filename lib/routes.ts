import { supabase } from "./supabase";
import type { CrawlRoute, CrawlRouteWithStops } from "../types/route";

const ROUTE_WITH_STOPS = "*, stops:route_venues(*, venue:venues(*))";

function sortStops(route: CrawlRouteWithStops): CrawlRouteWithStops {
  return {
    ...route,
    stops: [...(route.stops ?? [])].sort((a, b) => a.order_index - b.order_index),
  };
}

export async function getRoutesByCity(city: string): Promise<CrawlRouteWithStops[]> {
  const { data, error } = await supabase
    .from("routes")
    .select(ROUTE_WITH_STOPS)
    .eq("city", city)
    .eq("is_published", true)
    .order("sort_order", { ascending: true });

  if (error) throw error;
  return ((data ?? []) as unknown as CrawlRouteWithStops[]).map(sortStops);
}

export async function getRoute(routeId: string): Promise<CrawlRouteWithStops | null> {
  const { data, error } = await supabase
    .from("routes")
    .select(ROUTE_WITH_STOPS)
    .eq("id", routeId)
    .maybeSingle();

  if (error) throw error;
  return data ? sortStops(data as unknown as CrawlRouteWithStops) : null;
}

export async function getRoutesForVenue(venueId: string): Promise<CrawlRoute[]> {
  const { data, error } = await supabase
    .from("route_venues")
    .select("route:routes(*)")
    .eq("venue_id", venueId);

  if (error) throw error;
  const rows = (data ?? []) as unknown as { route: CrawlRoute | null }[];
  return rows
    .map((row) => row.route)
    .filter((route): route is CrawlRoute => !!route && route.is_published);
}
