import { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Button from "../components/Button";
import Photo from "../components/Photo";
import { Band, Body, FieldNote, Heading, Kicker, LinkRow, Masthead } from "../components/ui";
import { getRoutesForVenue } from "../lib/routes";
import { colors } from "../lib/theme";
import { getVenue } from "../lib/venues";
import type { CrawlRoute } from "../types/route";
import type { Venue } from "../types/venue";

export default function VenueScreen() {
  const { venueId } = useLocalSearchParams<{ venueId: string }>();
  const insets = useSafeAreaInsets();

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
      <View className="flex-1 items-center justify-center bg-cream">
        <ActivityIndicator color={colors.ink} />
      </View>
    );
  }

  if (!venue) {
    return (
      <View className="flex-1 bg-cream">
        <StatusBar style="light" />
        <Masthead label="Sted" />
        <Band divider={false} className="gap-4 py-10">
          <Body>Fant ikke stedet.</Body>
          <Button label="Tilbake" variant="secondary" onPress={() => router.back()} />
        </Band>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-cream">
      <StatusBar style="light" />
      <Masthead label={[venue.city, venue.category].filter(Boolean).join(" · ")} />
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="border-b-2 border-ink">
          <Photo uri={venue.image_url} height={200} />
        </View>

        <Band divider={false} className="gap-4 pb-7 pt-5">
          <View className="gap-2">
            {venue.address ? <Kicker>{venue.address}</Kicker> : null}
            <Heading size={36}>{venue.name}</Heading>
            {venue.tagline ? (
              <Text className="font-body-bold text-[16px] text-ink" style={{ lineHeight: 22 }}>
                {venue.tagline}
              </Text>
            ) : null}
          </View>

          {venue.description ? <Body>{venue.description}</Body> : null}

          {venue.fun_fact ? (
            <View className="gap-1.5">
              <Kicker tone="ink">Fun fact</Kicker>
              <FieldNote>{venue.fun_fact}</FieldNote>
            </View>
          ) : null}

          {venue.opening_hours_note ? (
            <View className="gap-1 border-t border-ink pt-3">
              <Kicker tone="soft">Åpningstider</Kicker>
              <Body>{venue.opening_hours_note}</Body>
            </View>
          ) : null}
        </Band>

        <View className="flex-1 bg-sand" style={{ paddingBottom: insets.bottom }}>
          {routes.length > 0 ? (
            <Band tone="sand" className="gap-3.5 pb-8 pt-6">
              <View className="gap-0.5">
                <Kicker>Ta turen innom</Kicker>
                <Heading size={26}>Med på {routes.length === 1 ? "ruten" : "rutene"}</Heading>
              </View>
              <View className="gap-2.5">
                {routes.map((route) => (
                  <LinkRow
                    key={route.id}
                    label={[route.name, route.neighborhood].filter(Boolean).join(" · ")}
                    onPress={() =>
                      router.push({ pathname: "/route-detail", params: { routeId: route.id } })
                    }
                  />
                ))}
              </View>
            </Band>
          ) : null}
        </View>
      </ScrollView>
    </View>
  );
}
