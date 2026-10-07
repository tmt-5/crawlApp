import AsyncStorage from "@react-native-async-storage/async-storage";
import type { UserProfile } from "../types/user";

const PROFILE_KEY = "crawl:profile";
const MEMBERSHIP_PREFIX = "crawl:membership:";
const LAST_GROUP_KEY = "crawl:lastGroup";

export async function saveProfile(profile: UserProfile): Promise<void> {
  await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}

export async function getProfile(): Promise<UserProfile | null> {
  const raw = await AsyncStorage.getItem(PROFILE_KEY);
  if (!raw) return null;
  // Profiles saved before pictures existed have a role id instead of `avatar`.
  const stored = JSON.parse(raw) as Partial<UserProfile>;
  return stored.name ? { name: stored.name, avatar: stored.avatar ?? "" } : null;
}

export async function clearProfile(): Promise<void> {
  await AsyncStorage.removeItem(PROFILE_KEY);
}

export async function saveMembership(groupId: string, memberId: string): Promise<void> {
  await AsyncStorage.setItem(`${MEMBERSHIP_PREFIX}${groupId}`, memberId);
  await AsyncStorage.setItem(LAST_GROUP_KEY, groupId);
}

export async function getMembership(groupId: string): Promise<string | null> {
  return AsyncStorage.getItem(`${MEMBERSHIP_PREFIX}${groupId}`);
}

// The group joined or created most recently, so the explore screen can offer a way back.
export async function getLastGroupId(): Promise<string | null> {
  return AsyncStorage.getItem(LAST_GROUP_KEY);
}

const SHARE_LOCATION_PREFIX = "crawl:shareLocation:";

// Whether this device shares its position with the group, remembered so a
// reload during the crawl doesn't silently stop sharing.
export async function getShareLocation(groupId: string): Promise<boolean> {
  return (await AsyncStorage.getItem(`${SHARE_LOCATION_PREFIX}${groupId}`)) === "1";
}

export async function setShareLocation(groupId: string, enabled: boolean): Promise<void> {
  if (enabled) {
    await AsyncStorage.setItem(`${SHARE_LOCATION_PREFIX}${groupId}`, "1");
  } else {
    await AsyncStorage.removeItem(`${SHARE_LOCATION_PREFIX}${groupId}`);
  }
}
