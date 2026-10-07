import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Button from "../components/Button";
import CodeStamp from "../components/CodeStamp";
import CrawlMap from "../components/CrawlMap";
import type { MapPerson } from "../components/CrawlMap.types";
import Icon from "../components/Icon";
import MemberAvatars from "../components/MemberAvatars";
import RatingSlider from "../components/RatingSlider";
import {
  ActionBar,
  Body,
  CONTENT_MAX_WIDTH,
  ErrorText,
  Fact,
  FieldNote,
  Heading,
  Kicker,
  StampButton,
} from "../components/ui";
import { saveCheckin } from "../lib/checkins";
import { formatDistance, legWalk } from "../lib/geo";
import { advanceToStop, completeCrawl, getGroup, getMembers, returnToStop } from "../lib/groups";
import { shareInvite } from "../lib/invite";
import { useDeviceLocation, useGroupPositions } from "../lib/livePositions";
import { locationSupported } from "../lib/location";
import { getRoute } from "../lib/routes";
import { getMembership, getShareLocation, setShareLocation } from "../lib/storage";
import { colors, hardShadow } from "../lib/theme";
import type { Group, Member } from "../types/group";
import type { CrawlRouteWithStops } from "../types/route";

// Height of the map strip left above the stop panel when it is expanded.
const MAP_STRIP_HEIGHT = 110;
// Space the stop ticket takes at the top of the map.
const TICKET_SPACE = 44;

export default function CrawlScreen() {
  const { groupId } = useLocalSearchParams<{ groupId: string }>();
  const insets = useSafeAreaInsets();

  const [route, setRoute] = useState<CrawlRouteWithStops | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [memberId, setMemberId] = useState<string | null>(null);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sharing, setSharing] = useState(false);
  const [group, setGroup] = useState<Group | null>(null);
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);

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
          setGroup(group);
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

  // Moving on to the next stop starts from a closed panel and empty ratings.
  useEffect(() => {
    setRatingBeer(null);
    setRatingAtmosphere(null);
    setRatingOverall(null);
    setExpanded(false);
  }, [index]);

  // Set when the group steps back to a stop it has already checked in at, so
  // moving on again doesn't overwrite the earlier ratings with empty ones.
  const revisited = useRef(false);

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
      return member ? [{ id: member.id, name: member.name, avatar: member.avatar, ...coords(shared), isMe: false }] : [];
    });
    const me = members.find((m) => m.id === memberId);
    return me && position ? [...others, { id: me.id, name: me.name, avatar: me.avatar, ...coords(position), isMe: true }] : others;
  }, [positions, position, members, memberId]);

  // People can join while the crawl is under way, so the code stays at hand.
  const handleShareCode = async () => {
    if (!group) return;
    const outcome = await shareInvite({
      groupName: group.name,
      routeName: route?.name,
      code: group.invite_code,
    });
    if (outcome === "copied") {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

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
      const rated = ratingBeer !== null || ratingAtmosphere !== null || ratingOverall !== null;
      if (!revisited.current || rated) {
        await saveCheckin({
          group_id: groupId,
          venue_id: venue.id,
          member_id: memberId,
          rating_beer: ratingBeer,
          rating_atmosphere: ratingAtmosphere,
          rating_overall: ratingOverall,
        });
      }
      revisited.current = false;

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

  const handleBack = async () => {
    if (saving || !groupId || index === 0) return;
    setSaving(true);
    setError(null);
    try {
      const group = await returnToStop(groupId, index - 1);
      revisited.current = true;
      setIndex(Math.min(group.current_stop_index, stops.length - 1));
    } catch {
      setError("Klarte ikke å gå tilbake. Prøv igjen.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-cream">
        <ActivityIndicator color={colors.ink} />
      </View>
    );
  }

  if (!venue || !memberId) {
    return (
      <View className="flex-1 items-center justify-center gap-4 bg-cream px-[18px]">
        <Body className="text-center">Fant ikke stoppet eller medlemskapet ditt.</Body>
        <Button label="Til forsiden" onPress={() => router.replace("/")} />
      </View>
    );
  }

  const bottomPadding = Math.max(insets.bottom, 12) + 10;

  const codeStamp = group ? (
    <CodeStamp
      size="small"
      code={group.invite_code}
      label={copied ? "Kopiert" : undefined}
      onPress={handleShareCode}
    />
  ) : null;

  const heading = (
    <View className="gap-3">
      <View className="flex-row items-center justify-between gap-3">
        <View className="flex-1 gap-[3px]">
          <Kicker tone="ink">Du er på</Kicker>
          {/* Long names step down a size so they wrap between words. */}
          <Heading size={venue.name.length > 16 ? 24 : 32} numberOfLines={2}>
            {venue.name}
          </Heading>
        </View>
        {/* Moving on happens in the panel; only the last stop ends the crawl from here.
            Otherwise the stamp takes this spot, centred against the name. */}
        {isLastStop ? (
          <StampButton label={saving ? "Lagrer…" : "Fullfør crawl"} onPress={handleNext} disabled={saving} />
        ) : (
          codeStamp
        )}
      </View>
      <View className="flex-row items-center justify-between gap-3">
        <MemberAvatars members={members} />
        {isLastStop ? codeStamp : null}
      </View>
    </View>
  );

  return (
    <View className="flex-1 bg-cream" style={{ paddingTop: insets.top }}>
      <View
        className="border-b-2 border-ink"
        style={expanded ? { height: MAP_STRIP_HEIGHT, overflow: "hidden" } : { flex: 1 }}
      >
        <CrawlMap
          stops={stops}
          currentIndex={index}
          people={people}
          framePadding={{ top: TICKET_SPACE }}
          controlsTop={14}
          showControls={!expanded}
          shareLocation={
            locationSupported
              ? {
                  sharing,
                  located: !!position,
                  error: locationError,
                  onToggle: toggleSharing,
                }
              : undefined
          }
        />
        {/* Quiet way out: flat, no shadow, 32px on screen and 44px to the finger. */}
        <Pressable
          onPress={() => router.navigate("/")}
          accessibilityRole="button"
          accessibilityLabel="Tilbake til forsiden"
          hitSlop={6}
          className="absolute left-[18px] top-[14px] h-8 w-8 items-center justify-center border border-ink bg-cream/90 active:bg-sand"
        >
          <Icon name="arrow-right" size={14} style={{ transform: [{ rotate: "180deg" }] }} />
        </Pressable>
        <View
          className="absolute left-[58px] top-[14px] border-[1.5px] border-ink bg-cream px-2.5 py-2"
          style={hardShadow}
          accessibilityLabel={`Stopp ${index + 1} av ${stops.length}${route ? `, ${route.name}` : ""}`}
        >
          <Kicker tone="ink">
            Stopp {index + 1} av {stops.length}
          </Kicker>
        </View>
        {expanded ? null : (
          <View
            className="absolute bottom-6 left-[18px] flex-row items-center gap-2 border border-ink bg-cream p-2"
            accessibilityLabel="Nord er opp"
          >
            <Icon name="navigation" size={14} />
            <Kicker tone="ink">N</Kicker>
          </View>
        )}
      </View>

      <View className="z-10" style={expanded ? { flex: 1 } : undefined}>
        <Pressable
          onPress={() => setExpanded((open) => !open)}
          accessibilityRole="button"
          accessibilityState={{ expanded }}
          accessibilityLabel={expanded ? "Skjul detaljer om stoppet" : "Vis mer om stoppet"}
          // 32px tall on screen, 44px to the finger.
          hitSlop={{ top: 6, bottom: 6, left: 8, right: 8 }}
          className="absolute top-[-17px] z-10 h-8 flex-row items-center gap-1.5 self-center border-[1.2px] border-ink bg-cream px-3 active:bg-sand"
        >
          <Kicker tone="ink">{expanded ? "Skjul" : "Vis mer"}</Kicker>
          <Icon
            name="disclosure"
            size={9}
            height={5}
            style={expanded ? undefined : { transform: [{ rotate: "180deg" }] }}
          />
        </Pressable>

        {expanded ? (
          <ScrollView
            className="flex-1"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingTop: 30, paddingBottom: bottomPadding }}
          >
            <View
              className="w-full gap-6 self-center px-[18px]"
              style={{ maxWidth: CONTENT_MAX_WIDTH }}
            >
              {heading}

              {venue.description ? (
                <View className="gap-1.5">
                  <Kicker tone="ink">Historie</Kicker>
                  <FieldNote>{venue.description}</FieldNote>
                </View>
              ) : null}

              {venue.fun_fact ? (
                <View className="gap-1.5">
                  <Kicker tone="ink">Fun fact</Kicker>
                  <FieldNote>{venue.fun_fact}</FieldNote>
                </View>
              ) : null}

              <View className="gap-1">
                <Kicker tone="ink">Vurder stedet</Kicker>
                <Text className="font-body text-[13px] text-ink-soft">
                  Valgfritt. Hopp over hvis dere bare vil videre.
                </Text>
                <View className="gap-2 pt-1">
                  <RatingSlider label="Øl" value={ratingBeer} onChange={setRatingBeer} />
                  <RatingSlider
                    label="Stemning"
                    value={ratingAtmosphere}
                    onChange={setRatingAtmosphere}
                  />
                  <RatingSlider label="Overall" value={ratingOverall} onChange={setRatingOverall} />
                </View>
              </View>

              <View className="gap-4 border-[1.5px] border-ink bg-paper p-3">
                <View className="gap-2">
                  <Kicker>{nextStop ? "Neste stopp" : "Siste stopp i kveld"}</Kicker>
                  <Heading size={24}>{nextStop ? nextStop.venue.name : "Ruten er i mål"}</Heading>
                </View>
                {nextWalk ? (
                  <View className="flex-row gap-6">
                    <Fact label="Gange" value={`${nextWalk.minutes} min`} />
                    <Fact label="Distanse" value={formatDistance(nextWalk.meters)} />
                  </View>
                ) : null}
                {error ? <ErrorText>{error}</ErrorText> : null}
                <ActionBar
                  label={saving ? "Lagrer…" : isLastStop ? "Fullfør crawlen" : "Dra videre"}
                  onPress={handleNext}
                  disabled={saving}
                />
                {index > 0 ? (
                  <Button
                    variant="secondary"
                    label={`Tilbake til ${stops[index - 1].venue.name}`}
                    onPress={handleBack}
                    disabled={saving}
                  />
                ) : null}
              </View>
            </View>
          </ScrollView>
        ) : (
          <View
            className="w-full self-center px-[18px]"
            style={{ maxWidth: CONTENT_MAX_WIDTH, paddingTop: 30, paddingBottom: bottomPadding }}
          >
            {heading}
          </View>
        )}
      </View>
    </View>
  );
}

function coords(position: { latitude: number; longitude: number }) {
  return { latitude: position.latitude, longitude: position.longitude };
}
