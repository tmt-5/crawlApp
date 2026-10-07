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
    <View className="gap-1 py-1.5" accessibilityLabel={`${label}: ${value ?? "ikke vurdert"} av ${STEPS}`}>
      <View className="flex-row items-center justify-between">
        <Text className="font-mono text-[11px] uppercase tracking-[.04em] text-ink">{label}</Text>
        <Text className="font-display text-[18px] text-ink" style={{ lineHeight: 20 }}>
          {value !== null ? value : "–"}
        </Text>
      </View>

      <View
        className="justify-center py-4"
        {...panResponder.panHandlers}
        onLayout={() => {
          trackRef.current?.measure((_fx, _fy, width, _height, pageX) => {
            trackX.current = pageX;
            trackWidth.current = width;
          });
        }}
      >
        <View ref={trackRef} className="h-2.5 justify-center border-[1.5px] border-ink bg-paper-light">
          <View
            className="absolute bottom-0 left-0 top-0 bg-ochre"
            style={{ width: `${percent}%` }}
          />
        </View>
        {value !== null ? (
          <View
            pointerEvents="none"
            className={`absolute h-6 w-6 border-[1.5px] border-ink ${dragging ? "bg-ink" : "bg-ochre"}`}
            style={{ left: `${percent}%`, marginLeft: -12 }}
          />
        ) : null}
      </View>

      <View className="flex-row justify-between">
        {Array.from({ length: STEPS + 1 }, (_, tick) => (
          <View key={tick} className={value === tick ? "h-2 w-[2px] bg-ink" : "h-1 w-px bg-tick"} />
        ))}
      </View>
    </View>
  );
}
