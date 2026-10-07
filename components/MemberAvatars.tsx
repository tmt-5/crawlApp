import { Text, View } from "react-native";
import { colors } from "../lib/theme";
import type { Member } from "../types/group";
import { initials } from "./CrawlMap.types";

type MemberAvatarsProps = {
  members: Member[];
  max?: number;
  // Surface colour behind the stack; each circle is outlined in it.
  surface?: string;
};

export function Monogram({
  name,
  size = 32,
  surface = colors.cream,
  overlap = 0,
}: {
  name: string;
  size?: number;
  surface?: string;
  overlap?: number;
}) {
  return (
    <View
      className="items-center justify-center rounded-full bg-ink"
      style={{ width: size, height: size, borderWidth: 2, borderColor: surface, marginLeft: -overlap }}
    >
      <Text className="font-display text-[13px] text-cream">{name}</Text>
    </View>
  );
}

export default function MemberAvatars({ members, max = 5, surface = colors.cream }: MemberAvatarsProps) {
  const shown = members.slice(0, max);
  const hidden = members.length - shown.length;

  return (
    <View
      className="flex-row items-center"
      accessibilityLabel={`${members.length} i gruppen: ${members.map((m) => m.name).join(", ")}`}
    >
      {shown.map((member, index) => (
        <Monogram
          key={member.id}
          name={initials(member.name)}
          surface={surface}
          overlap={index === 0 ? 0 : 8}
        />
      ))}
      {hidden > 0 ? <Monogram name={`+${hidden}`} surface={surface} overlap={8} /> : null}
    </View>
  );
}
