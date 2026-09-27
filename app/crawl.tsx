import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, View, useWindowDimensions } from "react-native";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import BottomSheet from "../components/BottomSheet";
import Button from "../components/Button";
import CrawlMap from "../components/CrawlMap";
import type { MapPerson } from "../components/CrawlMap.types";
import CrawlProgress from "../components/CrawlProgress";
import MemberAvatars from "../components/MemberAvatars";
import RatingSlider from "../components/RatingSlider";
import { saveCheckin } from "../lib/checkins";
import { legWalk } from "../lib/geo";
import { advanceToStop, completeCrawl, getGroup, getMembers } from "../lib/groups";
import { useDeviceLocation, useGroupPositions } from "../lib/livePositions";
import { locationSupported } from "../lib/location";
import { getRoute } from "../lib/routes";
import { getMembership, getShareLocation, setShareLocation } from "../lib/storage";
import type { Member } from "../types/group";
import type { CrawlRouteWithStops } from "../types/route";

// Height of the sheet's always-visible part, above the bottom safe area.
const PEEK_CONTENT_HEIGHT = 155;
// Space the floating info card takes at the top of the map.
const INFO_CARD_SPACE = 76;

export default function CrawlScreen() {
  const { groupId } = useLocalSearchParams<{ groupId: string }>();
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();
  const peekHeight = PEEK_CONTENT_HEIGHT + insets.bottom;

  const [route, setRoute] = useState<CrawlRouteWithStops | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [memberId, setMemberId] = useState<string | null>(null);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sharing, setSharing] = useState(false);

  const [ratingBeer, setRatingBeer] = useState<number | null>(null);
  const [ratingAtmosphere, setRatingAtmosphere] = useState<number | null>(null);
  const [ratingOverall, setRatingOverall] = useState<number | null>(null);

  const { position, error: locationError } = useDeviceLocation(sharing);
  const positions = useGroupPositions(groupId, memberId, position);

  // The group's position is stored on the group, so reopening the crawl
  // (or someone else moving the group on) lands on the right stop.
  useFocusEffect(
    useCallback(() => {
      if (!groupId) return;
      Promise.all([
        getGroup(groupId),
        getMembership(groupId),
        getMembers(groupId),
        getShareLocation(groupId),
      ])
        .then(async ([group, member, memberList, shareLocation]) => {
          if (group?.status === "completed") {
            router.replace({ pathname: "/report", params: { groupId } });
            return;
          }
          const routeData = group?.route_id ? await getRoute(group.route_id) : null;
          const stopCount = routeData?.stops.length ?? 0;
          setRoute(routeData);
          setIndex(Math.min(group?.current_stop_index ?? 0, Math.max(stopCount - 1, 0)));
          setMemberId(member);
          setMembers(memberList);
          setSharing(shareLocation && locationSupported);
          setLoading(false);
        })
        .catch(() => {
          setError("Klarte ikke å hente ruten.");
          setLoading(false);
        });
    }, [groupId])
  );

  const sheetScroll = useRef<ScrollView>(null);
  useEffect(() => {
    setRatingBeer(null);
    setRatingAtmosphere(null);
    setRatingOverall(null);
    sheetScroll.current?.scrollTo({ y: 0, animated: false });
  }, [index]);

  // Someone who joined after this screen loaded shows up in the live positions
  // before we know their name; fetch the member list again when that happens.
  const lookedUp = useRef(new Set<string>());
  useEffect(() => {
    if (!groupId || loading) return;
    const unknown = positions
      .map((shared) => shared.memberId)
      .filter((id) => !members.some((m) => m.id === id) && !lookedUp.current.has(id));
    if (unknown.length === 0) return;
    unknown.forEach((id) => lookedUp.current.add(id));
    getMembers(groupId).then(setMembers).catch(() => {});
  }, [positions, members, groupId, loading]);

  const stops = useMemo(() => route?.stops ?? [], [route]);
  const venue = stops[index]?.venue;
  const isLastStop = index === stops.length - 1;
  const nextStop = stops[index + 1];
  const nextWalk = legWalk(stops, index + 1);

  const people = useMemo<MapPerson[]>(() => {
    const others = positions.flatMap((shared) => {
      if (shared.memberId === memberId) return [];
      const member = members.find((m) => m.id === shared.memberId);
      return member ? [{ id: member.id, name: member.name, ...coords(shared), isMe: false }] : [];
    });
    const me = members.find((m) => m.id === memberId);
    return me && position ? [...others, { id: me.id, name: me.name, ...coords(position), isMe: true }] : others;
  }, [positions, position, members, memberId]);

  const toggleSharing = () => {
    if (!groupId) return;
    const next = !sharing;
    setSharing(next);
    setShareLocation(groupId, next).catch(() => {});
  };

  const handleNext = async () => {
    if (saving || !venue || !groupId || !memberId) return;
    setSaving(true);
    setError(null);
    try {
      await saveCheckin({
        group_id: groupId,
        venue_id: venue.id,
        member_id: memberId,
        rating_beer: ratingBeer,
        rating_atmosphere: ratingAtmosphere,
        rating_overall: ratingOverall,
      });

      if (isLastStop) {
        await completeCrawl(groupId, stops.length);
        setShareLocation(groupId, false).catch(() => {});
        router.replace({ pathname: "/report", params: { groupId } });
        return;
      }

      const group = await advanceToStop(groupId, index + 1);
      if (group.status === "completed") {
        router.replace({ pathname: "/report", params: { groupId } });
        return;
      }
      setIndex(Math.min(group.current_stop_index, stops.length - 1));
    } catch {
      setError("Klarte ikke å lagre. Prøv igjen.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-paper">
        <ActivityIndicator color="#8c2f24" />
      </SafeAreaView>
    );
  }

  if (!venue || !memberId) {
    return (
      <SafeAreaView className="flex-1 bg-paper" edges={["top", "bottom"]}>
        <View className="flex-1 items-center justify-center gap-4 px-5">
          <Text className="text-center text-base text-ink-body">
            Fant ikke stoppet eller medlemskapet ditt.
          </Text>
          <Button label="Til forsiden" onPress={() => router.replace("/")} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    // overflow hidden: the collapsed sheet sits below the screen edge, which on
    // web would otherwise make the whole page scrollable.
    <View className="flex-1 overflow-hidden bg-paper">
      <View style={{ flex: 1, marginBottom: peekHeight - 3 }}>
        <CrawlMap
          stops={stops}
          currentIndex={index}
          people={people}
          framePadding={{ top: insets.top + INFO_CARD_SPACE }}
          controlsTop={insets.top + 12}
        />
      </View>

      <View
        className="absolute left-5 gap-0.5 border-[3px] border-ink bg-paper-raised px-3 py-2"
        style={{
          top: insets.top + 12,
          maxWidth: Math.min(360, windowWidth - 96),
          shadowColor: "#241d18",
          shadowOffset: { width: 3, height: 3 },
          shadowOpacity: 1,
          shadowRadius: 0,
          elevation: 4,
        }}
      >
        <Text className="font-body-bold text-[10px] uppercase tracking-[.2em] text-oxblood">
          Stopp {index + 1} av {stops.length}
        </Text>
        {route ? (
          <Text className="font-display text-lg uppercase text-ink" style={{ lineHeight: 20 }} numberOfLines={1}>
            {route.name}
          </Text>
        ) : null}
      </View>

      <BottomSheet
        peekHeight={peekHeight}
        collapseKey={index}
        topInset={insets.top + 96}
        peek={({ open, toggle }) => (
          <View className="gap-3">
            <View className="flex-row items-center gap-3">
              <View className="flex-1 gap-0.5">
                <Text className="font-body-bold text-[11px] uppercase tracking-[.2em] text-oxblood">
                  Nåværende stopp
                </Text>
                <Text
                  className="font-display text-2xl uppercase text-ink"
                  style={{ lineHeight: 26 }}
                  numberOfLines={1}
                >
                  {venue.name}
                </Text>
              </View>
              <Pressable
                onPress={toggle}
                accessibilityRole="button"
                className="min-h-[40px] justify-center border-[3px] border-ink bg-mustard px-3 active:opacity-80"
                style={{
                  shadowColor: "#241d18",
                  shadowOffset: { width: 3, height: 3 },
                  shadowOpacity: 1,
                  shadowRadius: 0,
                  elevation: 3,
                }}
              >
                <Text className="font-body-bold text-[11px] uppercase tracking-[.12em] text-ink">
                  {open ? "Lukk" : "Sjekk inn"}
                </Text>
              </Pressable>
            </View>

            <View className="flex-row items-center justify-between gap-3">
              <MemberAvatars members={members} />
              {locationSupported ? (
                <LocationChip sharing={sharing} located={!!position} error={locationError} onPress={toggleSharing} />
              ) : null}
            </View>

            <View className="flex-row items-center justify-between gap-3 border-t border-ink/20 pt-2">
              <Text className="flex-1 font-body-bold text-[11px] uppercase tracking-[.12em] text-ink" numberOfLines={1}>
                {nextStop ? `Neste: ${nextStop.venue.name}` : "Siste stopp i kveld"}
              </Text>
              {nextWalk ? (
                <Text className="font-body-bold text-[11px] uppercase tracking-[.12em] text-ink-muted">
                  {nextWalk.minutes} min gange
                </Text>
              ) : null}
            </View>
          </View>
        )}
      >
        <ScrollView
          ref={sheetScroll}
          className="flex-1 px-5"
          contentContainerStyle={{ gap: 6, paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
        >
          <View className="pb-2 pt-1">
            <CrawlProgress total={stops.length} currentIndex={index} />
          </View>

          <View
            className="gap-2 border-[3px] border-ink bg-paper px-5 py-5"
            style={{
              shadowColor: "#241d18",
              shadowOffset: { width: 4, height: 4 },
              shadowOpacity: 1,
              shadowRadius: 0,
              elevation: 4,
            }}
          >
            {venue.description ? (
              <Text className="text-sm leading-5 text-ink-body">
                {venue.description}
              </Text>
            ) : null}
            {venue.fun_fact ? (
              <View className="gap-0.5 pt-2">
                <Text className="font-body-bold text-[10px] uppercase tracking-[.15em] text-oxblood">
                  Fun fact
                </Text>
                <Text className="text-sm leading-5 text-ink-body">{venue.fun_fact}</Text>
              </View>
            ) : null}
          </View>

          <View className="gap-5 pt-4">
            <View className="gap-1">
              <Text className="font-body-bold text-[11px] uppercase tracking-[.2em] text-oxblood">
                Vurder stedet
              </Text>
              <Text className="text-xs leading-4 text-ink-muted">
                Valgfritt. Hopp over hvis dere bare vil videre.
              </Text>
            </View>
            <RatingSlider label="Øl" value={ratingBeer} onChange={setRatingBeer} />
            <RatingSlider
              label="Stemning"
              value={ratingAtmosphere}
              onChange={setRatingAtmosphere}
            />
            <RatingSlider
              label="Overall"
              value={ratingOverall}
              onChange={setRatingOverall}
            />
          </View>

          {error ? (
            <Text className="font-body-bold pt-2 text-sm text-oxblood">{error}</Text>
          ) : null}

          <View className="pb-2 pt-4">
            <Button
              label={saving ? "Lagrer…" : isLastStop ? "Fullfør crawlen" : "Neste stopp"}
              onPress={handleNext}
              disabled={saving}
            />
          </View>
        </ScrollView>
      </BottomSheet>
    </View>
  );
}

function coords(position: { latitude: number; longitude: number }) {
  return { latitude: position.latitude, longitude: position.longitude };
}

function LocationChip({
  sharing,
  located,
  error,
  onPress,
}: {
  sharing: boolean;
  located: boolean;
  error: string | null;
  onPress: () => void;
}) {
  const label = !sharing
    ? "Del posisjon"
    : error === "denied"
      ? "Posisjon blokkert"
      : error
        ? "Fant deg ikke"
        : located
          ? "Deler posisjon"
          : "Finner deg…";
  const active = sharing && !error;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="switch"
      accessibilityState={{ checked: sharing }}
      hitSlop={6}
      className={`min-h-[36px] justify-center px-3 ${
        active ? "bg-ink" : error && sharing ? "border-2 border-oxblood" : "border-2 border-ink"
      }`}
    >
      <Text
        className={`font-body-bold text-[11px] uppercase tracking-[.12em] ${
          active ? "text-paper" : error && sharing ? "text-oxblood" : "text-ink"
        }`}
      >
        {label}
      </Text>
    </Pressable>
  );
}
