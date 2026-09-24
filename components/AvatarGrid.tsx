import { Pressable, Text, View } from "react-native";
import type { AvatarId, AvatarOption } from "../types/user";

type AvatarGridProps = {
  options: AvatarOption[];
  selectedId: AvatarId | null;
  onSelect: (id: AvatarId) => void;
};

export default function AvatarGrid({ options, selectedId, onSelect }: AvatarGridProps) {
  return (
    <View className="flex-row flex-wrap justify-between gap-y-3">
      {options.map((option) => {
        const selected = option.id === selectedId;
        return (
          <Pressable
            key={option.id}
            onPress={() => onSelect(option.id)}
            className="aspect-square w-[30%] items-center justify-center border-[3px] border-ink bg-paper-raised"
            style={
              selected
                ? { shadowColor: "#241d18", shadowOffset: { width: 4, height: 4 }, shadowOpacity: 1, shadowRadius: 0, elevation: 4, backgroundColor: "#8c2f24" }
                : undefined
            }
          >
            <Text className="text-3xl">{option.emoji}</Text>
            {selected ? (
              <View className="absolute -right-2 -top-2 h-6 w-6 items-center justify-center border-[3px] border-ink bg-mustard">
                <Text className="font-body-bold text-xs text-ink">✓</Text>
              </View>
            ) : null}
          </Pressable>
        );
      })}
    </View>
  );
}
