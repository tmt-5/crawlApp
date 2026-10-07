import { Pressable, Text, View } from "react-native";
import type { AvatarId, AvatarOption } from "../types/user";

type AvatarGridProps = {
  options: AvatarOption[];
  selectedId: AvatarId | null;
  onSelect: (id: AvatarId) => void;
};

// Roles as a numbered list of rectangular choices. The selected one inverts
// to ink and gets a check mark, so it isn't marked by colour alone.
export default function AvatarGrid({ options, selectedId, onSelect }: AvatarGridProps) {
  return (
    <View className="gap-2" accessibilityRole="radiogroup">
      {options.map((option, index) => {
        const selected = option.id === selectedId;
        return (
          <Pressable
            key={option.id}
            onPress={() => onSelect(option.id)}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            className={`min-h-[48px] w-full flex-row items-center gap-3 border-[1.5px] border-ink px-3 py-2 active:opacity-85 ${
              selected ? "bg-ink" : "bg-paper"
            }`}
          >
            <Text
              className={`w-5 font-mono text-[11px] ${selected ? "text-ochre" : "text-ink-soft"}`}
            >
              {selected ? "✓" : String(index + 1).padStart(2, "0")}
            </Text>
            <Text
              className={`flex-1 font-display text-[18px] uppercase ${
                selected ? "text-paper" : "text-ink"
              }`}
              numberOfLines={1}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
