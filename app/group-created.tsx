import { useState } from "react";
import { Platform, Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import Button from "../components/Button";
import { shareInvite } from "../lib/invite";

export default function GroupCreatedScreen() {
  const { groupId, name, inviteCode, routeName } = useLocalSearchParams<{
    groupId: string;
    name: string;
    inviteCode: string;
    routeName?: string;
  }>();

  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const outcome = await shareInvite({ groupName: name, routeName, code: inviteCode });
    if (outcome === "copied") {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-paper" edges={["top", "bottom"]}>
      <View className="flex-1 px-5">
        <View className="flex-1 items-center justify-center gap-10">
          <View className="items-center gap-2">
            <Text className="font-body-bold text-xs uppercase tracking-[.2em] text-oxblood">
              Gruppen er opprettet
            </Text>
            <Text className="font-display text-center text-2xl uppercase text-ink">
              {name}
            </Text>
            {routeName ? (
              <Text className="font-body-bold text-center text-[11px] uppercase tracking-[.12em] text-ink-muted">
                Rute: {routeName}
              </Text>
            ) : null}
          </View>

          <View
            className="items-center gap-1 border-4 border-oxblood px-10 py-6"
            style={{ transform: [{ rotate: "-4deg" }] }}
          >
            <Text className="font-body-bold text-[11px] uppercase tracking-[.2em] text-oxblood">
              Kode
            </Text>
            <Text
              className="font-display text-5xl uppercase text-oxblood"
              style={{ letterSpacing: 4 }}
            >
              {inviteCode}
            </Text>
          </View>

          <Text className="px-4 text-center text-base leading-6 text-ink-body">
            {Platform.OS === "web"
              ? "Send lenken til gjengen. Den åpner gruppen med koden fylt inn."
              : "Send koden til gjengen. De åpner appen, trykker «Har kode» og skriver den inn."}
          </Text>
        </View>

        <View className="gap-3 pb-10">
          <Button
            label={copied ? "Lenke kopiert" : Platform.OS === "web" ? "Del lenken" : "Del koden"}
            onPress={handleShare}
          />
          <Button
            label="Til lobbyen"
            variant="secondary"
            onPress={() =>
              router.replace({ pathname: "/group-lobby", params: { groupId } })
            }
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
