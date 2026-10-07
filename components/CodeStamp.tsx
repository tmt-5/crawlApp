import { Pressable, Text, View } from "react-native";

type CodeStampProps = {
  code: string;
  // "large" is the lobby's centrepiece, "small" sits in a row on the crawl screen.
  size?: "small" | "large";
  // Replaces the "Kode" label for a moment, e.g. "Kopiert" after sharing.
  label?: string;
  onPress?: () => void;
};

// The invite code as a slightly crooked red ink stamp.
export default function CodeStamp({ code, size = "large", label = "Kode", onPress }: CodeStampProps) {
  const small = size === "small";
  const stamp = (
    <View
      className={`border-red ${
        small
          ? "min-h-[36px] flex-row items-center gap-2 border-[1.5px] px-2.5"
          : "items-center gap-0.5 border-2 px-5 py-3"
      }`}
      style={{ transform: [{ rotate: small ? "-2deg" : "-3deg" }] }}
    >
      <Text className="font-mono text-[11px] uppercase tracking-[.04em] text-red">{label}</Text>
      <Text
        className="font-display text-red"
        style={
          small
            ? { fontSize: 20, lineHeight: 22, letterSpacing: 1.5 }
            : { fontSize: 32, lineHeight: 34, letterSpacing: 2 }
        }
      >
        {code}
      </Text>
    </View>
  );

  if (!onPress) return stamp;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Kode ${code.split("").join(" ")}. Del invitasjonen`}
      // The small stamp is 36px tall on screen, 44px to the finger.
      hitSlop={small ? 4 : 0}
      className="active:opacity-70"
    >
      {stamp}
    </Pressable>
  );
}
