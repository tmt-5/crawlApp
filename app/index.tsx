import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";
import { router, useFocusEffect } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import Button from "../components/Button";
import Photo from "../components/Photo";
import RouteStrip from "../components/RouteStrip";
import { CITIES } from "../lib/cities";
import { formatKm, routeWalk } from "../lib/geo";
import { getGroup } from "../lib/groups";
import { getRoutesByCity } from "../lib/routes";
import { getLastGroupId, getProfile } from "../lib/storage";
import { getVenuesByCity } from "../lib/venues";
import type { Group } from "../types/group";
import type { CrawlRouteWithStops } from "../types/route";
import type { Venue } from "../types/venue";

const hardShadow = (offset: number) => ({
  shadowColor: "#241d18",
  shadowOffset: { width: offset, height: offset },
  shadowOpacity: 1,
  shadowRadius: 0,
  elevation: offset,
});

export default function ExploreScreen() {
  const [city, setCity] = useState(CITIES.find((c) => c.available)?.id ?? "Oslo");
  const [routes, setRoutes] = useState<CrawlRouteWithStops[]>([]);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastGroup, setLastGroup] = useState<Group | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    Promise.all([getRoutesByCity(city), getVenuesByCity(city)])
      .then(([routeData, venueData]) => {
        setRoutes(routeData);
        setVenues(venueData);
      })
      .catch(() => setError("Klarte ikke å hente rutene."))
      .finally(() => setLoading(false));
  }, [city]);

  useFocusEffect(
    useCallback(() => {
      getLastGroupId()
        .then((groupId) => (groupId ? getGroup(groupId) : null))
        .then((group) => setLastGroup(group && group.status !== "completed" ? group : null))
        .catch(() => setLastGroup(null));
    }, [])
  );

  const handleJoin = async () => {
    const profile = await getProfile();
    if (profile) {
      router.push("/join-group");
    } else {
      router.push({ pathname: "/avatar", params: { next: "join-group" } });
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-paper" edges={["top"]}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <View className="gap-4 border-b-[3px] border-ink px-5 pb-5 pt-4">
          <View className="flex-row items-center justify-between">
            <Text className="font-display text-xl uppercase text-oxblood">Crawl</Text>
            <Pressable
              onPress={handleJoin}
              hitSlop={8}
              className="min-h-[36px] justify-center border-2 border-ink px-3"
            >
              <Text className="font-body-bold text-[11px] uppercase tracking-[.12em] text-ink">
                Har kode
              </Text>
            </Pressable>
          </View>

          <View className="gap-2">
            <Text
              className="font-display text-[34px] uppercase text-ink"
              style={{ lineHeight: 36 }}
            >
              Kveldens rute
            </Text>
            <Text className="text-base leading-6 text-ink-body">
              Ferdig planlagte barruter. Velg en, samle gjengen og gå.
            </Text>
          </View>

          <View className="flex-row flex-wrap gap-2">
            {CITIES.map((option) => {
              const selected = option.id === city;
              return (
                <Pressable
                  key={option.id}
                  disabled={!option.available}
                  onPress={() => setCity(option.id)}
                  className={`min-h-[36px] justify-center px-3 ${
                    selected ? "bg-ink" : "border-2 border-ink"
                  } ${option.available ? "" : "opacity-50"}`}
                >
                  <Text
                    className={`font-body-bold text-[11px] uppercase tracking-[.12em] ${
                      selected ? "text-paper" : "text-ink"
                    }`}
                  >
                    {option.label}
                    {option.available ? "" : " · snart"}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {lastGroup ? (
          <Pressable
            onPress={() =>
              router.push({ pathname: "/group-lobby", params: { groupId: lastGroup.id } })
            }
            className="mx-5 mt-5 flex-row items-center gap-3 border-[3px] border-ink bg-ink px-4 py-3 active:opacity-80"
          >
            <View className="flex-1 gap-0.5">
              <Text className="font-body-bold text-[10px] uppercase tracking-[.2em] text-mustard">
                {lastGroup.status === "active" ? "Crawlen pågår" : "Din gruppe"}
              </Text>
              <Text className="font-display text-lg uppercase text-paper" numberOfLines={1}>
                {lastGroup.name}
              </Text>
            </View>
            <Text className="font-body-bold text-[11px] uppercase tracking-[.12em] text-paper">
              Fortsett →
            </Text>
          </Pressable>
        ) : null}

        <View className="gap-4 px-5 pt-6">
          <Text className="font-body-bold text-[11px] uppercase tracking-[.2em] text-oxblood">
            Ruter i {city}
          </Text>

          {loading ? (
            <View className="items-center py-10">
              <ActivityIndicator color="#8c2f24" />
            </View>
          ) : routes.length === 0 ? (
            <View className="border-[3px] border-dashed border-ink px-4 py-6">
              <Text className="text-center text-sm text-ink-body">
                {error ?? "Ingen ruter i denne byen enda."}
              </Text>
            </View>
          ) : (
            routes.map((route) => <RouteCard key={route.id} route={route} />)
          )}
        </View>

        {venues.length > 0 ? (
          <View className="gap-4 pt-8">
            <View className="flex-row items-baseline justify-between px-5">
              <Text className="font-body-bold text-[11px] uppercase tracking-[.2em] text-oxblood">
                Steder i {city}
              </Text>
              <Text className="font-body-bold text-[11px] uppercase tracking-[.12em] text-ink-muted">
                {venues.length} steder
              </Text>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 12, paddingHorizontal: 20, paddingBottom: 6 }}
            >
              {venues.map((venue) => (
                <VenueCard key={venue.id} venue={venue} />
              ))}
            </ScrollView>
          </View>
        ) : null}

        <View className="mx-5 mt-8 gap-3 border-[3px] border-dashed border-ink px-4 py-4">
          <Text className="text-sm leading-5 text-ink-body">
            Har gjengen allerede valgt rute? Bli med med koden du har fått.
          </Text>
          <Button label="Bli med i gruppe" variant="secondary" onPress={handleJoin} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function RouteCard({ route }: { route: CrawlRouteWithStops }) {
  const stopVenues = route.stops.map((stop) => stop.venue);
  const { meters, minutes } = routeWalk(route.stops);
  const cover = stopVenues.find((venue) => venue.image_url)?.image_url;

  return (
    <Pressable
      onPress={() => router.push({ pathname: "/route-detail", params: { routeId: route.id } })}
      className="border-[3px] border-ink bg-paper-raised active:opacity-90"
      style={hardShadow(5)}
    >
      <View className="border-b-[3px] border-ink">
        <Photo uri={cover} height={120}>
          {route.neighborhood ? (
            <View className="absolute left-3 top-3 border-[3px] border-ink bg-mustard px-2 py-0.5">
              <Text className="font-body-bold text-[10px] uppercase tracking-[.12em] text-ink">
                {route.neighborhood}
              </Text>
            </View>
          ) : null}
        </Photo>
      </View>

      <View className="gap-3 px-4 pb-4 pt-3">
        <View className="gap-1">
          <Text className="font-display text-2xl uppercase text-ink" style={{ lineHeight: 26 }}>
            {route.name}
          </Text>
          {route.tagline ? (
            <Text className="text-sm leading-5 text-ink-body">{route.tagline}</Text>
          ) : null}
        </View>

        {route.stops.length > 0 ? (
          <View className="gap-1.5 py-1">
            <RouteStrip count={route.stops.length} />
            <View className="flex-row justify-between gap-4">
              <Text className="flex-1 font-body-bold text-[10px] uppercase tracking-[.1em] text-ink-muted" numberOfLines={1}>
                {stopVenues[0].name}
              </Text>
              <Text className="flex-1 text-right font-body-bold text-[10px] uppercase tracking-[.1em] text-ink-muted" numberOfLines={1}>
                {stopVenues[stopVenues.length - 1].name}
              </Text>
            </View>
          </View>
        ) : null}
      </View>

      <View className="flex-row border-t-[3px] border-ink">
        <Stat value={String(route.stops.length)} label="stopp" />
        {meters > 0 ? (
          <>
            <Stat value={formatKm(meters)} label="km" divider />
            <Stat value={String(minutes)} label="min" divider />
          </>
        ) : null}
      </View>
    </Pressable>
  );
}

function Stat({ value, label, divider }: { value: string; label: string; divider?: boolean }) {
  return (
    <View
      className={`flex-1 flex-row items-baseline gap-1.5 px-4 py-2.5 ${
        divider ? "border-l border-ink/20" : ""
      }`}
    >
      <Text className="font-display text-xl text-ink">{value}</Text>
      <Text className="font-body-bold text-[10px] uppercase tracking-[.12em] text-ink-muted">
        {label}
      </Text>
    </View>
  );
}

function VenueCard({ venue }: { venue: Venue }) {
  return (
    <Pressable
      onPress={() => router.push({ pathname: "/venue", params: { venueId: venue.id } })}
      className="w-[190px] border-[3px] border-ink bg-paper-raised active:opacity-90"
    >
      <View className="border-b-[3px] border-ink">
        <Photo uri={venue.image_url} height={96}>
          {venue.category ? (
            <View className="absolute bottom-2 left-2 border-2 border-ink bg-mustard px-1.5 py-0.5">
              <Text className="font-body-bold text-[9px] uppercase tracking-[.08em] text-ink">
                {venue.category}
              </Text>
            </View>
          ) : null}
        </Photo>
      </View>
      <View className="gap-1 px-3 py-3">
        <Text className="font-display text-base uppercase text-ink" style={{ lineHeight: 18 }} numberOfLines={2}>
          {venue.name}
        </Text>
        {venue.tagline ? (
          <Text className="text-xs leading-4 text-ink-body" numberOfLines={2}>
            {venue.tagline}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}
