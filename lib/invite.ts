import { Platform, Share } from "react-native";

export type ShareOutcome = "shared" | "copied" | "failed";

// On web the invite is a link to this same site, whatever domain it's served
// from, that opens the join screen with the code filled in. Native apps have
// no public URL yet, so they share the code only.
export function inviteLink(code: string): string | null {
  if (Platform.OS !== "web" || typeof window === "undefined") return null;
  return `${window.location.origin}/join-group?code=${encodeURIComponent(code)}`;
}

export async function shareInvite({
  groupName,
  routeName,
  code,
}: {
  groupName: string;
  routeName?: string | null;
  code: string;
}): Promise<ShareOutcome> {
  const routeText = routeName ? ` Vi tar ${routeName}.` : "";
  const text = `Bli med i ${groupName}.${routeText} Koden er ${code}.`;
  const url = inviteLink(code);

  if (Platform.OS !== "web" || !url) {
    try {
      await Share.share({ message: text });
      return "shared";
    } catch {
      return "failed";
    }
  }

  // Phones get the system share sheet; desktop browsers get the link copied.
  if (typeof navigator.share === "function") {
    try {
      await navigator.share({ text, url });
      return "shared";
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return "failed";
    }
  }
  try {
    await navigator.clipboard.writeText(`${text} ${url}`);
    return "copied";
  } catch {
    return "failed";
  }
}
