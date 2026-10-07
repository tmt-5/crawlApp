export interface UserProfile {
  name: string;
  // "" for initials, "preset:<id>" for one of the drawn avatars, or a small
  // JPEG data URL for an uploaded photo. Stored as-is in members.avatar.
  avatar: string;
}
