import { Pressable, Text, View } from "react-native";
import { colors } from "../lib/theme";

type RatingButtonsProps = {
  label: string;
  value: number | null;
  // null when the selected rating is tapped again.
  onChange: (value: number | null) => void;
};

const SCORES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const SHADOW = { boxShadow: `2px 2px 0px ${colors.ink}` } as const;

// One row of ten. The chosen score turns ochre and the rest fade back; tapping
// any other score moves the choice, tapping the chosen one clears it.
export default function RatingButtons({ label, value, onChange }: RatingButtonsProps) {
  return (
    <View className="gap-2.5 py-1.5" accessibilityRole="radiogroup" accessibilityLabel={label}>
      <Text className="font-mono text-[11px] uppercase tracking-[.04em] text-ink">{label}</Text>
      <View className="flex-row gap-1.5 pb-0.5 pr-0.5">
        {SCORES.map((score) => {
          const selected = value === score;
          return (
            <Pressable
              key={score}
              onPress={() => onChange(selected ? null : score)}
              accessibilityRole="radio"
              accessibilityLabel={`${label}: ${score} av 10`}
              accessibilityState={{ selected }}
              hitSlop={{ top: 7, bottom: 7 }}
              className={`aspect-square flex-1 items-center justify-center border-[1.5px] border-ink ${
                selected ? "bg-ochre" : "bg-paper-light active:bg-sand"
              }`}
              style={[SHADOW, { opacity: value === null || selected ? 1 : 0.3 }]}
            >
              <Text className="font-mono text-[12px] text-ink">{score}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
