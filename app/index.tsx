import { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { router, useFocusEffect } from "expo-router";
import { Image } from "expo-image";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Button from "../components/Button";
import Icon from "../components/Icon";
import Photo from "../components/Photo";
import RouteCard from "../components/RouteCard";
import {
  ActionBar,
  Band,
  Body,
  CONTENT_MAX_WIDTH,
  Fact,
  Heading,
  Kicker,
  LinkRow,
  NO_OUTLINE,
  Tag,
} from "../components/ui";
import { CITIES } from "../lib/cities";
import { formatKm, formatMinutes, routeWalk } from "../lib/geo";
import { getGroup } from "../lib/groups";
import { getRoutesByCity } from "../lib/routes";
import { getLastGroupId } from "../lib/storage";
import { colors } from "../lib/theme";
import { getVenuesByCity } from "../lib/venues";
import type { Group } from "../types/group";
import type { CrawlRouteWithStops } from "../types/route";
import type { Venue } from "../types/venue";

const POSTER = require("../assets/images/route-poster.jpg");

const matches = (query: string, ...fields: (string | null | undefined)[]) =>
  fields.some((field) => field?.toLowerCase().includes(query));

export default function ExploreScreen() {
  const insets = useSafeAreaInsets();
  const [city, setCity] = useState(CITIES.find((c) => c.available)?.id ?? "Oslo");
  const [cityMenuOpen, setCityMenuOpen] = useState(false);
  const [routes, setRoutes] = useState<CrawlRouteWithStops[]>([]);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastGroup, setLastGroup] = useState<Group | null>(null);
  const [area, setArea] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(null);
    setArea(null);
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

  const handleJoin = () => router.push("/join-group");

  const featured = routes[0];
  const areas = useMemo(
    () => [...new Set(routes.flatMap((route) => (route.neighborhood ? [route.neighborhood] : [])))],
    [routes]
  );
  const listed = area ? routes.filter((route) => route.neighborhood === area) : routes;
  // Changes once a day, so the same bar is in focus for everyone that evening.
  const focusVenue = useMemo(
    () => (venues.length > 0 ? venues[Math.floor(Date.now() / 86_400_000) % venues.length] : null),
    [venues]
  );

  const needle = query.trim().toLowerCase();
  const foundRoutes = needle
    ? routes.filter((route) =>
        matches(needle, route.name, route.neighborhood, route.tagline, route.description)
      )
    : [];
  const foundVenues = needle
    ? venues.filter((venue) =>
        matches(needle, venue.name, venue.category, venue.tagline, venue.address)
      )
    : [];

  return (
    <View className="flex-1 bg-ink">
      <StatusBar style="light" />
      <ScrollView
        className="flex-1 bg-cream"
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ flexGrow: 1 }}
      >
        <View className="z-10 bg-ink" style={{ paddingTop: insets.top + 16 }}>
          <View
            // Above the group banner, so the city menu opens over it.
            className="z-10 w-full flex-row items-center justify-between self-center px-[18px] pb-4"
            style={{ maxWidth: CONTENT_MAX_WIDTH }}
          >
            <Text accessibilityRole="header" className="font-display text-[22px] text-paper-light">
              CRAWL
            </Text>
            <View>
              <Pressable
                onPress={() => setCityMenuOpen((open) => !open)}
                accessibilityRole="button"
                accessibilityLabel={`By: ${city}. Bytt by`}
                accessibilityState={{ expanded: cityMenuOpen }}
                className="h-11 flex-row items-center gap-1.5 border-[1.5px] border-ink bg-paper px-3 active:opacity-85"
              >
                <Icon name="map-pin" size={15} />
                <Text className="font-body-bold text-[14px] text-ink">{city}</Text>
                <Icon
                  name="chevron-down"
                  size={14}
                  style={cityMenuOpen ? { transform: [{ rotate: "180deg" }] } : undefined}
                />
              </Pressable>
              {cityMenuOpen ? (
                <View className="absolute right-0 top-[48px] min-w-[180px] border-[1.5px] border-ink bg-paper">
                  {CITIES.map((option, index) => {
                    const selected = option.id === city;
                    return (
                      <Pressable
                        key={option.id}
                        disabled={!option.available}
                        onPress={() => {
                          setCity(option.id);
                          setCityMenuOpen(false);
                        }}
                        accessibilityRole="button"
                        accessibilityState={{ selected, disabled: !option.available }}
                        className={`min-h-[44px] flex-row items-center justify-between gap-3 px-3 active:bg-sand ${
                          index > 0 ? "border-t border-ink" : ""
                        } ${selected ? "bg-sand" : ""}`}
                      >
                        <Text
                          className={`font-body-bold text-[14px] ${
                            option.available ? "text-ink" : "text-ink-soft"
                          }`}
                        >
                          {option.label}
                        </Text>
                        <Kicker tone={selected ? "ink" : "soft"}>
                          {selected ? "✓ Valgt" : option.available ? "" : "Snart"}
                        </Kicker>
                      </Pressable>
                    );
                  })}
                </View>
              ) : null}
            </View>
          </View>

          {lastGroup ? (
            <Pressable
              onPress={() =>
                router.push({
                  // A crawl under way resumes at the current stop; a waiting group goes to the lobby.
                  pathname: lastGroup.status === "active" ? "/crawl" : "/group-lobby",
                  params: { groupId: lastGroup.id },
                })
              }
              accessibilityRole="button"
              className="border-t border-ochre active:opacity-85"
            >
              <View
                className="min-h-[60px] w-full flex-row items-center gap-3 self-center px-[18px] py-3"
                style={{ maxWidth: CONTENT_MAX_WIDTH }}
              >
                <View className="flex-1 gap-0.5">
                  <Kicker tone="ochre">
                    {lastGroup.status === "active" ? "Crawlen pågår" : "Gruppen din venter"}
                  </Kicker>
                  <Text className="font-body-bold text-[16px] text-paper" numberOfLines={1}>
                    {lastGroup.name}
                  </Text>
                </View>
                <View className="border border-ochre px-3 py-2">
                  <Kicker tone="ochre">Fortsett</Kicker>
                </View>
              </View>
            </Pressable>
          ) : null}
        </View>

        {loading ? (
          <Band divider={false} className="items-center py-16">
            <ActivityIndicator color={colors.ink} />
          </Band>
        ) : routes.length === 0 ? (
          <Band divider={false} className="gap-2 py-10">
            <Kicker>{error ? "Noe gikk galt" : city}</Kicker>
            <Heading>{error ? "Fikk ikke hentet rutene" : "Ingen ruter her ennå"}</Heading>
            <Body>
              {error
                ? "Sjekk nettet og prøv igjen om litt."
                : "Vi tegner fortsatt kartet for denne byen."}
            </Body>
          </Band>
        ) : (
          <>
            {featured ? <FeaturedRoute route={featured} /> : null}

            <Band tone="sand" className="gap-4 pb-[30px] pt-6">
              <View className="gap-0.5">
                <Kicker>Velg ditt tempo</Kicker>
                <Heading size={26}>Utforsk {city}</Heading>
              </View>
              {areas.length > 1 ? (
                <View className="flex-row flex-wrap gap-[7px]">
                  <Tag label="Alle ruter" selected={area === null} onPress={() => setArea(null)} />
                  {areas.map((name) => (
                    <Tag
                      key={name}
                      label={name}
                      selected={area === name}
                      onPress={() => setArea(name)}
                    />
                  ))}
                </View>
              ) : null}
              <View className="gap-2.5">
                {listed.map((route) => (
                  <RouteCard key={route.id} route={route} />
                ))}
              </View>
            </Band>
          </>
        )}

        <Band className="gap-3.5 pb-[26px] pt-[22px]">
          <Kicker>Husk en ansvarlig barrunde</Kicker>
          <View className="flex-row gap-3.5 border-2 border-ink bg-paper p-4">
            <View className="h-10 w-[34px] items-center justify-center bg-red" accessible={false}>
              <Text className="font-display text-[30px] text-ink">!</Text>
            </View>
            <View className="flex-1 gap-2.5">
              <Heading size={27}>Gode kvelder{"\n"}i ditt tempo.</Heading>
              <Body>
                Drikk vann. Spis noe. Hopp over en runde. Pass på hverandre. Hvert stopp er
                valgfritt, og alkoholfritt teller også.
              </Body>
              <Kicker tone="ink">Ikke noe press. Ingen poeng.</Kicker>
            </View>
          </View>
        </Band>

        {focusVenue ? (
          <Band tone="sand" className="gap-3.5 pb-[26px] pt-[22px]">
            <Kicker>Bar i fokus</Kicker>
            <View className="border-2 border-ink">
              <Photo uri={focusVenue.image_url} height={168} />
            </View>
            <Kicker tone="soft">
              {focusVenue.category ?? "Oppdag ditt neste stamsted"}
            </Kicker>
            <Heading size={34}>{focusVenue.name}</Heading>
            {focusVenue.tagline || focusVenue.description ? (
              <Body>{focusVenue.tagline ?? focusVenue.description}</Body>
            ) : null}
            <LinkRow
              label="Les om stedet"
              onPress={() =>
                router.push({ pathname: "/venue", params: { venueId: focusVenue.id } })
              }
            />
          </Band>
        ) : null}

        <Band className="gap-3.5 pb-[26px] pt-[22px]">
          <Kicker>Søk</Kicker>
          <Heading size={32}>Har du et sted{"\n"}i tankene?</Heading>
          <View
            className={`min-h-[50px] flex-row items-center gap-3 border-ink ${
              searchFocused ? "border-[3px] bg-paper-light px-[14px]" : "border-2 bg-paper px-[15px]"
            }`}
          >
            <Icon name="search" size={20} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Søk etter rute, sted eller område"
              placeholderTextColor={colors.inkSoft}
              accessibilityLabel="Søk etter rute, sted eller område"
              autoCorrect={false}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              style={NO_OUTLINE}
              className="flex-1 py-3 font-body text-[16px] text-ink"
            />
          </View>
          {areas.length > 0 ? (
            <>
              <Kicker tone="soft">Prøv en bydel</Kicker>
              <View className="flex-row flex-wrap gap-[7px]">
                {areas.map((name) => (
                  <Tag
                    key={name}
                    label={name}
                    selected={needle === name.toLowerCase()}
                    onPress={() => setQuery(needle === name.toLowerCase() ? "" : name)}
                  />
                ))}
              </View>
            </>
          ) : null}
          {needle ? (
            <View className="gap-2.5 pt-1">
              <Kicker tone="ink">
                {foundRoutes.length + foundVenues.length === 0
                  ? "Ingen treff"
                  : `${foundRoutes.length + foundVenues.length} treff`}
              </Kicker>
              {foundRoutes.map((route) => (
                <RouteCard key={route.id} route={route} />
              ))}
              {foundVenues.length > 0 ? (
                <View className="border-[1.5px] border-ink bg-paper">
                  {foundVenues.map((venue, index) => (
                    <Pressable
                      key={venue.id}
                      onPress={() =>
                        router.push({ pathname: "/venue", params: { venueId: venue.id } })
                      }
                      accessibilityRole="button"
                      className={`min-h-[52px] flex-row items-center gap-3 px-3.5 py-2.5 active:bg-sand ${
                        index > 0 ? "border-t border-ink" : ""
                      }`}
                    >
                      <View className="flex-1 gap-0.5">
                        <Text className="font-body-bold text-[16px] text-ink">{venue.name}</Text>
                        {venue.category || venue.address ? (
                          <Kicker tone="soft" numberOfLines={1}>
                            {[venue.category, venue.address].filter(Boolean).join(" · ")}
                          </Kicker>
                        ) : null}
                      </View>
                      <Icon name="arrow-right" size={18} />
                    </Pressable>
                  ))}
                </View>
              ) : null}
              {foundRoutes.length + foundVenues.length === 0 ? (
                <Body>Prøv et annet navn, eller velg en bydel over.</Body>
              ) : null}
            </View>
          ) : null}
        </Band>

        <Band tone="sand" className="gap-3.5 pb-[26px] pt-[22px]">
          <Kicker>Har du fått en kode</Kicker>
          <Heading size={28}>Gjengen venter</Heading>
          <Body>Har noen allerede valgt rute? Bli med med koden du har fått.</Body>
          <Button label="Bli med i gruppe" variant="secondary" onPress={handleJoin} />
        </Band>

        <View className="flex-1 bg-ink">
          <Band tone="ink" divider={false} className="gap-2 px-6 py-6">
            <Heading size={30} tone="ochre">
              Slutten på ruten.{"\n"}Starten på en god kveld.
            </Heading>
            <Text className="font-mono-regular text-[11px] text-cream" style={{ lineHeight: 17 }}>
              Velg en rute, samle gjengen og gå.
            </Text>
          </Band>
          <View className="border-t border-ochre" style={{ paddingBottom: insets.bottom }}>
            <Band tone="ink" divider={false} className="px-6 py-6">
              <Text className="font-mono-regular text-[11px] text-cream" style={{ lineHeight: 17 }}>
                App laget med kjærlighet fra Oslo
              </Text>
            </Band>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

// Tonight's pick as a poster: artwork, a label and a caption card with the facts.
function FeaturedRoute({ route }: { route: CrawlRouteWithStops }) {
  const { meters, minutes } = routeWalk(route.stops);
  const open = () => router.push({ pathname: "/route-detail", params: { routeId: route.id } });

  return (
    <Band divider={false} className="pb-[26px] pt-[18px]">
      <View className="min-h-[420px] justify-between border-2 border-ink bg-ochre p-3.5">
        <Image
          source={POSTER}
          contentFit="cover"
          accessible={false}
          style={{ position: "absolute", top: 0, right: 0, bottom: 0, left: 0 }}
        />
        <View className="mb-24 self-start border-[1.5px] border-ink bg-cream px-[9px] py-1.5">
          <Kicker tone="ink">Kveldens utvalgte</Kicker>
        </View>
        <View
          className="gap-4 border-[1.5px] border-ink p-3"
          style={{ backgroundColor: "rgba(243,232,207,0.93)" }}
        >
          <View className="gap-2">
            <Kicker numberOfLines={1}>{route.neighborhood ?? route.city}</Kicker>
            <Heading size={26}>{route.name}</Heading>
            {route.tagline ? <Body>{route.tagline}</Body> : null}
          </View>
          <View className="flex-row gap-3">
            <Fact grow label="Stopp" value={String(route.stops.length).padStart(2, "0")} />
            {meters > 0 ? (
              <>
                <Fact grow label="Gange" value={formatMinutes(minutes)} />
                <Fact grow label="Avstand" value={`${formatKm(meters)} km`} />
              </>
            ) : null}
          </View>
          <ActionBar label="Se ruten" icon="navigation" onPress={open} />
        </View>
      </View>
    </Band>
  );
}
