import { Image } from "expo-image";
import type { StyleProp, ImageStyle } from "react-native";

// Line icons exported from the Figma file. Each keeps the colour it was drawn
// with: ink for all of them except "arrow-up-right", which is paper for use on
// ink surfaces.
const ICONS = {
  "arrow-right": require("../assets/icons/arrow-right.svg"),
  "arrow-up-right": require("../assets/icons/arrow-up-right.svg"),
  beer: require("../assets/icons/beer.svg"),
  "chevron-down": require("../assets/icons/chevron-down.svg"),
  clock: require("../assets/icons/clock.svg"),
  disclosure: require("../assets/icons/disclosure.svg"),
  "map-pin": require("../assets/icons/map-pin.svg"),
  maximize: require("../assets/icons/maximize.svg"),
  minus: require("../assets/icons/minus.svg"),
  navigation: require("../assets/icons/navigation-ink.svg"),
  plus: require("../assets/icons/plus.svg"),
  route: require("../assets/icons/route.svg"),
  search: require("../assets/icons/search.svg"),
  share: require("../assets/icons/share.svg"),
} as const;

export type IconName = keyof typeof ICONS;

type IconProps = {
  name: IconName;
  size?: number;
  // Non-square icons (the disclosure caret) pass a height.
  height?: number;
  style?: StyleProp<ImageStyle>;
};

export default function Icon({ name, size = 16, height, style }: IconProps) {
  return (
    <Image
      source={ICONS[name]}
      contentFit="contain"
      accessible={false}
      style={[{ width: size, height: height ?? size }, style]}
    />
  );
}
