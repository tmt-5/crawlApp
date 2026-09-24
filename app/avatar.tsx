import { useMemo, useState } from "react";
import { Text, TextInput, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import Button from "../components/Button";
import AvatarGrid from "../components/AvatarGrid";
import { AVATAR_OPTIONS } from "../lib/avatars";
import { saveProfile } from "../lib/storage";
import type { AvatarId } from "../types/user";

type NextStep = "create-group" | "join-group";

export default function AvatarScreen() {
  const { next, routeId } = useLocalSearchParams<{ next?: NextStep; routeId?: string }>();
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
        router.replace("/join-group");
      } else {
        router.replace("/");
      }
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
            Hvem er du{"\n"}i kveld?
          </Text>

          <View className="gap-2">
            <Text className="font-body-bold text-[11px] uppercase tracking-[.2em] text-oxblood">
              Navn
            </Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Skriv navnet ditt"
              placeholderTextColor="#8a7a63"
              className="border-[3px] border-ink bg-paper-raised px-4 py-3 font-body text-base text-ink"
            />
          </View>

          <View className="gap-2">
            <Text className="font-body-bold text-[11px] uppercase tracking-[.2em] text-oxblood">
              Velg avatar
            </Text>
            <AvatarGrid
              options={AVATAR_OPTIONS}
              selectedId={avatarId}
              onSelect={setAvatarId}
            />
          </View>
        </View>

        <View className="pb-10">
          <Button
            label="Bekreft"
            onPress={handleConfirm}
            disabled={!canConfirm || saving}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
