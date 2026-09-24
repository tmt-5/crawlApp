import { supabase } from "./supabase";
import type { Venue } from "../types/venue";

export async function getVenuesByCity(city: string): Promise<Venue[]> {
  const { data, error } = await supabase
    .from("venues")
    .select()
    .eq("city", city)
    .order("name", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function getVenue(venueId: string): Promise<Venue | null> {
  const { data, error } = await supabase
    .from("venues")
    .select()
    .eq("id", venueId)
    .maybeSingle();

  if (error) throw error;
  return data;
}
