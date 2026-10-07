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
  Footer,
  Heading,
  Kicker,
  Masthead,
} from "../components/ui";
import { formatKm, formatMinutes, legWalk, routeWalk } from "../lib/geo";
import { getRoute } from "../lib/routes";
import { colors } from "../lib/theme";
import type { CrawlRouteWithStops } from "../types/route";

// Width of the ochre number block; the walking line runs down its centre.
const NUMBER_WIDTH = 30;

// "240 meter" under a kilometre, "1,2 km" above.
function formatWalked(meters: number): string {
  return meters < 1000 ? `${Math.round(meters / 10) * 10} meter` : `${formatKm(meters)} km`;
}

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
  const facts: [string, string][] = [["Stopp", String(route.stops.length).padStart(2, "0")]];
  if (meters > 0) facts.push(["Gange", formatMinutes(minutes)], ["Avstand", `${formatKm(meters)} km`]);
  const intro = route.description ?? route.tagline;

  return (
    <View className="flex-1 bg-cream">
      <StatusBar style="light" />
      <Masthead label="Rute" />
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="h-[260px] border-b-2 border-ink">
          <CrawlMap stops={route.stops} currentIndex={-1} mode="embedded" />
        </View>

        <Band divider={false} className="gap-4 pb-5 pt-5">
          <View className="gap-2.5">
            <Heading size={32}>{route.name}</Heading>
            {intro ? <Body>{intro}</Body> : null}
          </View>
          {/* One framed row, split into cells like a timetable header. */}
          <View className="flex-row border border-ink bg-paper">
            {facts.map(([label, value], index) => (
              <View
                key={label}
                className={`flex-1 gap-0.5 px-2.5 py-2 ${index > 0 ? "border-l border-ink" : ""}`}
              >
                <Kicker tone="soft">{label}</Kicker>
                <Text className="font-display text-[16px] text-ink">{value}</Text>
              </View>
            ))}
          </View>
        </Band>

        <Band divider={false} className="gap-3.5 pb-8">
          <View className="gap-1 border-t border-ink pt-5">
            <Kicker>Rutetabell</Kicker>
            <Heading size={26}>Stopp for stopp</Heading>
          </View>
          <View>
            {route.stops.map((stop, index) => {
              const walk = legWalk(route.stops, index);
              return (
                <Fragment key={stop.id}>
                  {index > 0 ? (
                    // The walk between two stops: a line from number to number.
                    <View className="min-h-[44px] flex-row items-stretch">
                      <View className="items-center" style={{ width: NUMBER_WIDTH }}>
                        <View className="w-[1.5px] flex-1 bg-ink" />
                      </View>
                      <View className="flex-1 flex-row items-center gap-2.5 pl-4">
                        <Icon name="clock" size={14} />
                        <Text className="font-mono text-[11px] tracking-[.04em] text-ink-soft">
                          {walk ? `${walk.minutes} min gange · ${formatWalked(walk.meters)}` : "Gange"}
                        </Text>
                      </View>
                    </View>
                  ) : null}
                  <Pressable
                    onPress={() =>
                      router.push({ pathname: "/venue", params: { venueId: stop.venue.id } })
                    }
                    accessibilityRole="button"
                    accessibilityLabel={`Stopp ${index + 1}: ${stop.venue.name}`}
                    className="min-h-[56px] flex-row items-stretch border border-ink bg-paper active:bg-sand"
                  >
                    <View
                      className="items-center justify-center border-r border-ink bg-ochre"
                      style={{ width: NUMBER_WIDTH - 1 }}
                    >
                      <Text className="font-display text-[16px] text-ink">{index + 1}</Text>
                    </View>
                    <View className="flex-1 justify-center gap-0.5 px-3.5 py-2.5">
                      <Text className="font-body-bold text-[16px] text-ink" style={{ lineHeight: 20 }}>
                        {stop.venue.name}
                      </Text>
                      {stop.venue.tagline ? (
                        <Text className="font-body text-[13px] text-ink" style={{ lineHeight: 18 }}>
                          {stop.venue.tagline}
                        </Text>
                      ) : null}
                    </View>
                    <View className="justify-center pr-3.5">
                      <Icon name="arrow-right" size={16} />
                    </View>
                  </Pressable>
                </Fragment>
              );
            })}
          </View>
        </Band>
      </ScrollView>

      <Footer>
        <ActionBar
          label="Velg denne ruten"
          onPress={handleChoose}
          disabled={route.stops.length === 0}
        />
      </Footer>
    </View>
  );
}
