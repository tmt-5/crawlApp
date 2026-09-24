import type { ReactNode } from "react";
import { StyleSheet, View, useWindowDimensions } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type BottomSheetProps = {
  peek: ReactNode;
  children: ReactNode;
  peekHeight?: number;
  topInset?: number;
};

const SPRING = { damping: 24, stiffness: 240, mass: 0.7 };

export default function BottomSheet({
  peek,
  children,
  peekHeight = 128,
  topInset = 110,
}: BottomSheetProps) {
  const { height: windowHeight } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const expandedHeight = windowHeight - insets.top - topInset;
  const collapsedTranslate = Math.max(expandedHeight - peekHeight, 0);

  const translateY = useSharedValue(collapsedTranslate);
  const startY = useSharedValue(0);

  const pan = Gesture.Pan()
    .onStart(() => {
      startY.value = translateY.value;
    })
    .onUpdate((event) => {
      const next = startY.value + event.translationY;
      translateY.value = Math.min(collapsedTranslate, Math.max(0, next));
    })
    .onEnd((event) => {
      const shouldExpand =
        event.velocityY < -300 ||
        (translateY.value < collapsedTranslate / 2 && event.velocityY < 300);
      translateY.value = withSpring(shouldExpand ? 0 : collapsedTranslate, SPRING);
    });

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View style={[styles.sheet, { height: expandedHeight }, sheetStyle]}>
      <GestureDetector gesture={pan}>
        <View style={styles.peek}>{peek}</View>
      </GestureDetector>
      <View style={{ flex: 1, paddingBottom: insets.bottom }}>{children}</View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  sheet: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#fff8ec",
    borderTopWidth: 3,
    borderColor: "#241d18",
    shadowColor: "#241d18",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 8,
  },
  peek: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 12,
  },
});
