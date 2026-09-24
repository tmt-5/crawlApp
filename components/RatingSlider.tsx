import { useRef, useState } from "react";
import { PanResponder, Text, View } from "react-native";

type RatingSliderProps = {
  label: string;
  value: number | null;
  onChange: (value: number) => void;
};

const STEPS = 10;

export default function RatingSlider({ label, value, onChange }: RatingSliderProps) {
  const trackRef = useRef<View>(null);
  const trackX = useRef(0);
  const trackWidth = useRef(0);

  const [dragging, setDragging] = useState(false);

  const updateFromPageX = (pageX: number) => {
    if (trackWidth.current <= 0) return;
    const relative = pageX - trackX.current;
    const clamped = Math.max(0, Math.min(trackWidth.current, relative));
    const next = Math.round((clamped / trackWidth.current) * STEPS);
    onChange(next);
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        setDragging(true);
        updateFromPageX(evt.nativeEvent.pageX);
      },
      onPanResponderMove: (evt) => {
        updateFromPageX(evt.nativeEvent.pageX);
      },
      onPanResponderRelease: () => setDragging(false),
      onPanResponderTerminate: () => setDragging(false),
    })
  ).current;

  const percent = value !== null ? (value / STEPS) * 100 : 0;

  return (
    <View className="gap-2">
      <View className="flex-row items-center justify-between">
        <Text className="font-body-bold text-[11px] uppercase tracking-[.2em] text-oxblood">
          {label}
        </Text>
        <Text className="font-display text-xl text-ink">
          {value !== null ? value : "–"}
        </Text>
      </View>

      <View
        className="justify-center py-3"
        {...panResponder.panHandlers}
        onLayout={() => {
          trackRef.current?.measure((_fx, _fy, width, _height, pageX) => {
            trackX.current = pageX;
            trackWidth.current = width;
          });
        }}
      >
        <View ref={trackRef} className="h-3.5 justify-center border-[3px] border-ink bg-paper-raised">
          <View
            className="absolute bottom-0 left-0 top-0 bg-mustard"
            style={{ width: `${percent}%` }}
          />
        </View>
        {value !== null ? (
          <View
            pointerEvents="none"
            className="absolute h-6 w-6 border-[3px] border-ink bg-mustard"
            style={{
              left: `${percent}%`,
              marginLeft: -12,
              shadowColor: "#241d18",
              shadowOffset: { width: 2, height: 2 },
              shadowOpacity: dragging ? 0 : 1,
              shadowRadius: 0,
              elevation: dragging ? 0 : 2,
            }}
          />
        ) : null}
      </View>

      <View className="flex-row justify-between px-0.5">
        {Array.from({ length: STEPS + 1 }, (_, tick) => (
          <View
            key={tick}
            className={value === tick ? "h-2 w-[3px] bg-oxblood" : "h-1.5 w-[2px] bg-ink/30"}
          />
        ))}
      </View>
    </View>
  );
}
