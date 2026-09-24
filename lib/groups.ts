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

export async function joinGroupByCode(
  code: string,
  profile: UserProfile
): Promise<{ group: Group; member: Member } | null> {
  const normalizedCode = code.trim().toUpperCase();

  const { data: group, error } = await supabase
    .from("groups")
    .select()
    .eq("invite_code", normalizedCode)
    .maybeSingle();

  if (error) throw error;
  if (!group) return null;

  const member = await addMember(group.id, profile);
  return { group, member };
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
