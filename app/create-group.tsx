import { useEffect, useMemo, useState } from "react";
import { ScrollView, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import Button from "../components/Button";
import RouteCard from "../components/RouteCard";
import { Band, ErrorText, Field, Footer, Heading, Kicker, Masthead } from "../components/ui";
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
    <View className="flex-1 bg-cream">
      <StatusBar style="light" />
      <Masthead label="Ny gruppe" />
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ flexGrow: 1 }}>
        <Band divider={false} className="gap-6 pb-8 pt-5">
          <View className="gap-1">
            <Kicker>Samle gjengen</Kicker>
            <Heading size={36}>Opprett gruppe</Heading>
          </View>

          <Field
            label="Gruppenavn"
            value={name}
            onChangeText={setName}
            placeholder="F.eks. Fredagsgjengen"
            hint="Du får en kode som resten av gjengen bruker for å bli med."
          />

          {route ? (
            <View className="gap-2">
              <Kicker tone="ink">Valgt rute</Kicker>
              <RouteCard route={route} />
            </View>
          ) : null}

          {error ? <ErrorText>{error}</ErrorText> : null}
        </Band>
      </ScrollView>

      <Footer>
        <Button
          label={saving ? "Oppretter…" : "Opprett og få kode"}
          onPress={handleConfirm}
          disabled={!canConfirm || saving}
        />
      </Footer>
    </View>
  );
}
