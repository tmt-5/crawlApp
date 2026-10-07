import type { ReactNode } from "react";
import { View } from "react-native";
import { Image } from "expo-image";

type PhotoProps = {
  uri?: string | null;
  height: number;
  children?: ReactNode;
};

const FALLBACK = require("../assets/images/bar-illustration.jpg");

// The venue's own photo when we have one, otherwise the woodcut bar illustration.
export default function Photo({ uri, height, children }: PhotoProps) {
  return (
    <View className="bg-ochre" style={{ height, overflow: "hidden" }}>
      <Image
        source={uri ? { uri } : FALLBACK}
        contentFit="cover"
        accessible={false}
        style={{ position: "absolute", width: "100%", height: "100%" }}
      />
      {children}
    </View>
  );
}
