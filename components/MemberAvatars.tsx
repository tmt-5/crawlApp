import { View } from "react-native";
import { colors } from "../lib/theme";
import type { Member } from "../types/group";
import Avatar from "./Avatar";

type MemberAvatarsProps = {
  members: Member[];
  max?: number;
  // Surface colour behind the stack; each circle is outlined in it.
  surface?: string;
};

export default function MemberAvatars({ members, max = 5, surface = colors.cream }: MemberAvatarsProps) {
  const shown = members.slice(0, max);
  const hidden = members.length - shown.length;

  return (
    <View
      className="flex-row items-center"
      accessibilityLabel={`${members.length} i gruppen: ${members.map((m) => m.name).join(", ")}`}
    >
      {shown.map((member, index) => (
        <Avatar
          key={member.id}
          name={member.name}
          avatar={member.avatar}
          surface={surface}
          overlap={index === 0 ? 0 : 8}
        />
      ))}
      {hidden > 0 ? <Avatar name="" text={`+${hidden}`} surface={surface} overlap={8} /> : null}
    </View>
  );
}
