import { useCallback, useEffect, useRef, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import Avatar from "../components/Avatar";
import Button from "../components/Button";
import CodeStamp from "../components/CodeStamp";
import ProfileField from "../components/ProfileField";
import {
  ActionBar,
  Band,
  Body,
  ErrorText,
  Field,
  Footer,
  Heading,
  Kicker,
  Masthead,
} from "../components/ui";
import {
  addMember,
  createGroup,
  getGroup,
  getMembers,
  renameGroup,
  startCrawl,
  updateMember,
} from "../lib/groups";
import { shareInvite } from "../lib/invite";
import { getRoute } from "../lib/routes";
import {
  getMembership,
  getProfile,
  isGroupHost,
  saveMembership,
  saveProfile,
  setGroupHost,
} from "../lib/storage";
import { colors } from "../lib/theme";
import type { Group, Member } from "../types/group";
import type { CrawlRouteWithStops } from "../types/route";

// One screen from "I picked a route" to "we're off": opened with a routeId it
// creates the group at once; with a groupId it loads it. Either way it shows
// the code to share, your own name and picture, who has joined, an optional
// group name and the start button.
export default function GroupLobbyScreen() {
  const { groupId, routeId } = useLocalSearchParams<{ groupId?: string; routeId?: string }>();
  const [group, setGroup] = useState<Group | null>(null);
  const [route, setRoute] = useState<CrawlRouteWithStops | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [copied, setCopied] = useState(false);
  const [myName, setMyName] = useState("");
  const [myAvatar, setMyAvatar] = useState("");
  // Only the one who created the group can give it a name.
  const [isHost, setIsHost] = useState(false);
  // This device's member row; null until a name has been entered.
  const myMemberId = useRef<string | null>(null);

  useEffect(() => {
    getProfile().then((profile) => {
      if (!profile) return;
      setMyName((current) => current || profile.name);
      setMyAvatar((current) => current || profile.avatar);
    });
  }, []);

  const load = useCallback(async () => {
    if (!groupId) return;
    const [groupData, memberData, membership, host] = await Promise.all([
      getGroup(groupId),
      getMembers(groupId),
      getMembership(groupId),
      isGroupHost(groupId),
    ]);
    setIsHost(host);
    myMemberId.current = memberData.some((m) => m.id === membership) ? membership : null;
    const routeData = groupData?.route_id ? await getRoute(groupData.route_id) : null;
    setGroup(groupData);
    setMembers(memberData);
    setRoute(routeData);
    // A group still named after its route has no name of its own yet.
    if (groupData && groupData.name !== routeData?.name) {
      setName((current) => current || groupData.name);
    }
  }, [groupId]);

  // Reload on focus so the stop number is current after coming back from the crawl.
  useFocusEffect(
    useCallback(() => {
      if (!groupId) return;
      load()
        .catch(() => setError("Klarte ikke å hente gruppen."))
        .finally(() => setLoading(false));
    }, [load, groupId])
  );

  // Arriving with a route creates the group straight away, so the code is on
  // screen from the start. It is named after the route until someone gives it
  // a name of its own.
  const creating = useRef(false);
  const createFromRoute = useCallback(async () => {
    if (groupId || !routeId || creating.current) return;
    creating.current = true;
    setError(null);
    try {
      const profile = await getProfile();
      const routeData = await getRoute(routeId);
      if (!routeData) {
        setError("Fant ikke ruten.");
        return;
      }
      const created = await createGroup(routeData.name, profile, routeData);
      await setGroupHost(created.group.id);
      setIsHost(true);
      if (created.member) {
        await saveMembership(created.group.id, created.member.id);
        myMemberId.current = created.member.id;
      }
      setRoute(routeData);
      setGroup(created.group);
      setMembers(created.member ? [created.member] : []);
      // Same screen, now addressed by its group, so a reload or the back
      // button doesn't create another one.
      router.replace({ pathname: "/group-lobby", params: { groupId: created.group.id } });
    } catch {
      setError("Klarte ikke å opprette gruppen.");
    } finally {
      creating.current = false;
      setLoading(false);
    }
  }, [groupId, routeId]);

  useEffect(() => {
    createFromRoute();
  }, [createFromRoute]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await load().catch(() => {});
    setRefreshing(false);
  };

  // Saves your name and picture: the first time it adds you to the group,
  // after that it updates your row. Saves run one at a time, so leaving the
  // name field and pressing start right after can't add you twice.
  const saveQueue = useRef<Promise<void>>(Promise.resolve());
  const saveMe = (nextName: string, nextAvatar: string): Promise<void> => {
    const run = async () => {
      const profile = { name: nextName.trim(), avatar: nextAvatar };
      if (!group || group.status === "completed" || !profile.name) return;
      await saveProfile(profile);
      const memberId = myMemberId.current;
      if (!memberId) {
        const member = await addMember(group.id, profile);
        await saveMembership(group.id, member.id);
        myMemberId.current = member.id;
        setMembers((current) => [...current, member]);
        return;
      }
      const me = members.find((m) => m.id === memberId);
      if (me && me.name === profile.name && me.avatar === profile.avatar) return;
      const updated = await updateMember(memberId, profile);
      setMembers((current) => current.map((m) => (m.id === updated.id ? updated : m)));
    };
    const next = saveQueue.current.then(run);
    saveQueue.current = next.catch(() => {});
    return next;
  };

  const handleSaveMe = (nextName: string, nextAvatar: string) => {
    saveMe(nextName, nextAvatar)
      .then(() => setError(null))
      .catch(() => setError("Klarte ikke å lagre navnet og bildet ditt."));
  };

  // The name is optional; an empty field keeps the route's name.
  const handleRename = async () => {
    const next = name.trim();
    if (!group || !isHost || next.length === 0 || next === group.name) return;
    try {
      setGroup(await renameGroup(group.id, next));
      setError(null);
    } catch {
      setError("Klarte ikke å lagre gruppenavnet.");
    }
  };

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
    if (!group || busy) return;
    if (group.status === "completed") {
      router.push({ pathname: "/report", params: { groupId: group.id } });
      return;
    }
    if (group.status === "active") {
      router.push({ pathname: "/crawl", params: { groupId: group.id } });
      return;
    }
    if (!myName.trim()) {
      setError("Skriv inn navnet ditt først.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      // A failed edit of name or picture shouldn't hold up the crawl, as long
      // as you are already in the group.
      await saveMe(myName, myAvatar).catch((saveError) => {
        if (!myMemberId.current) throw saveError;
      });
      await handleRename();
      await startCrawl(group.id);
      router.replace({ pathname: "/crawl", params: { groupId: group.id } });
    } catch {
      setError("Klarte ikke å starte crawlen. Prøv igjen.");
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-cream">
        <ActivityIndicator color={colors.ink} />
      </View>
    );
  }

  if (!group) {
    return (
      <View className="flex-1 bg-cream">
        <StatusBar style="light" />
        <Masthead label="Lobby" />
        <Band divider={false} className="gap-4 py-10">
          {error ? <ErrorText>{error}</ErrorText> : <Body>Fant ikke gruppen.</Body>}
          {routeId ? (
            <Button label="Prøv igjen" onPress={createFromRoute} />
          ) : (
            <Button label="Utforsk ruter" variant="secondary" onPress={() => router.replace("/")} />
          )}
        </Band>
      </View>
    );
  }

  const hasOwnName = group.name !== route?.name;

  const status =
    group.status === "completed"
      ? "Crawlen er fullført"
      : group.status === "active"
        ? "Crawlen pågår"
        : "Før avreise";

  return (
    <View className="flex-1 bg-cream">
      <StatusBar style="light" />
      <Masthead
        label="Lobby"
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
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ flexGrow: 1 }}>
        <Band divider={false} className="gap-7 pb-8 pt-5">
          <View className="gap-1">
            <Kicker>{status}</Kicker>
            <Heading size={36}>Samle gjengen</Heading>
          </View>

          {group.status !== "completed" ? (
            <ProfileField
              name={myName}
              avatar={myAvatar}
              onChangeName={setMyName}
              onChangeAvatar={(next) => {
                setMyAvatar(next);
                handleSaveMe(myName, next);
              }}
              onCommitName={() => handleSaveMe(myName, myAvatar)}
            />
          ) : null}

          <View className="flex-row items-center gap-5 py-2 pl-1">
            <CodeStamp
              code={group.invite_code}
              label={copied ? "Lenke kopiert" : "Gruppe-kode"}
              onPress={handleShare}
            />
            <Body className="flex-1">
              Del koden med gjengen. De kan bli med nå, eller etter at crawlen er i gang.
            </Body>
          </View>

          <View className="gap-1.5">
            <Kicker tone="ink">
              {members.length === 0
                ? "Ingen crawlere klare"
                : members.length === 1
                  ? "1 crawler klar"
                  : `${members.length} crawlere klare`}
            </Kicker>
            {members.length === 0 ? (
              <Body className="text-ink-soft">Skriv inn navnet ditt øverst, så er du med.</Body>
            ) : null}
            <View className={members.length === 0 ? "hidden" : "border-[1.5px] border-ink bg-paper"}>
              {members.map((member, index) => (
                <View
                  key={member.id}
                  className={`min-h-[52px] flex-row items-center gap-3 px-3.5 py-2.5 ${
                    index > 0 ? "border-t-[1.5px] border-ink" : ""
                  }`}
                >
                  <Avatar name={member.name} avatar={member.avatar} surface={colors.paper} />
                  <Text className="flex-1 font-body-bold text-[16px] text-ink" numberOfLines={1}>
                    {member.name}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {isHost ? (
            <Field
              label="Gruppenavn?"
              aside="Frivillig"
              value={name}
              onChangeText={setName}
              onBlur={handleRename}
              onSubmitEditing={handleRename}
              returnKeyType="done"
              placeholder="F.eks. Fredagsgjengen"
            />
          ) : hasOwnName ? (
            <View className="gap-1">
              <Kicker tone="ink">Gruppenavn</Kicker>
              <Text className="font-body-bold text-[16px] text-ink">{group.name}</Text>
            </View>
          ) : null}
        </Band>
      </ScrollView>

      <Footer>
        {error ? <ErrorText>{error}</ErrorText> : null}
        <ActionBar
          label={
            busy
              ? "Starter…"
              : group.status === "completed"
                ? "Se rapporten"
                : group.status === "active"
                  ? `Gå til crawlen · stopp ${Math.min(
                      group.current_stop_index + 1,
                      route?.stops.length ?? 1
                    )}`
                  : "Start crawl"
          }
          onPress={handleStart}
          disabled={!route || busy}
        />
      </Footer>
    </View>
  );
}
