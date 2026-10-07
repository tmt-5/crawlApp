import { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { isPhoto } from "../lib/avatars";
import { pickProfilePhoto } from "../lib/profilePhoto";
import { colors } from "../lib/theme";
import Avatar from "./Avatar";
import AvatarPicker from "./AvatarPicker";
import Icon from "./Icon";
import { ErrorText, Kicker, NO_OUTLINE, StampButton } from "./ui";

type ProfileFieldProps = {
  name: string;
  avatar: string;
  onChangeName: (name: string) => void;
  // Fires when a photo or drawn avatar is picked, or cleared ("").
  onChangeAvatar: (avatar: string) => void;
  // The name field lost focus or was submitted.
  onCommitName?: () => void;
  hint?: string;
};

// Name and picture on one line: a round button for the picture next to the
// name field. The button opens a small panel for uploading a photo or picking
// one of the drawn avatars. The picture is optional; without one the round
// button shows a plus and the person appears with their initials.
export default function ProfileField({
  name,
  avatar,
  onChangeName,
  onChangeAvatar,
  onCommitName,
  hint,
}: ProfileFieldProps) {
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const choose = (next: string) => {
    onChangeAvatar(next);
    setOpen(false);
  };

  const handleUpload = async () => {
    setError(null);
    try {
      const photo = await pickProfilePhoto(() => setWorking(true));
      if (photo) choose(photo);
    } catch {
      setError("Fikk ikke brukt det bildet. Prøv et annet.");
    } finally {
      setWorking(false);
    }
  };

  return (
    // Raised above the content that follows, which the open panel overlaps.
    <View className="gap-2" style={{ zIndex: 10 }}>
      <Kicker tone="ink">Navn og bilde</Kicker>
      <View className="flex-row items-center gap-2.5">
        <Pressable
          onPress={() => setOpen((current) => !current)}
          accessibilityRole="button"
          accessibilityLabel={avatar ? "Bytt profilbilde" : "Velg profilbilde"}
          accessibilityState={{ expanded: open }}
          className="h-[52px] w-[52px] items-center justify-center active:opacity-85"
        >
          {avatar ? (
            <Avatar name={name} avatar={avatar} size={52} surface={colors.ink} />
          ) : (
            <View
              className={`h-full w-full items-center justify-center rounded-full border-ink ${
                open ? "border-2 bg-paper-light" : "border-[1.5px] bg-paper"
              }`}
            >
              <Icon name="plus" size={22} />
            </View>
          )}
        </Pressable>
        <View
          className={`min-h-[52px] flex-1 justify-center border-ink ${
            focused ? "border-2 bg-paper-light px-[13px]" : "border-[1.5px] bg-paper px-3.5"
          }`}
        >
          <TextInput
            accessibilityLabel="Navn"
            value={name}
            onChangeText={onChangeName}
            placeholder="Skriv navnet ditt"
            placeholderTextColor={colors.inkSoft}
            maxLength={60}
            returnKeyType="done"
            onFocus={() => {
              setFocused(true);
              setOpen(false);
            }}
            onBlur={() => {
              setFocused(false);
              onCommitName?.();
            }}
            onSubmitEditing={onCommitName}
            className="py-3 font-body text-[16px] text-ink"
            style={NO_OUTLINE}
          />
        </View>
      </View>

      {open ? (
        <View
          className="absolute left-0 gap-4 border border-ink bg-paper p-[18px]"
          style={{ top: "100%", marginTop: 8, width: 256 }}
        >
          <View className="flex-row">
            <StampButton
              label={working ? "Henter bilde" : isPhoto(avatar) ? "Bytt bilde" : "Last opp eget bilde"}
              onPress={handleUpload}
              disabled={working}
            />
          </View>
          {error ? <ErrorText>{error}</ErrorText> : null}
          <View className="gap-2">
            <Kicker tone="ink">Eller velg en avatar</Kicker>
            <AvatarPicker value={avatar} onChange={choose} />
          </View>
          {avatar ? (
            <Pressable
              onPress={() => choose("")}
              accessibilityRole="button"
              className="min-h-[44px] justify-center border-t border-ink pt-2 active:opacity-70"
            >
              <Text className="font-body-bold text-[14px] text-ink underline">
                Bruk initialene i stedet
              </Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}

      {hint ? <Text className="font-body text-[13px] text-ink-soft">{hint}</Text> : null}
    </View>
  );
}
