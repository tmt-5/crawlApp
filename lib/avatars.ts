// A profile picture is optional. `avatar` is "" (show initials), "preset:<id>"
// (one of the drawn avatars below) or a data URL (an uploaded photo). Anything
// else, such as the role ids older versions stored, falls back to initials.

export const AVATAR_PRESETS = [
  { id: "olglass", label: "Ølglass", source: require("../assets/avatars/olglass.svg") },
  { id: "kompass", label: "Kompass", source: require("../assets/avatars/kompass.svg") },
  { id: "ugle", label: "Ugle", source: require("../assets/avatars/ugle.svg") },
  { id: "mane", label: "Måne", source: require("../assets/avatars/mane.svg") },
  { id: "hatt", label: "Hatt", source: require("../assets/avatars/hatt.svg") },
] as const;

export type AvatarPreset = (typeof AVATAR_PRESETS)[number];

const PRESET_PREFIX = "preset:";
const PHOTO_PREFIX = "data:image/";

export function presetAvatar(id: AvatarPreset["id"]): string {
  return `${PRESET_PREFIX}${id}`;
}

export function isPhoto(avatar: string | null | undefined): boolean {
  return !!avatar && avatar.startsWith(PHOTO_PREFIX);
}

// What to draw for an avatar value: a photo uri, a bundled asset, or nothing
// (initials).
export function avatarSource(avatar: string | null | undefined): { uri: string } | number | null {
  if (!avatar) return null;
  if (isPhoto(avatar)) return { uri: avatar };
  if (avatar.startsWith(PRESET_PREFIX)) {
    const id = avatar.slice(PRESET_PREFIX.length);
    return AVATAR_PRESETS.find((preset) => preset.id === id)?.source ?? null;
  }
  return null;
}
