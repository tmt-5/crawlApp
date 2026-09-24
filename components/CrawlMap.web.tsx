import { Text, View } from "react-native";
import type { Venue } from "../types/venue";

type CrawlMapProps = {
  venues: Venue[];
  currentIndex: number;
};

export default function CrawlMap({ venues, currentIndex }: CrawlMapProps) {
  const venue = venues[currentIndex];

  return (
    <View className="flex-1 items-center justify-center bg-bar">
      <View className="items-center gap-1 border-[3px] border-dashed border-ink bg-paper-raised px-6 py-5">
        <Text className="font-body-bold text-[10px] uppercase tracking-[.2em] text-oxblood">
          Kart er ikke tilgjengelig på web
        </Text>
        {venue ? (
          <Text className="font-display text-lg uppercase text-ink">{venue.name}</Text>
        ) : null}
      </View>
    </View>
  );
}
