import { Pressable, Text, View } from "react-native";
import { router } from "expo-router";
import { formatKm, formatMinutes, routeWalk } from "../lib/geo";
import type { CrawlRouteWithStops } from "../types/route";
import Icon, { type IconName } from "./Icon";
import RouteThumb from "./RouteThumb";

function Detail({ icon, value }: { icon: IconName; value: string }) {
  return (
    <View className="flex-row items-center gap-1">
      <Icon name={icon} size={14} />
      <Text className="font-body-semi text-[13px] text-ink">{value}</Text>
    </View>
  );
}

// A route as a timetable entry: small map, title and facts, arrow to open it.
export default function RouteCard({ route }: { route: CrawlRouteWithStops }) {
  const { meters, minutes } = routeWalk(route.stops);

  return (
    <Pressable
      onPress={() => router.push({ pathname: "/route-detail", params: { routeId: route.id } })}
      accessibilityRole="button"
      accessibilityLabel={`${route.name}, ${route.stops.length} stopp`}
      className="min-h-[89px] w-full flex-row border-[1.5px] border-ink bg-paper active:opacity-85"
    >
      <RouteThumb stops={route.stops} />
      <View className="flex-1 gap-[9px] py-4 pl-4">
        <View className="gap-0.5 pr-10">
          <Text className="font-body-bold text-[19px] text-ink" style={{ lineHeight: 21 }}>
            {route.name}
          </Text>
          {route.neighborhood ? (
            <Text className="font-body-bold text-[11px] uppercase text-ink" numberOfLines={1}>
              {route.neighborhood}
            </Text>
          ) : null}
        </View>
        <View className="flex-row flex-wrap gap-x-3 gap-y-1 pr-2">
          <Detail icon="beer" value={`${route.stops.length} stopp`} />
          {meters > 0 ? (
            <>
              <Detail icon="clock" value={`${formatMinutes(minutes)} gange`} />
              <Detail icon="route" value={`${formatKm(meters)} km`} />
            </>
          ) : null}
        </View>
      </View>
      <View className="absolute right-0 top-0 h-8 w-8 items-center justify-center bg-ink">
        <Icon name="arrow-up-right" size={16} />
      </View>
    </Pressable>
  );
}
