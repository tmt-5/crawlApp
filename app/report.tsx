import { ScrollView, View } from "react-native";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ActionBar, Band, Body, Footer, Heading, Kicker } from "../components/ui";

export default function ReportScreen() {
  const insets = useSafeAreaInsets();
  return (
    <View className="flex-1 bg-ink" style={{ paddingTop: insets.top }}>
      <StatusBar style="light" />
      <ScrollView className="bg-cream" contentContainerStyle={{ flexGrow: 1 }}>
        <Band tone="ink" divider={false} className="gap-2 py-8">
          <Kicker tone="light">Crawlen er fullført</Kicker>
          <Heading size={40} tone="ochre">
            Slutten på ruten.{"\n"}Takk for i kveld.
          </Heading>
        </Band>
        <Band divider={false} className="gap-3 py-7">
          <Kicker>Rapport</Kicker>
          <Heading size={26}>Kommer her</Heading>
          <Body>
            Her samler vi kvelden: stoppene dere var innom og hva gjengen syntes om dem.
          </Body>
        </Band>
      </ScrollView>
      <Footer>
        <ActionBar label="Til start" onPress={() => router.replace("/")} />
      </Footer>
    </View>
  );
}
