import { useCallback, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Share, Text, View } from "react-native";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import Button from "../components/Button";
import RouteStrip from "../components/RouteStrip";
import { AVATAR_OPTIONS } from "../lib/avatars";
import { formatKm, routeWalkMeters } from "../lib/geo";
import { getGroup, getMembers, startCrawl } from "../lib/groups";
import { getRoute } from "../lib/routes";
import type { Group, Member } from "../types/group";
import type { CrawlRouteWithStops } from "../types/route";

const squareShadow = {
  shadowColor: "#241d18",
  shadowOffset: { width: 3, height: 3 },
  shadowOpacity: 1,
  shadowRadius: 0,
  elevation: 3,
};

export default function GroupLobbyScreen() {
  const { groupId } = useLocalSearchParams<{ groupId: string }>();
  const [group, setGroup] = useState<Group | null>(null);
  const [route, setRoute] = useState<CrawlRouteWithStops | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!groupId) return;
    const [groupData, memberData] = await Promise.all([getGroup(groupId), getMembers(groupId)]);
    setGroup(groupData);
    setMembers(memberData);
    setRoute(groupData?.route_id ? await getRoute(groupData.route_id) : null);
  }, [groupId]);

  // Reload on focus so the stop number is current after coming back from the crawl.
  useFocusEffect(
    useCallback(() => {
      load()
        .catch(() => setError("Klarte ikke å hente gruppen."))
        .finally(() => setLoading(false));
    }, [load])
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await load().catch(() => {});
    setRefreshing(false);
  };

  const handleShare = () => {
    if (!group) return;
    const routeText = route ? ` Vi tar ${route.name}.` : "";
    Share.share({
      message: `Bli med i ${group.name} på Crawl.${routeText} Koden er ${group.invite_code}.`,
    }).catch(() => {});
  };

  const handleStart = async () => {
    if (!groupId || !group || starting) return;
    if (group.status === "completed") {
      router.push({ pathname: "/report", params: { groupId } });
      return;
    }
    if (group.status === "active") {
      router.push({ pathname: "/crawl", params: { groupId } });
      return;
    }
    setStarting(true);
    setError(null);
    try {
      await startCrawl(groupId);
      router.replace({ pathname: "/crawl", params: { groupId } });
    } catch {
      setError("Klarte ikke å starte crawlen. Prøv igjen.");
    } finally {
      setStarting(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-paper">
        <ActivityIndicator color="#8c2f24" />
      </SafeAreaView>
    );
  }

  const meters = route ? routeWalkMeters(route.stops.map((stop) => stop.venue)) : 0;

  return (
    <SafeAreaView className="flex-1 bg-paper" edges={["top", "bottom"]}>
      <ScrollView contentContainerStyle={{ gap: 24, paddingHorizontal: 20, paddingTop: 16, paddingBottom: 24 }}>
        <View className="flex-row items-start justify-between gap-3">
          <Pressable
            onPress={() => router.replace("/")}
            hitSlop={8}
            className="h-10 w-10 items-center justify-center border-[3px] border-ink bg-mustard"
            style={squareShadow}
          >
            <Text className="font-body-bold text-base text-ink">←</Text>
          </Pressable>
          <Pressable
            onPress={handleRefresh}
            hitSlop={8}
            className="h-10 w-10 items-center justify-center border-[3px] border-ink bg-mustard"
            style={squareShadow}
          >
            <Text className="font-body-bold text-base text-ink">{refreshing ? "…" : "↻"}</Text>
          </Pressable>
        </View>

        <View className="gap-1">
          <Text className="font-body-bold text-[11px] uppercase tracking-[.2em] text-oxblood">
            {group?.status === "completed"
              ? "Crawlen er fullført"
              : group?.status === "active"
                ? "Crawlen pågår"
                : "Lobby"}
          </Text>
          <Text className="font-display text-3xl uppercase text-ink" style={{ lineHeight: 34 }}>
            {group?.name ?? "Gruppe"}
          </Text>
        </View>

        {route ? (
          <Pressable
            onPress={() => router.push({ pathname: "/route-detail", params: { routeId: route.id } })}
            className="gap-3 border-[3px] border-ink bg-paper-raised px-4 py-4 active:opacity-90"
            style={{ ...squareShadow, shadowOffset: { width: 5, height: 5 }, elevation: 5 }}
          >
            <View className="flex-row items-start justify-between gap-3">
              <View className="flex-1 gap-0.5">
                <Text className="font-body-bold text-[10px] uppercase tracking-[.2em] text-ink-muted">
                  Kveldens rute{route.neighborhood ? ` · ${route.neighborhood}` : ""}
                </Text>
                <Text className="font-display text-xl uppercase text-ink">{route.name}</Text>
              </View>
              <Text className="font-body-bold pt-1 text-[11px] uppercase tracking-[.12em] text-oxblood">
                Se →
              </Text>
            </View>
            <RouteStrip count={route.stops.length} />
            <Text className="font-body-bold text-[11px] uppercase tracking-[.12em] text-ink-muted">
              {route.stops.length} stopp{meters > 0 ? ` · ca. ${formatKm(meters)} km gange` : ""}
            </Text>
          </Pressable>
        ) : (
          <View className="gap-3 border-[3px] border-dashed border-ink px-4 py-4">
            <Text className="text-sm text-ink-body">Gruppen har ingen rute.</Text>
            <Button label="Utforsk ruter" variant="secondary" onPress={() => router.replace("/")} />
          </View>
        )}

        <View className="flex-row items-center gap-3 border-[3px] border-ink bg-paper-raised px-4 py-3">
          <View className="flex-1 gap-0.5">
            <Text className="font-body-bold text-[10px] uppercase tracking-[.2em] text-ink-muted">
              Kode
            </Text>
            <Text className="font-display text-2xl uppercase text-oxblood" style={{ letterSpacing: 3 }}>
              {group?.invite_code}
            </Text>
          </View>
          <Pressable
            onPress={handleShare}
            className="min-h-[44px] justify-center border-[3px] border-ink bg-mustard px-4"
            style={squareShadow}
          >
            <Text className="font-body-bold text-xs uppercase tracking-[.12em] text-ink">Del</Text>
          </Pressable>
        </View>

        <View className="gap-2">
          <Text className="font-body-bold text-[11px] uppercase tracking-[.2em] text-oxblood">
            Gjengen ({members.length})
          </Text>
          <View className="border-[3px] border-ink bg-paper-raised">
            {members.length === 0 ? (
              <Text className="px-4 py-4 text-center text-base text-ink-body">
                Ingen har blitt med enda.
              </Text>
            ) : (
              members.map((member, index) => {
                const avatar = AVATAR_OPTIONS.find((option) => option.id === member.avatar);
                return (
                  <View
                    key={member.id}
                    className={`flex-row items-center gap-3 px-4 py-3 ${
                      index > 0 ? "border-t border-ink/20" : ""
                    }`}
                  >
                    <View className="h-9 w-9 items-center justify-center rounded-full border-2 border-ink bg-slate">
                      <Text className="text-base">{avatar?.emoji ?? "🍺"}</Text>
                    </View>
                    <Text className="font-body-bold text-base text-ink">{member.name}</Text>
                  </View>
                );
              })
            )}
          </View>
        </View>
      </ScrollView>

      <View className="gap-2 border-t-[3px] border-ink bg-bar px-5 pb-4 pt-4">
        {error ? <Text className="font-body-bold text-sm text-oxblood">{error}</Text> : null}
        <Button
          label={
            starting
              ? "Starter…"
              : group?.status === "completed"
                ? "Se rapporten"
                : group?.status === "active"
                  ? `Gå til crawlen · stopp ${Math.min(
                      group.current_stop_index + 1,
                      route?.stops.length ?? 1
                    )}`
                  : "Start crawlen"
          }
          onPress={handleStart}
          disabled={!route || starting}
        />
      </View>
    </SafeAreaView>
  );
}
