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
  return raw ? (JSON.parse(raw) as UserProfile) : null;
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
