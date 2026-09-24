import { Fragment, useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import Button from "../components/Button";
import CrawlMap from "../components/CrawlMap";
import { formatKm, routeWalkMeters, walkMinutes } from "../lib/geo";
import { getRoute } from "../lib/routes";
import { getProfile } from "../lib/storage";
import type { CrawlRouteWithStops } from "../types/route";

export default function RouteDetailScreen() {
  const { routeId } = useLocalSearchParams<{ routeId: string }>();

  const [route, setRoute] = useState<CrawlRouteWithStops | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!routeId) return;
    getRoute(routeId)
      .then(setRoute)
      .catch(() => setError("Klarte ikke å hente ruten."))
      .finally(() => setLoading(false));
  }, [routeId]);

  // Picking a route is the first step; name, avatar and group come after.
  const handleChoose = async () => {
    if (!route) return;
    const profile = await getProfile();
    if (profile) {
      router.push({ pathname: "/create-group", params: { routeId: route.id } });
    } else {
      router.push({ pathname: "/avatar", params: { next: "create-group", routeId: route.id } });
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-paper">
        <ActivityIndicator color="#8c2f24" />
      </SafeAreaView>
    );
  }

  if (!route) {
    return (
      <SafeAreaView className="flex-1 bg-paper" edges={["top", "bottom"]}>
        <View className="flex-1 items-center justify-center gap-4 px-5">
          <Text className="text-center text-base text-ink-body">
            {error ?? "Fant ikke ruten."}
          </Text>
          <Button label="Tilbake" variant="secondary" onPress={() => router.back()} />
        </View>
      </SafeAreaView>
    );
  }

  const venues = route.stops.map((stop) => stop.venue);
  const meters = routeWalkMeters(venues);

  return (
    <SafeAreaView className="flex-1 bg-paper" edges={["top", "bottom"]}>
      <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
        <View className="gap-1 border-b-[3px] border-ink px-5 pb-5 pt-4">
          <View className="flex-row items-center gap-3 pb-2">
            <Pressable
              onPress={() => (router.canGoBack() ? router.back() : router.replace("/"))}
              hitSlop={8}
              className="h-10 w-10 items-center justify-center border-[3px] border-ink bg-mustard"
              style={{
                shadowColor: "#241d18",
                shadowOffset: { width: 3, height: 3 },
                shadowOpacity: 1,
                shadowRadius: 0,
                elevation: 3,
              }}
            >
              <Text className="font-body-bold text-base text-ink">←</Text>
            </Pressable>
            <Text className="font-body-bold text-[11px] uppercase tracking-[.2em] text-oxblood">
              {[route.city, route.neighborhood].filter(Boolean).join(" · ")}
            </Text>
          </View>
          <Text
            className="font-display text-3xl uppercase text-ink"
            style={{ lineHeight: 34 }}
          >
            {route.name}
          </Text>
          <Text className="font-body-bold pt-1 text-[11px] uppercase tracking-[.12em] text-ink-muted">
            {route.stops.length} stopp{meters > 0 ? ` · ca. ${formatKm(meters)} km gange` : ""}
          </Text>
        </View>

        <View className="h-[260px] border-b-[3px] border-ink">
          <CrawlMap venues={venues} currentIndex={-1} />
        </View>

        <View className="gap-5 px-5 pt-5">
          {route.description ? (
            <Text className="text-base leading-6 text-ink-body">{route.description}</Text>
          ) : null}

          <View className="border-[3px] border-ink bg-paper-raised">
            {route.stops.map((stop, index) => {
              const previous = index > 0 ? route.stops[index - 1].venue : null;
              const minutes = previous ? walkMinutes(previous, stop.venue) : null;
              return (
                <Fragment key={stop.id}>
                  {index > 0 ? (
                    <View className="flex-row items-center gap-3 border-t border-ink/20 px-4 py-1.5">
                      <View className="w-[30px] items-center">
                        <View className="h-3 w-[3px] bg-oxblood" />
                      </View>
                      <Text className="font-body-bold text-[10px] uppercase tracking-[.15em] text-ink-muted">
                        {minutes != null ? `${minutes} min gange` : "Gange"}
                      </Text>
                    </View>
                  ) : null}
                  <Pressable
                    onPress={() =>
                      router.push({ pathname: "/venue", params: { venueId: stop.venue.id } })
                    }
                    className={`flex-row gap-3 px-4 py-3 active:bg-bar ${
                      index > 0 ? "border-t border-ink/20" : ""
                    }`}
                  >
                    <View className="h-[30px] w-[30px] items-center justify-center rounded-full border-[3px] border-ink bg-paper-raised">
                      <Text className="font-display text-xs text-ink">{index + 1}</Text>
                    </View>
                    <View className="flex-1 gap-0.5">
                      <View className="flex-row flex-wrap items-center gap-2">
                        <Text className="font-display text-base uppercase text-ink">
                          {stop.venue.name}
                        </Text>
                        {stop.venue.category ? (
                          <View className="border-2 border-ink bg-mustard px-1.5 py-0.5">
                            <Text className="font-body-bold text-[9px] uppercase tracking-[.08em] text-ink">
                              {stop.venue.category}
                            </Text>
                          </View>
                        ) : null}
                      </View>
                      {stop.venue.tagline ? (
                        <Text className="text-sm leading-5 text-ink-body">
                          {stop.venue.tagline}
                        </Text>
                      ) : null}
                      {stop.venue.address ? (
                        <Text className="text-xs leading-4 text-ink-muted">
                          {stop.venue.address}
                        </Text>
                      ) : null}
                      {stop.note ? (
                        <Text className="pt-1 text-xs leading-4 text-oxblood">{stop.note}</Text>
                      ) : null}
                    </View>
                    <Text className="self-center font-body-bold text-base text-ink-muted">›</Text>
                  </Pressable>
                </Fragment>
              );
            })}
          </View>
        </View>
      </ScrollView>

      <View className="gap-2 border-t-[3px] border-ink bg-bar px-5 pb-4 pt-4">
        {error ? <Text className="font-body-bold text-sm text-oxblood">{error}</Text> : null}
        <Button
          label="Velg denne ruten"
          onPress={handleChoose}
          disabled={route.stops.length === 0}
        />
        <Text className="text-center text-xs text-ink-muted">
          Neste steg: gi gruppen et navn og del koden med gjengen.
        </Text>
      </View>
    </SafeAreaView>
  );
}
