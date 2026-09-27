import { useEffect, useMemo, useState } from "react";
import { Text, TextInput, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import Button from "../components/Button";
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
      router.replace({
        pathname: "/group-lobby",
        params: { groupId: result.group.id },
      });
    } catch {
      setError("Klarte ikke å bli med i gruppen. Prøv igjen.");
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
            Bli med i gruppe
          </Text>

          <View className="gap-2">
            <Text className="font-body-bold text-[11px] uppercase tracking-[.2em] text-oxblood">
              Invitasjonskode
            </Text>
            <TextInput
              value={code}
              onChangeText={(text) => setCode(text.toUpperCase())}
              placeholder="F.eks. AB3F9K"
              placeholderTextColor="#8a7a63"
              autoCapitalize="characters"
              className="border-[3px] border-ink bg-paper-raised px-4 py-3 font-body text-base uppercase tracking-[.15em] text-ink"
            />
          </View>

          {error ? (
            <Text className="font-body-bold text-sm text-oxblood">{error}</Text>
          ) : null}
        </View>

        <View className="pb-10">
          <Button
            label={saving ? "Blir med…" : "Bli med"}
            onPress={handleConfirm}
            disabled={!canConfirm || saving}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
