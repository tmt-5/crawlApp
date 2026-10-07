import { useMemo, useState } from "react";
import { ScrollView, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import AvatarGrid from "../components/AvatarGrid";
import Button from "../components/Button";
import { Band, Field, Footer, Heading, Kicker, Masthead } from "../components/ui";
import { AVATAR_OPTIONS } from "../lib/avatars";
import { saveProfile } from "../lib/storage";
import type { AvatarId } from "../types/user";

type NextStep = "create-group" | "join-group";

export default function AvatarScreen() {
  const { next, routeId, code } = useLocalSearchParams<{
    next?: NextStep;
    routeId?: string;
    code?: string;
  }>();
  const [name, setName] = useState("");
  const [avatarId, setAvatarId] = useState<AvatarId | null>(null);
  const [saving, setSaving] = useState(false);

  const canConfirm = useMemo(
    () => name.trim().length > 0 && avatarId !== null,
    [name, avatarId]
  );

  const handleConfirm = async () => {
    if (!canConfirm || !avatarId) return;
    setSaving(true);
    try {
      await saveProfile({ name: name.trim(), avatarId });
      if (next === "create-group" && routeId) {
        router.replace({ pathname: "/create-group", params: { routeId } });
      } else if (next === "join-group") {
        router.replace(code ? { pathname: "/join-group", params: { code } } : "/join-group");
      } else {
        router.replace("/");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <View className="flex-1 bg-cream">
      <StatusBar style="light" />
      <Masthead label="Profil" />
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ flexGrow: 1 }}>
        <Band divider={false} className="gap-6 pb-8 pt-5">
          <View className="gap-1">
            <Kicker>Før vi går</Kicker>
            <Heading size={36}>Hvem er du{"\n"}i kveld?</Heading>
          </View>

          <Field
            label="Navn"
            value={name}
            onChangeText={setName}
            placeholder="Skriv navnet ditt"
          />

          <View className="gap-2">
            <Kicker tone="ink">Velg rolle</Kicker>
            <AvatarGrid options={AVATAR_OPTIONS} selectedId={avatarId} onSelect={setAvatarId} />
          </View>
        </Band>
      </ScrollView>

      <Footer>
        <Button label="Bekreft" onPress={handleConfirm} disabled={!canConfirm || saving} />
      </Footer>
    </View>
  );
}
