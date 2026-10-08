import { Image } from "expo-image";
import { Pressable, Text, View } from "react-native";
import { AVATAR_PRESETS, presetAvatar } from "../lib/avatars";

type AvatarPickerProps = {
  value: string;
  onChange: (avatar: string) => void;
};

// The five drawn avatars. The chosen one gets a thicker frame and a check
// mark, so it isn't marked by colour alone; tapping it again clears it.
export default function AvatarPicker({ value, onChange }: AvatarPickerProps) {
  return (
    <View className="flex-row flex-wrap gap-2" accessibilityRole="radiogroup">
      {AVATAR_PRESETS.map((preset) => {
        const id = presetAvatar(preset.id);
        const selected = value === id;
        return (
          <Pressable
            key={preset.id}
            onPress={() => onChange(selected ? "" : id)}
            accessibilityRole="radio"
            accessibilityLabel={preset.label}
            accessibilityState={{ selected }}
            className="h-[56px] w-[56px] active:opacity-85"
          >
            <View
              className={`h-full w-full overflow-hidden rounded-full border-ink ${
                selected ? "border-[3px]" : "border-[1.5px]"
              }`}
            >
              <Image
                source={preset.source}
                contentFit="cover"
                accessible={false}
                style={{ width: "100%", height: "100%" }}
              />
            </View>
            {selected ? (
              <View className="absolute -right-0.5 -top-0.5 h-5 w-5 items-center justify-center border-[1.5px] border-ink bg-ochre">
                <Text className="font-mono text-[11px] text-ink">✓</Text>
              </View>
            ) : null}
          </Pressable>
        );
      })}
    </View>
  );
}
