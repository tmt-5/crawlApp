import { Text, View } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import Button from "../components/Button";

export default function ReportScreen() {
  return (
    <SafeAreaView className="flex-1 bg-paper" edges={["top", "bottom"]}>
      <View className="flex-1 px-5">
        <View className="flex-1 items-center justify-center gap-6">
          <Text className="font-body-bold text-[11px] uppercase tracking-[.2em] text-oxblood">
            Crawlen er fullført
          </Text>
          <View className="items-center border-[3px] border-dashed border-ink px-8 py-10">
            <Text
              className="font-display text-center text-2xl uppercase text-ink"
              style={{ lineHeight: 28 }}
            >
              Rapport{"\n"}kommer her
            </Text>
          </View>
        </View>

        <View className="pb-10">
          <Button label="Til start" onPress={() => router.replace("/")} />
        </View>
      </View>
    </SafeAreaView>
  );
}
