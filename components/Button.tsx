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
      className={`w-full items-center justify-center border-[3px] border-ink py-4 active:opacity-80 ${
        isPrimary
          ? disabled
            ? "bg-ink-muted"
            : "bg-oxblood"
          : "bg-transparent"
      }`}
    >
      <Text
        className={`font-body-bold text-center text-sm uppercase tracking-[.1em] ${
          isPrimary ? "text-paper-raised" : "text-ink"
        }`}
      >
        {label}
      </Text>
    </Pressable>
  );
}
