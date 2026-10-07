import { Pressable, Text } from "react-native";

type ButtonProps = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: "primary" | "secondary";
};

export default function Button({
  label,
  onPress,
  disabled,
  variant = "primary",
}: ButtonProps) {
  const isPrimary = variant === "primary";

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      className={`min-h-[52px] w-full items-center justify-center border-[1.5px] border-ink px-4 py-3 active:opacity-85 ${
        isPrimary ? "bg-ink" : "bg-paper"
      } ${disabled ? "opacity-50" : ""}`}
    >
      <Text
        className={`text-center font-body-bold text-[16px] ${
          isPrimary ? "text-paper" : "text-ink"
        }`}
      >
        {label}
      </Text>
    </Pressable>
  );
}
