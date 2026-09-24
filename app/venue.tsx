import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import Button from "../components/Button";
import Photo from "../components/Photo";
import { getRoutesForVenue } from "../lib/routes";
import { getVenue } from "../lib/venues";
import type { CrawlRoute } from "../types/route";
import type { Venue } from "../types/venue";

export default function VenueScreen() {
  const { venueId } = useLocalSearchParams<{ venueId: string }>();

  const [venue, setVenue] = useState<Venue | null>(null);
  const [routes, setRoutes] = useState<CrawlRoute[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!venueId) return;
    Promise.all([getVenue(venueId), getRoutesForVenue(venueId)])
      .then(([venueData, routeData]) => {
        setVenue(venueData);
        setRoutes(routeData);
      })
      .catch(() => setVenue(null))
      .finally(() => setLoading(false));
  }, [venueId]);

  if (loading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-paper">
        <ActivityIndicator color="#8c2f24" />
      </SafeAreaView>
    );
  }

  if (!venue) {
    return (
      <SafeAreaView className="flex-1 bg-paper" edges={["top", "bottom"]}>
        <View className="flex-1 items-center justify-center gap-4 px-5">
          <Text className="text-center text-base text-ink-body">Fant ikke stedet.</Text>
          <Button label="Tilbake" variant="secondary" onPress={() => router.back()} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-paper" edges={["top", "bottom"]}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <View className="border-b-[3px] border-ink">
          <Photo uri={venue.image_url} height={180}>
            <Pressable
              onPress={() => router.back()}
              hitSlop={8}
              className="absolute left-4 top-4 h-10 w-10 items-center justify-center border-[3px] border-ink bg-mustard"
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
          </Photo>
        </View>

        <View className="gap-5 px-5 pt-5">
          <View className="gap-2">
            <View className="flex-row flex-wrap items-center gap-2">
              {venue.category ? (
                <View className="border-[3px] border-ink bg-mustard px-2 py-0.5">
                  <Text className="font-body-bold text-[10px] uppercase tracking-[.12em] text-ink">
                    {venue.category}
                  </Text>
                </View>
              ) : null}
              {venue.address ? (
                <Text className="font-body-bold text-[11px] uppercase tracking-[.12em] text-ink-muted">
                  {venue.address}
                </Text>
              ) : null}
            </View>
            <Text className="font-display text-3xl uppercase text-ink" style={{ lineHeight: 34 }}>
              {venue.name}
            </Text>
            {venue.tagline ? (
              <Text className="text-base leading-6 text-ink">{venue.tagline}</Text>
            ) : null}
          </View>

          {venue.description ? (
            <Text className="text-base leading-6 text-ink-body">{venue.description}</Text>
          ) : null}

          {venue.fun_fact ? (
            <View className="gap-1 border-[3px] border-ink bg-paper-raised px-4 py-3">
              <Text className="font-body-bold text-[10px] uppercase tracking-[.2em] text-oxblood">
                Visste du
              </Text>
              <Text className="text-sm leading-5 text-ink-body">{venue.fun_fact}</Text>
            </View>
          ) : null}

          {venue.opening_hours_note ? (
            <Text className="text-sm text-ink-body">{venue.opening_hours_note}</Text>
          ) : null}

          {routes.length > 0 ? (
            <View className="gap-3 pt-2">
              <Text className="font-body-bold text-[11px] uppercase tracking-[.2em] text-oxblood">
                Med på {routes.length === 1 ? "ruten" : "rutene"}
              </Text>
              {routes.map((route) => (
                <Pressable
                  key={route.id}
                  onPress={() =>
                    router.push({ pathname: "/route-detail", params: { routeId: route.id } })
                  }
                  className="flex-row items-center gap-3 border-[3px] border-ink bg-paper-raised px-4 py-3 active:opacity-80"
                  style={{
                    shadowColor: "#241d18",
                    shadowOffset: { width: 4, height: 4 },
                    shadowOpacity: 1,
                    shadowRadius: 0,
                    elevation: 4,
                  }}
                >
                  <View className="flex-1 gap-0.5">
                    {route.neighborhood ? (
                      <Text className="font-body-bold text-[10px] uppercase tracking-[.2em] text-ink-muted">
                        {route.neighborhood}
                      </Text>
                    ) : null}
                    <Text className="font-display text-lg uppercase text-ink">{route.name}</Text>
                  </View>
                  <Text className="font-body-bold text-[11px] uppercase tracking-[.12em] text-oxblood">
                    Se ruten →
                  </Text>
                </Pressable>
              ))}
            </View>
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
