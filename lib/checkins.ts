import { supabase } from "./supabase";
import type { Checkin, CheckinInput } from "../types/venue";

// Upsert so a retry after a flaky connection doesn't leave two check-ins
// for the same member at the same stop.
export async function saveCheckin(input: CheckinInput): Promise<Checkin> {
  const { data, error } = await supabase
    .from("checkins")
    .upsert(input, { onConflict: "group_id,venue_id,member_id" })
    .select()
    .single();

  if (error || !data) {
    throw error ?? new Error("Kunne ikke lagre check-inn.");
  }

  return data;
}

export async function getCheckins(groupId: string): Promise<Checkin[]> {
  const { data, error } = await supabase.from("checkins").select().eq("group_id", groupId);

  if (error) throw error;
  return data ?? [];
}
