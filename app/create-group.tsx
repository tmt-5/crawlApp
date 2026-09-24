import { useEffect, useMemo, useState } from "react";
import { Text, TextInput, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import Button from "../components/Button";
import RouteStrip from "../components/RouteStrip";
import { createGroup } from "../lib/groups";
import { getRoute } from "../lib/routes";
import { getProfile, saveMembership } from "../lib/storage";
import type { CrawlRouteWithStops } from "../types/route";

export default function CreateGroupScreen() {
  const { routeId } = useLocalSearchParams<{ routeId: string }>();

  const [route, setRoute] = useState<CrawlRouteWithStops | null>(null);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!routeId) return;
    getRoute(routeId)
      .then(setRoute)
      .catch(() => setError("Klarte ikke å hente ruten."));
  }, [routeId]);

  const canConfirm = useMemo(() => name.trim().length > 0 && !!route, [name, route]);

  const handleConfirm = async () => {
    if (!canConfirm || !route || saving) return;
    setSaving(true);
    setError(null);
    try {
      const profile = await getProfile();
      if (!profile) {
        router.replace({ pathname: "/avatar", params: { next: "create-group", routeId: route.id } });
        return;
      }
      const { group, member } = await createGroup(name.trim(), profile, route);
      await saveMembership(group.id, member.id);
      router.replace({
        pathname: "/group-created",
        params: {
          groupId: group.id,
          name: group.name,
          inviteCode: group.invite_code,
          routeName: route.name,
        },
      });
    } catch {
      setError("Klarte ikke å opprette gruppen. Prøv igjen.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-paper" edges={["top", "bottom"]}>
      <View className="flex-1 px-5">
        <View className="flex-1 gap-8 pt-8">
          <Text
            className="font-display text-center text-3xl uppercase text-ink"
            style={{ lineHeight: 34 }}
          >
            Opprett gruppe
          </Text>

          {route ? (
            <View className="gap-3 border-[3px] border-ink bg-paper-raised px-4 py-4">
              <View className="gap-0.5">
                <Text className="font-body-bold text-[10px] uppercase tracking-[.2em] text-ink-muted">
                  Valgt rute
                </Text>
                <Text className="font-display text-xl uppercase text-ink">{route.name}</Text>
              </View>
              <RouteStrip count={route.stops.length} />
            </View>
          ) : null}

          <View className="gap-2">
            <Text className="font-body-bold text-[11px] uppercase tracking-[.2em] text-oxblood">
              Gruppenavn
            </Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="F.eks. Fredagsgjengen"
              placeholderTextColor="#8a7a63"
              className="border-[3px] border-ink bg-paper-raised px-4 py-3 font-body text-base text-ink"
            />
            <Text className="text-xs leading-4 text-ink-muted">
              Du får en kode som resten av gjengen bruker for å bli med.
            </Text>
          </View>

          {error ? (
            <Text className="font-body-bold text-sm text-oxblood">{error}</Text>
          ) : null}
        </View>

        <View className="pb-10">
          <Button
            label={saving ? "Oppretter…" : "Opprett og få kode"}
            onPress={handleConfirm}
            disabled={!canConfirm || saving}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
