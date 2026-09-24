import type { ReactNode } from "react";
import { Image, View } from "react-native";

type PhotoProps = {
  uri?: string | null;
  height: number;
  children?: ReactNode;
};

const STRIPE = 10;
// Large enough to cover any card once rotated.
const FIELD = 900;
const STRIPE_COUNT = FIELD / STRIPE;

// Real photo when we have one, otherwise the diagonal striped placeholder
// (the RN equivalent of repeating-linear-gradient(135deg, #e1d3ba 0 10px, #ece0cb 10px 20px)).
export default function Photo({ uri, height, children }: PhotoProps) {
  return (
    <View style={{ height, overflow: "hidden", backgroundColor: "#ece0cb" }}>
      {uri ? (
        <Image source={{ uri }} style={{ position: "absolute", width: "100%", height: "100%" }} />
      ) : (
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            width: FIELD,
            height: FIELD,
            left: "50%",
            top: "50%",
            marginLeft: -FIELD / 2,
            marginTop: -FIELD / 2,
            flexDirection: "row",
            transform: [{ rotate: "45deg" }],
          }}
        >
          {Array.from({ length: STRIPE_COUNT }, (_, i) => (
            <View
              key={i}
              style={{ width: STRIPE, height: FIELD, backgroundColor: i % 2 ? "#ece0cb" : "#e1d3ba" }}
            />
          ))}
        </View>
      )}
      {children}
    </View>
  );
}
