import { Image } from "expo-image";
import { Text, View } from "react-native";
import { avatarSource } from "../lib/avatars";
import { colors } from "../lib/theme";
import { initials } from "./CrawlMap.types";

type AvatarProps = {
  name: string;
  // Profile avatar value (see lib/avatars.ts); empty or unknown shows initials.
  avatar?: string | null;
  size?: number;
  // Surface colour behind the avatar; the circle is outlined in it.
  surface?: string;
  overlap?: number;
  // Replaces the initials, for the "+3" at the end of a stack.
  text?: string;
};

// A person as a circle: their photo, a drawn avatar, or their initials on ink.
export default function Avatar({
  name,
  avatar,
  size = 32,
  surface = colors.cream,
  overlap = 0,
  text,
}: AvatarProps) {
  const source = text ? null : avatarSource(avatar);
  return (
    <View
      className="items-center justify-center overflow-hidden rounded-full bg-ink"
      style={{ width: size, height: size, borderWidth: 2, borderColor: surface, marginLeft: -overlap }}
    >
      {source ? (
        <Image
          source={source}
          contentFit="cover"
          accessible={false}
          style={{ width: "100%", height: "100%" }}
        />
      ) : (
        <Text className="font-display text-cream" style={{ fontSize: Math.round(size * 0.4) }}>
          {text ?? initials(name)}
        </Text>
      )}
    </View>
  );
}
