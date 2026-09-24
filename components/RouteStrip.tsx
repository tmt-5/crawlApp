import { Fragment } from "react";
import { Text, View } from "react-native";

type RouteStripProps = {
  count: number;
};

// Numbered stop pins joined by a dashed oxblood line, like an upcoming route on the map.
export default function RouteStrip({ count }: RouteStripProps) {
  return (
    <View className="flex-row items-center">
      {Array.from({ length: count }, (_, i) => (
        <Fragment key={i}>
          {i > 0 ? (
            <View className="mx-1 h-0 flex-1 border-t-[3px] border-dashed border-oxblood" />
          ) : null}
          <View
            className={`h-[30px] w-[30px] items-center justify-center rounded-full border-[3px] border-ink ${
              i === 0 ? "bg-oxblood" : "bg-paper-raised"
            }`}
            style={{
              shadowColor: "#241d18",
              shadowOffset: { width: 2, height: 2 },
              shadowOpacity: 1,
              shadowRadius: 0,
              elevation: 2,
            }}
          >
            <Text className={`font-display text-xs ${i === 0 ? "text-paper-raised" : "text-ink"}`}>
              {i + 1}
            </Text>
          </View>
        </Fragment>
      ))}
    </View>
  );
}
