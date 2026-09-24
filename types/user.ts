export type AvatarId =
  | "adventurer"
  | "rogue"
  | "bard"
  | "wizard"
  | "knight"
  | "gremlin";

export interface AvatarOption {
  id: AvatarId;
  emoji: string;
  label: string;
}

export interface UserProfile {
  name: string;
  avatarId: AvatarId;
}
