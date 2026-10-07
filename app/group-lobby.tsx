import { useCallback, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import Button from "../components/Button";
import { Monogram } from "../components/MemberAvatars";
import { initials } from "../components/CrawlMap.types";
import RouteCard from "../components/RouteCard";
import {
  ActionBar,
  Band,
  Body,
  ErrorText,
  Footer,
  Heading,
  Kicker,
  Masthead,
  StampButton,
} from "../components/ui";
import { AVATAR_OPTIONS } from "../lib/avatars";
import { getGroup, getMembers, startCrawl } from "../lib/groups";
import { shareInvite } from "../lib/invite";
import { getRoute } from "../lib/routes";
import { colors } from "../lib/theme";
import type { Group, Member } from "../types/group";
import type { CrawlRouteWithStops } from "../types/route";

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

  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
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
      <View className="flex-1 items-center justify-center bg-cream">
        <ActivityIndicator color={colors.ink} />
      </View>
    );
  }

  const status =
    group?.status === "completed"
      ? "Crawlen er fullført"
      : group?.status === "active"
        ? "Crawlen pågår"
        : "Lobby";

  return (
    <View className="flex-1 bg-cream">
      <StatusBar style="light" />
      <Masthead
        label={status}
        onBack={() => router.replace("/")}
        right={
          <Pressable
            onPress={handleRefresh}
            accessibilityRole="button"
            className="min-h-[44px] justify-center border border-paper-light px-3 active:opacity-80"
          >
            <Kicker tone="light">{refreshing ? "Henter…" : "Oppdater"}</Kicker>
          </Pressable>
        }
      />
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <Band divider={false} className="gap-4 pb-7 pt-5">
          <View className="gap-1">
            <Kicker>Gruppe</Kicker>
            <Heading size={36}>{group?.name ?? "Gruppe"}</Heading>
          </View>

          <View className="flex-row items-center gap-3 border-[1.5px] border-ink bg-paper px-3.5 py-3">
            <View className="flex-1 gap-0.5">
              <Kicker tone="soft">Kode</Kicker>
              <Text className="font-display text-[30px] text-ink" style={{ letterSpacing: 3 }}>
                {group?.invite_code}
              </Text>
            </View>
            <StampButton label={copied ? "Kopiert" : "Del"} onPress={handleShare} />
          </View>
        </Band>

        <Band tone="sand" className="gap-3.5 pb-7 pt-6">
          <View className="gap-0.5">
            <Kicker>Kveldens rute</Kicker>
            <Heading size={26}>{route ? "Hit skal dere" : "Ingen rute valgt"}</Heading>
          </View>
          {route ? (
            <RouteCard route={route} />
          ) : (
            <>
              <Body>Gruppen har ingen rute ennå.</Body>
              <Button label="Utforsk ruter" variant="secondary" onPress={() => router.replace("/")} />
            </>
          )}
        </Band>

        <View className="flex-1 bg-cream">
          <Band className="gap-3.5 pb-8 pt-6">
            <View className="gap-0.5">
              <Kicker>Hvem blir med</Kicker>
              <Heading size={26}>Gjengen ({members.length})</Heading>
            </View>
            <View className="border-[1.5px] border-ink bg-paper">
              {members.length === 0 ? (
                <Body className="px-3.5 py-4">Ingen har blitt med ennå.</Body>
              ) : (
                members.map((member, index) => {
                  const role = AVATAR_OPTIONS.find((option) => option.id === member.avatar);
                  return (
                    <View
                      key={member.id}
                      className={`min-h-[52px] flex-row items-center gap-3 px-3.5 py-2.5 ${
                        index > 0 ? "border-t border-ink" : ""
                      }`}
                    >
                      <Monogram name={initials(member.name)} surface={colors.paper} />
                      <Text className="flex-1 font-body-bold text-[16px] text-ink" numberOfLines={1}>
                        {member.name}
                      </Text>
                      {role ? <Kicker tone="soft">{role.label}</Kicker> : null}
                    </View>
                  );
                })
              )}
            </View>
          </Band>
        </View>
      </ScrollView>

      <Footer>
        {error ? <ErrorText>{error}</ErrorText> : null}
        <ActionBar
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
      </Footer>
    </View>
  );
}
