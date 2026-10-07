import { Fragment, useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import Button from "../components/Button";
import CrawlMap from "../components/CrawlMap";
import Icon from "../components/Icon";
import {
  ActionBar,
  Band,
  Body,
  ErrorText,
  Fact,
  Footer,
  Heading,
  Kicker,
  Masthead,
  Tag,
} from "../components/ui";
import { formatDistance, formatKm, formatMinutes, legWalk, routeWalk } from "../lib/geo";
import { getRoute } from "../lib/routes";
import { colors } from "../lib/theme";
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

  // Picking a route leads to the lobby, where the group gets its code and
  // you enter your name.
  const handleChoose = () => {
    if (!route) return;
    router.push({ pathname: "/group-lobby", params: { routeId: route.id } });
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-cream">
        <ActivityIndicator color={colors.ink} />
      </View>
    );
  }

  if (!route) {
    return (
      <View className="flex-1 bg-cream">
        <StatusBar style="light" />
        <Masthead label="Rute" />
        <Band divider={false} className="gap-4 py-10">
          {error ? <ErrorText>{error}</ErrorText> : <Body>Fant ikke ruten.</Body>}
          <Button label="Tilbake" variant="secondary" onPress={() => router.back()} />
        </Band>
      </View>
    );
  }

  const { meters, minutes } = routeWalk(route.stops);

  return (
    <View className="flex-1 bg-cream">
      <StatusBar style="light" />
      <Masthead label="Rute" />
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <Band divider={false} className="gap-4 pb-6 pt-5">
          <View className="gap-2">
            <Kicker>{[route.city, route.neighborhood].filter(Boolean).join(" · ")}</Kicker>
            <Heading size={36}>{route.name}</Heading>
            {route.tagline ? (
              <Text className="font-body-bold text-[16px] text-ink" style={{ lineHeight: 22 }}>
                {route.tagline}
              </Text>
            ) : null}
          </View>
          <View className="flex-row gap-3 border-y border-ink py-3">
            <Fact grow label="Stopp" value={String(route.stops.length).padStart(2, "0")} />
            {meters > 0 ? (
              <>
                <Fact grow label="Gange" value={formatMinutes(minutes)} />
                <Fact grow label="Avstand" value={`${formatKm(meters)} km`} />
              </>
            ) : null}
          </View>
          {route.description ? <Body>{route.description}</Body> : null}
        </Band>

        <View className="h-[320px] border-y-2 border-ink">
          <CrawlMap stops={route.stops} currentIndex={-1} mode="embedded" />
        </View>

        <View className="flex-1 bg-sand">
          <Band tone="sand" divider={false} className="gap-3.5 pb-8 pt-6">
            <View className="gap-0.5">
              <Kicker>Stopp for stopp</Kicker>
              <Heading size={26}>Rutetabell</Heading>
            </View>
            <View className="border-[1.5px] border-ink bg-paper">
              {route.stops.map((stop, index) => {
                const walk = legWalk(route.stops, index);
                return (
                  <Fragment key={stop.id}>
                    {index > 0 ? (
                      <View className="flex-row items-center gap-3 border-y border-ink bg-cream px-3.5 py-2">
                        <View className="w-[34px] items-center">
                          <View className="h-3.5 w-[3px] bg-red" />
                        </View>
                        <Kicker tone="soft">
                          {walk
                            ? `${walk.minutes} min gange · ${formatDistance(walk.meters)}`
                            : "Gange"}
                        </Kicker>
                      </View>
                    ) : null}
                    <Pressable
                      onPress={() =>
                        router.push({ pathname: "/venue", params: { venueId: stop.venue.id } })
                      }
                      accessibilityRole="button"
                      accessibilityLabel={`Stopp ${index + 1}: ${stop.venue.name}`}
                      className="min-h-[64px] flex-row items-center gap-3 px-3.5 py-3 active:bg-sand"
                    >
                      <View className="h-[34px] w-[34px] items-center justify-center self-start border-[1.5px] border-ink bg-ochre">
                        <Text className="font-display text-[18px] text-ink">{index + 1}</Text>
                      </View>
                      <View className="flex-1 gap-1">
                        <Text className="font-body-bold text-[17px] text-ink" style={{ lineHeight: 20 }}>
                          {stop.venue.name}
                        </Text>
                        {stop.venue.tagline ? (
                          <Text className="font-body text-[14px] text-ink" style={{ lineHeight: 20 }}>
                            {stop.venue.tagline}
                          </Text>
                        ) : null}
                        {stop.note ? (
                          <Text className="font-body text-[13px] text-ink-soft" style={{ lineHeight: 18 }}>
                            Tips: {stop.note}
                          </Text>
                        ) : null}
                        {stop.venue.category || stop.venue.address ? (
                          <View className="flex-row flex-wrap items-center gap-2 pt-0.5">
                            {stop.venue.category ? <Tag label={stop.venue.category} /> : null}
                            {stop.venue.address ? (
                              <Kicker tone="soft">{stop.venue.address}</Kicker>
                            ) : null}
                          </View>
                        ) : null}
                      </View>
                      <Icon name="arrow-right" size={18} />
                    </Pressable>
                  </Fragment>
                );
              })}
            </View>
          </Band>
        </View>
      </ScrollView>

      <Footer>
        <ActionBar
          label="Velg denne ruten"
          onPress={handleChoose}
          disabled={route.stops.length === 0}
        />
        <Text className="text-center font-body text-[13px] text-ink-soft">
          Neste steg: du får en kode å dele med gjengen.
        </Text>
      </Footer>
    </View>
  );
}
