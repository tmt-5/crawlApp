import { useCallback, useEffect, useState, type ReactNode } from "react";
import { StyleSheet, View, useWindowDimensions } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export type SheetControls = { open: boolean; toggle: () => void };

type BottomSheetProps = {
  // The always-visible top of the sheet. Gets controls so it can offer a
  // button to open the sheet; dragging works too, but isn't discoverable.
  peek: ReactNode | ((controls: SheetControls) => ReactNode);
  children: ReactNode;
  peekHeight?: number;
  topInset?: number;
  // The sheet collapses whenever this value changes, e.g. on moving to the next stop.
  collapseKey?: unknown;
};

const SPRING = { damping: 24, stiffness: 240, mass: 0.7 };

export default function BottomSheet({
  peek,
  children,
  peekHeight = 128,
  topInset = 110,
  collapseKey,
}: BottomSheetProps) {
  const { height: windowHeight } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const expandedHeight = windowHeight - insets.top - topInset;
  const collapsedTranslate = Math.max(expandedHeight - peekHeight, 0);

  const translateY = useSharedValue(collapsedTranslate);
  const startY = useSharedValue(0);
  const expanded = useSharedValue(false);
  const [open, setOpen] = useState(false);

  // The collapsed position depends on the window and safe area, which can
  // change after mount (browser resize, insets measured late). Keep a
  // collapsed sheet collapsed when they do.
  useEffect(() => {
    if (!expanded.value) translateY.value = collapsedTranslate;
  }, [collapsedTranslate, expanded, translateY]);

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
      expanded.value = shouldExpand;
      translateY.value = withSpring(shouldExpand ? 0 : collapsedTranslate, SPRING);
      runOnJS(setOpen)(shouldExpand);
    });

  useEffect(() => {
    if (!expanded.value) return;
    expanded.value = false;
    translateY.value = withSpring(collapsedTranslate, SPRING);
    setOpen(false);
    // Only a change of key collapses; a resize is handled above.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collapseKey]);

  const toggle = useCallback(() => {
    const next = !expanded.value;
    expanded.value = next;
    translateY.value = withSpring(next ? 0 : collapsedTranslate, SPRING);
    setOpen(next);
  }, [collapsedTranslate, expanded, translateY]);

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View style={[styles.sheet, { height: expandedHeight }, sheetStyle]}>
      <GestureDetector gesture={pan}>
        <View style={styles.peek}>{typeof peek === "function" ? peek({ open, toggle }) : peek}</View>
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
