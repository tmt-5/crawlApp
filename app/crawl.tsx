import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import BottomSheet from "../components/BottomSheet";
import Button from "../components/Button";
import CrawlMap from "../components/CrawlMap";
import CrawlProgress from "../components/CrawlProgress";
import RatingSlider from "../components/RatingSlider";
import { saveCheckin } from "../lib/checkins";
import { advanceToStop, completeCrawl, getGroup } from "../lib/groups";
import { getRoute } from "../lib/routes";
import { getMembership } from "../lib/storage";
import type { Venue } from "../types/venue";

export default function CrawlScreen() {
  const { groupId } = useLocalSearchParams<{ groupId: string }>();
  const insets = useSafeAreaInsets();

  const [venues, setVenues] = useState<Venue[]>([]);
  const [memberId, setMemberId] = useState<string | null>(null);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [ratingBeer, setRatingBeer] = useState<number | null>(null);
  const [ratingAtmosphere, setRatingAtmosphere] = useState<number | null>(null);
  const [ratingOverall, setRatingOverall] = useState<number | null>(null);

  // The group's position is stored on the group, so reopening the crawl
  // (or someone else moving the group on) lands on the right stop.
  useFocusEffect(
    useCallback(() => {
      if (!groupId) return;
      Promise.all([getGroup(groupId), getMembership(groupId)])
        .then(async ([group, member]) => {
          if (group?.status === "completed") {
            router.replace({ pathname: "/report", params: { groupId } });
            return;
          }
          const route = group?.route_id ? await getRoute(group.route_id) : null;
          const stops = route?.stops.map((stop) => stop.venue) ?? [];
          setVenues(stops);
          setIndex(Math.min(group?.current_stop_index ?? 0, Math.max(stops.length - 1, 0)));
          setMemberId(member);
          setLoading(false);
        })
        .catch(() => {
          setError("Klarte ikke å hente ruten.");
          setLoading(false);
        });
    }, [groupId])
  );

  useEffect(() => {
    setRatingBeer(null);
    setRatingAtmosphere(null);
    setRatingOverall(null);
  }, [index]);

  const venue = venues[index];
  const isLastStop = index === venues.length - 1;

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
        await completeCrawl(groupId, venues.length);
        router.replace({ pathname: "/report", params: { groupId } });
        return;
      }

      const group = await advanceToStop(groupId, index + 1);
      if (group.status === "completed") {
        router.replace({ pathname: "/report", params: { groupId } });
        return;
      }
      setIndex(Math.min(group.current_stop_index, venues.length - 1));
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
    <View className="flex-1 bg-paper">
      <CrawlMap venues={venues} currentIndex={index} />

      <View
        className="absolute left-5 border-[3px] border-ink bg-paper-raised px-3 py-2"
        style={{
          top: insets.top + 12,
          shadowColor: "#241d18",
          shadowOffset: { width: 3, height: 3 },
          shadowOpacity: 1,
          shadowRadius: 0,
          elevation: 4,
        }}
      >
        <Text className="font-body-bold text-[10px] uppercase tracking-[.2em] text-oxblood">
          Stopp {index + 1} av {venues.length}
        </Text>
      </View>

      <BottomSheet
        topInset={insets.top + 96}
        peek={
          <View className="gap-1">
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
            <Text className="font-body-bold text-[10px] uppercase tracking-[.15em] text-ink-muted">
              Dra opp for info og vurdering
            </Text>
          </View>
        }
      >
        <ScrollView
          className="flex-1 px-5"
          contentContainerStyle={{ gap: 6, paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
        >
          <View className="pb-2 pt-1">
            <CrawlProgress total={venues.length} currentIndex={index} />
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
