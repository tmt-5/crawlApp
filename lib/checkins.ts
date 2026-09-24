import { supabase } from "./supabase";
import type { Checkin, CheckinInput } from "../types/venue";

export async function createCheckin(input: CheckinInput): Promise<Checkin> {
  const { data, error } = await supabase
    .from("checkins")
    .insert(input)
    .select()
    .single();

  if (error || !data) {
    throw error ?? new Error("Kunne ikke lagre check-inn.");
  }

  return data;
}
