import { useState, type ReactNode } from "react";
import { Pressable, Text, TextInput, View, type TextInputProps } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, hardShadow } from "../lib/theme";
import Icon, { type IconName } from "./Icon";

// Shared building blocks for the printed-guide look: section bands, mono
// labels, rectangular tags and the dark action bar with an ochre arrow well.

// Keeps text at a readable measure on wide screens while bands run edge to edge.
export const CONTENT_MAX_WIDTH = 560;

type Tone = "cream" | "sand" | "ink";
const BAND_BG: Record<Tone, string> = { cream: "bg-cream", sand: "bg-sand", ink: "bg-ink" };

export function Band({
  tone = "cream",
  divider = true,
  className = "",
  children,
}: {
  tone?: Tone;
  divider?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <View className={`${BAND_BG[tone]} ${divider ? "border-t-[1.5px] border-ink" : ""}`}>
      <View
        className={`w-full self-center px-[18px] ${className}`}
        style={{ maxWidth: CONTENT_MAX_WIDTH }}
      >
        {children}
      </View>
    </View>
  );
}

type KickerTone = "red" | "ink" | "soft" | "ochre" | "light";
const KICKER_COLOR: Record<KickerTone, string> = {
  red: "text-red",
  ink: "text-ink",
  soft: "text-ink-soft",
  ochre: "text-ochre",
  light: "text-paper-light",
};

// Small monospace label above a heading or a group of fields.
export function Kicker({
  tone = "red",
  className = "",
  numberOfLines,
  children,
}: {
  tone?: KickerTone;
  className?: string;
  numberOfLines?: number;
  children: ReactNode;
}) {
  return (
    <Text
      numberOfLines={numberOfLines}
      className={`font-mono text-[11px] uppercase tracking-[.04em] ${KICKER_COLOR[tone]} ${className}`}
    >
      {children}
    </Text>
  );
}

// Condensed uppercase heading.
export function Heading({
  size = 28,
  tone = "ink",
  className = "",
  numberOfLines,
  children,
}: {
  size?: number;
  tone?: "ink" | "ochre" | "cream";
  className?: string;
  numberOfLines?: number;
  children: ReactNode;
}) {
  const color = tone === "ink" ? "text-ink" : tone === "ochre" ? "text-ochre" : "text-cream";
  return (
    <Text
      numberOfLines={numberOfLines}
      className={`font-display uppercase ${color} ${className}`}
      style={{ fontSize: size, lineHeight: Math.round(size * 1.02) }}
    >
      {children}
    </Text>
  );
}

export function Body({ className = "", children }: { className?: string; children: ReactNode }) {
  return (
    <Text className={`font-body text-[14px] text-ink ${className}`} style={{ lineHeight: 20 }}>
      {children}
    </Text>
  );
}

// Rectangular filter / category label. Selected inverts to ink; a tag without
// onPress is a static label.
export function Tag({
  label,
  selected,
  disabled,
  onPress,
}: {
  label: string;
  selected?: boolean;
  disabled?: boolean;
  onPress?: () => void;
}) {
  const content = (
    <View
      className={`border-[1.2px] border-ink px-3 ${onPress ? "min-h-[32px] justify-center" : "py-1.5"} ${
        selected ? "bg-ink" : "bg-paper"
      } ${disabled ? "opacity-50" : ""}`}
    >
      <Text
        className={`font-mono text-[11px] uppercase tracking-[.04em] ${
          selected ? "text-paper-light" : "text-ink"
        }`}
      >
        {label}
      </Text>
    </View>
  );
  if (!onPress) return content;
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ selected: !!selected, disabled: !!disabled }}
      // 32px tall on screen, 44px to the finger.
      hitSlop={{ top: 6, bottom: 6 }}
      className="active:opacity-80"
    >
      {content}
    </Pressable>
  );
}

// The recurring primary action: ink bar, light label, ochre well with an arrow.
export function ActionBar({
  label,
  onPress,
  disabled,
  icon = "arrow-right",
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  icon?: IconName;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      className={`min-h-[54px] w-full flex-row items-center gap-4 bg-ink px-4 py-3 active:opacity-85 ${
        disabled ? "opacity-50" : ""
      }`}
    >
      <Text className="flex-1 font-body-bold text-[16px] text-paper">{label}</Text>
      <View className="h-[30px] w-[30px] items-center justify-center bg-ochre">
        <Icon name={icon} size={18} />
      </View>
    </Pressable>
  );
}

// Secondary link-style row: paper (or ink) field with an ochre arrow.
export function LinkRow({
  label,
  onPress,
  dark,
}: {
  label: string;
  onPress: () => void;
  dark?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      className={`min-h-[48px] w-full flex-row items-center justify-between border-[1.5px] border-ink px-3.5 py-3 active:opacity-85 ${
        dark ? "bg-ink" : "bg-paper"
      }`}
    >
      <Text className={`flex-1 font-body-bold text-[14px] ${dark ? "text-cream" : "text-ink"}`}>
        {label}
      </Text>
      <View className="h-6 w-6 items-center justify-center bg-ochre">
        <Icon name="arrow-right" size={16} style={{ transform: [{ rotate: "-45deg" }] }} />
      </View>
    </Pressable>
  );
}

// Compact ochre action with the offset print shadow ("NESTE STOPP", "DEL").
export function StampButton({
  label,
  onPress,
  disabled,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      className={`min-h-[44px] justify-center border-[1.5px] border-ink bg-ochre px-3 active:opacity-85 ${
        disabled ? "opacity-50" : ""
      }`}
      style={hardShadow}
    >
      <Text className="font-mono text-[11px] uppercase tracking-[.04em] text-ink">{label}</Text>
    </Pressable>
  );
}

// Square ochre icon button, 44px.
export function IconButton({
  icon,
  label,
  onPress,
  flip,
}: {
  icon: IconName;
  label: string;
  onPress: () => void;
  // Mirrors the icon, turning the right arrow into a back arrow.
  flip?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      className="h-11 w-11 items-center justify-center border-[1.5px] border-ink bg-ochre active:opacity-85"
    >
      <Icon name={icon} size={18} style={flip ? { transform: [{ scaleX: -1 }] } : undefined} />
    </Pressable>
  );
}

// Ink masthead for sub-screens: back button, a mono label, optional right slot.
export function Masthead({
  label,
  onBack,
  right,
}: {
  label?: string;
  onBack?: () => void;
  right?: ReactNode;
}) {
  const insets = useSafeAreaInsets();
  const back = onBack ?? (() => (router.canGoBack() ? router.back() : router.replace("/")));
  return (
    <View className="bg-ink" style={{ paddingTop: insets.top }}>
      <View
        className="w-full flex-row items-center gap-3 self-center px-[18px] py-3"
        style={{ maxWidth: CONTENT_MAX_WIDTH }}
      >
        <IconButton icon="arrow-right" flip label="Tilbake" onPress={back} />
        <View className="flex-1">
          {label ? (
            <Kicker tone="light" numberOfLines={1}>
              {label}
            </Kicker>
          ) : null}
        </View>
        {right}
      </View>
    </View>
  );
}

// Sand note with an ink frame, for a venue's story and facts.
export function FieldNote({ children }: { children: ReactNode }) {
  return (
    <View className="border-[1.5px] border-ink bg-sand p-3.5">
      <Body>{children}</Body>
    </View>
  );
}

// Label over value, as in a timetable: "GANGE" / "8 min".
export function Fact({ label, value, grow }: { label: string; value: string; grow?: boolean }) {
  return (
    <View className={`gap-0.5 ${grow ? "flex-1" : ""}`}>
      <Kicker tone="soft">{label}</Kicker>
      <Text className="font-display text-[16px] text-ink">{value}</Text>
    </View>
  );
}

// Sticky footer for a screen's main action.
export function Footer({ children }: { children: ReactNode }) {
  const insets = useSafeAreaInsets();
  return (
    <View
      className="border-t-[1.5px] border-ink bg-sand"
      style={{ paddingBottom: Math.max(insets.bottom, 16) }}
    >
      <View
        className="w-full gap-2 self-center px-[18px] pt-4"
        style={{ maxWidth: CONTENT_MAX_WIDTH }}
      >
        {children}
      </View>
    </View>
  );
}

export function ErrorText({ children }: { children: ReactNode }) {
  return (
    <Text accessibilityRole="alert" className="font-body-bold text-[14px] text-red">
      Feil: {children}
    </Text>
  );
}

export const NO_OUTLINE = { outlineStyle: "none" } as object;

// Framed text field with a mono label. Focus thickens the frame and lightens the fill.
export function Field({
  label,
  hint,
  aside,
  className = "",
  ...input
}: TextInputProps & { label: string; hint?: string; aside?: string }) {
  const [focused, setFocused] = useState(false);
  return (
    <View className="gap-2">
      <View className="flex-row items-end justify-between gap-3">
        <Kicker tone="ink">{label}</Kicker>
        {aside ? <Text className="font-body text-[13px] text-ink-soft">{aside}</Text> : null}
      </View>
      <View
        className={`min-h-[52px] justify-center border-ink ${
          focused ? "border-2 bg-paper-light px-[13px]" : "border-[1.5px] bg-paper px-3.5"
        }`}
      >
        <TextInput
          accessibilityLabel={label}
          placeholderTextColor={colors.inkSoft}
          {...input}
          onFocus={(event) => {
            setFocused(true);
            input.onFocus?.(event);
          }}
          onBlur={(event) => {
            setFocused(false);
            input.onBlur?.(event);
          }}
          className={`py-3 font-body text-[16px] text-ink ${className}`}
          // The frame around the field shows focus; drop the browser's own ring.
          style={NO_OUTLINE}
        />
      </View>
      {hint ? <Text className="font-body text-[13px] text-ink-soft">{hint}</Text> : null}
    </View>
  );
}
