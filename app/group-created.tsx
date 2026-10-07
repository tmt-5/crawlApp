import { useState } from "react";
import { Platform, ScrollView, Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Button from "../components/Button";
import { ActionBar, Band, Body, Footer, Heading, Kicker } from "../components/ui";
import { shareInvite } from "../lib/invite";

export default function GroupCreatedScreen() {
  const insets = useSafeAreaInsets();
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
    <View className="flex-1 bg-cream" style={{ paddingTop: insets.top }}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}>
        <Band divider={false} className="gap-7 py-10">
          <View className="gap-2">
            <Kicker>Gruppen er opprettet</Kicker>
            <Heading size={40}>{name}</Heading>
            {routeName ? <Kicker tone="soft">Rute: {routeName}</Kicker> : null}
          </View>

          <View
            className="items-center gap-1 self-center border-2 border-red px-10 py-5"
            style={{ transform: [{ rotate: "-3deg" }] }}
          >
            <Kicker>Kode</Kicker>
            <Text className="font-display text-[52px] text-red" style={{ letterSpacing: 4, lineHeight: 54 }}>
              {inviteCode}
            </Text>
          </View>

          <Body>
            {Platform.OS === "web"
              ? "Send lenken til gjengen. Den åpner gruppen med koden fylt inn."
              : "Send koden til gjengen. De åpner appen, trykker «Bli med i gruppe» og skriver den inn."}
          </Body>
        </Band>
      </ScrollView>

      <Footer>
        <ActionBar
          label={copied ? "Lenke kopiert" : Platform.OS === "web" ? "Del lenken" : "Del koden"}
          onPress={handleShare}
        />
        <Button
          label="Til lobbyen"
          variant="secondary"
          onPress={() => router.replace({ pathname: "/group-lobby", params: { groupId } })}
        />
      </Footer>
    </View>
  );
}
