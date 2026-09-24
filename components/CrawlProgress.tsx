import { Fragment } from "react";
import { Text, View } from "react-native";

type CrawlProgressProps = {
  total: number;
  currentIndex: number;
};

type StopStatus = "done" | "current" | "upcoming";

function StopCircle({ status, number }: { status: StopStatus; number: number }) {
  if (status === "done") {
    return (
      <View
        className="h-[30px] w-[30px] items-center justify-center border-[3px] border-ink bg-ink"
        style={{ shadowColor: "#241d18", shadowOffset: { width: 2, height: 2 }, shadowOpacity: 1, shadowRadius: 0, elevation: 2 }}
      >
        <Text className="font-body-bold text-sm text-paper-raised">✓</Text>
      </View>
    );
  }

  if (status === "current") {
    return (
      <View
        className="h-10 w-10 items-center justify-center border-4 border-mustard bg-oxblood"
        style={{ shadowColor: "#241d18", shadowOffset: { width: 3, height: 3 }, shadowOpacity: 1, shadowRadius: 0, elevation: 3 }}
      >
        <Text className="font-display text-base text-paper-raised">{number}</Text>
      </View>
    );
  }

  return (
    <View className="h-[30px] w-[30px] items-center justify-center border-[3px] border-dashed border-ink bg-paper-raised">
      <Text className="font-display text-xs text-ink">{number}</Text>
    </View>
  );
}

function Segment({ walked }: { walked: boolean }) {
  return (
    <View
      className="mx-1 flex-1"
      style={
        walked
          ? { borderTopWidth: 3, borderTopColor: "#241d18", borderStyle: "solid" }
          : { borderTopWidth: 3, borderTopColor: "#8c2f24", borderStyle: "dashed" }
      }
    />
  );
}

export default function CrawlProgress({ total, currentIndex }: CrawlProgressProps) {
  return (
    <View className="flex-row items-center">
      {Array.from({ length: total }, (_, index) => {
        const status: StopStatus =
          index < currentIndex ? "done" : index === currentIndex ? "current" : "upcoming";
        return (
          <Fragment key={index}>
            <StopCircle status={status} number={index + 1} />
            {index < total - 1 ? <Segment walked={index < currentIndex} /> : null}
          </Fragment>
        );
      })}
    </View>
  );
}
