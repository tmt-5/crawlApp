import { Text, View } from "react-native";
import type { Member } from "../types/group";
import { initials } from "./CrawlMap.types";

type MemberAvatarsProps = {
  members: Member[];
  max?: number;
  // Surface colour behind the stack; each circle is outlined in it.
  surface?: string;
};

export default function MemberAvatars({ members, max = 5, surface = "#fff8ec" }: MemberAvatarsProps) {
  const shown = members.slice(0, max);
  const hidden = members.length - shown.length;

  return (
    <View className="flex-row items-center">
      {shown.map((member, index) => (
        <View
          key={member.id}
          className="h-8 w-8 items-center justify-center rounded-full bg-slate"
          style={{ borderWidth: 2, borderColor: surface, marginLeft: index === 0 ? 0 : -8 }}
        >
          <Text className="font-body-bold text-[11px] text-paper">{initials(member.name)}</Text>
        </View>
      ))}
      {hidden > 0 ? (
        <View
          className="h-8 w-8 items-center justify-center rounded-full bg-ink"
          style={{ borderWidth: 2, borderColor: surface, marginLeft: -8 }}
        >
          <Text className="font-body-bold text-[11px] text-paper">+{hidden}</Text>
        </View>
      ) : null}
    </View>
  );
}
