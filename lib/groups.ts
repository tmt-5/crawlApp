import { getMembership } from "./storage";
import { supabase } from "./supabase";
import type { UserProfile } from "../types/user";
import type { Group, Member } from "../types/group";

const INVITE_CODE_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"; // no 0/O/1/I/L
const INVITE_CODE_LENGTH = 6;
const MAX_INVITE_CODE_ATTEMPTS = 5;
const UNIQUE_VIOLATION = "23505";

function generateInviteCode(): string {
  let code = "";
  for (let i = 0; i < INVITE_CODE_LENGTH; i++) {
    code +=
      INVITE_CODE_ALPHABET[Math.floor(Math.random() * INVITE_CODE_ALPHABET.length)];
  }
  return code;
}

async function addMember(groupId: string, profile: UserProfile): Promise<Member> {
  const { data, error } = await supabase
    .from("members")
    .insert({ group_id: groupId, name: profile.name, avatar: profile.avatarId })
    .select()
    .single();

  if (error || !data) {
    throw error ?? new Error("Kunne ikke legge til deg som medlem.");
  }

  return data;
}

export async function createGroup(
  name: string,
  profile: UserProfile,
  route: { id: string; city: string }
): Promise<{ group: Group; member: Member }> {
  for (let attempt = 0; attempt < MAX_INVITE_CODE_ATTEMPTS; attempt++) {
    const { data: group, error } = await supabase
      .from("groups")
      .insert({
        name,
        invite_code: generateInviteCode(),
        status: "planning",
        city: route.city,
        route_id: route.id,
      })
      .select()
      .single();

    if (error) {
      if (error.code === UNIQUE_VIOLATION) continue; // invite_code collision, retry
      throw error;
    }

    const member = await addMember(group.id, profile);
    return { group, member };
  }

  throw new Error("Kunne ikke generere en unik invitasjonskode.");
}

export type JoinResult =
  | { status: "joined"; group: Group; member: Member }
  | { status: "not_found" }
  | { status: "completed" };

export async function joinGroupByCode(code: string, profile: UserProfile): Promise<JoinResult> {
  const normalizedCode = code.trim().toUpperCase();

  const { data: group, error } = await supabase
    .from("groups")
    .select()
    .eq("invite_code", normalizedCode)
    .maybeSingle();

  if (error) throw error;
  if (!group) return { status: "not_found" };
  if (group.status === "completed") return { status: "completed" };

  // Entering the same code twice on this device reuses the member row
  // instead of adding a second copy of you to the group.
  const existingMemberId = await getMembership(group.id);
  if (existingMemberId) {
    const { data: existing, error: memberError } = await supabase
      .from("members")
      .select()
      .eq("id", existingMemberId)
      .maybeSingle();
    if (memberError) throw memberError;
    if (existing) return { status: "joined", group, member: existing };
  }

  const member = await addMember(group.id, profile);
  return { status: "joined", group, member };
}

export async function getGroup(groupId: string): Promise<Group | null> {
  const { data, error } = await supabase
    .from("groups")
    .select()
    .eq("id", groupId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function renameGroup(groupId: string, name: string): Promise<Group> {
  const { data, error } = await supabase
    .from("groups")
    .update({ name })
    .eq("id", groupId)
    .select()
    .single();

  if (error || !data) {
    throw error ?? new Error("Kunne ikke endre gruppenavnet.");
  }

  return data;
}

export async function startCrawl(groupId: string): Promise<Group> {
  const { data, error } = await supabase
    .from("groups")
    .update({ status: "active" })
    .eq("id", groupId)
    .select()
    .single();

  if (error || !data) {
    throw error ?? new Error("Kunne ikke starte crawlen.");
  }

  return data;
}

export async function getMembers(groupId: string): Promise<Member[]> {
  const { data, error } = await supabase
    .from("members")
    .select()
    .eq("group_id", groupId)
    .order("joined_at", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

// Moves the group forward to `nextIndex`. The filter makes it a no-op if
// someone else already moved the group further, so it never goes backwards.
// Returns the group as it is after the update.
export async function advanceToStop(groupId: string, nextIndex: number): Promise<Group> {
  const { error } = await supabase
    .from("groups")
    .update({ current_stop_index: nextIndex })
    .eq("id", groupId)
    .lt("current_stop_index", nextIndex);

  if (error) throw error;

  const group = await getGroup(groupId);
  if (!group) throw new Error("Fant ikke gruppen.");
  return group;
}

// Undo for a mis-tap on "Dra videre": moves the group back to an earlier stop.
export async function returnToStop(groupId: string, previousIndex: number): Promise<Group> {
  const { error } = await supabase
    .from("groups")
    .update({ current_stop_index: previousIndex })
    .eq("id", groupId)
    .gt("current_stop_index", previousIndex);

  if (error) throw error;

  const group = await getGroup(groupId);
  if (!group) throw new Error("Fant ikke gruppen.");
  return group;
}

export async function completeCrawl(groupId: string, stopCount: number): Promise<void> {
  const { error } = await supabase
    .from("groups")
    .update({ status: "completed", current_stop_index: stopCount })
    .eq("id", groupId);

  if (error) throw error;
}
