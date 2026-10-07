import { useEffect, useMemo, useState } from "react";
import { ScrollView, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import Button from "../components/Button";
import { Band, Body, ErrorText, Field, Footer, Heading, Kicker, Masthead } from "../components/ui";
import { joinGroupByCode } from "../lib/groups";
import { getProfile, saveMembership } from "../lib/storage";

export default function JoinGroupScreen() {
  // Invite links open this screen with ?code= filled in.
  const params = useLocalSearchParams<{ code?: string }>();
  const linkCode = (params.code ?? "").toUpperCase();
  const [code, setCode] = useState(linkCode);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Someone arriving from a link without a profile picks name and avatar
  // first, then comes back here with the code still filled in.
  useEffect(() => {
    if (!linkCode) return;
    getProfile().then((profile) => {
      if (!profile) {
        router.replace({ pathname: "/avatar", params: { next: "join-group", code: linkCode } });
      }
    });
  }, [linkCode]);

  const canConfirm = useMemo(() => code.trim().length > 0, [code]);

  const handleConfirm = async () => {
    if (!canConfirm || saving) return;
    setSaving(true);
    setError(null);
    try {
      const profile = await getProfile();
      if (!profile) {
        router.replace({ pathname: "/avatar", params: { next: "join-group", code } });
        return;
      }
      const result = await joinGroupByCode(code, profile);
      if (result.status === "not_found") {
        setError("Fant ingen gruppe med denne koden.");
        return;
      }
      if (result.status === "completed") {
        setError("Denne crawlen er allerede fullført.");
        return;
      }
      await saveMembership(result.group.id, result.member.id);
      // A crawl that is already under way is joined straight on the map.
      router.replace({
        pathname: result.group.status === "active" ? "/crawl" : "/group-lobby",
        params: { groupId: result.group.id },
      });
    } catch {
      setError("Klarte ikke å bli med i gruppen. Prøv igjen.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <View className="flex-1 bg-cream">
      <StatusBar style="light" />
      <Masthead label="Har kode" />
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ flexGrow: 1 }}>
        <Band divider={false} className="gap-6 pb-8 pt-5">
          <View className="gap-2">
            <Kicker>Gjengen venter</Kicker>
            <Heading size={36}>Bli med i gruppe</Heading>
            <Body>Skriv inn koden du har fått. Er crawlen i gang, havner du rett på kartet.</Body>
          </View>

          <Field
            label="Invitasjonskode"
            value={code}
            onChangeText={(text) => setCode(text.toUpperCase())}
            placeholder="F.eks. AB3F9K"
            autoCapitalize="characters"
            autoCorrect={false}
            className="font-mono tracking-[.15em]"
          />

          {error ? <ErrorText>{error}</ErrorText> : null}
        </Band>
      </ScrollView>

      <Footer>
        <Button
          label={saving ? "Blir med…" : "Bli med"}
          onPress={handleConfirm}
          disabled={!canConfirm || saving}
        />
      </Footer>
    </View>
  );
}
