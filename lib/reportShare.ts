import { Platform, Share } from "react-native";
import type { Poster } from "./reportPoster";

// "cancelled" is the person closing the share sheet, which is not an error.
export type ShareOutcome = "shared" | "copied" | "saved" | "cancelled" | "failed";

// On web the report is a page anyone with the link can open. Native apps have
// no public URL yet.
export function reportLink(groupId: string): string | null {
  if (Platform.OS !== "web" || typeof window === "undefined") return null;
  return `${window.location.origin}/report?groupId=${encodeURIComponent(groupId)}`;
}

// Phones get the system share sheet; a desktop share sheet is more in the way
// than a copied link or a downloaded file.
function prefersShareSheet(): boolean {
  return typeof navigator.share === "function" && window.matchMedia("(pointer: coarse)").matches;
}

export async function shareReportLink(groupId: string, text: string): Promise<ShareOutcome> {
  const url = reportLink(groupId);
  if (!url) {
    try {
      await Share.share({ message: text });
      return "shared";
    } catch {
      return "failed";
    }
  }

  if (prefersShareSheet()) {
    try {
      await navigator.share({ text, url });
      return "shared";
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return "cancelled";
    }
  }
  try {
    await navigator.clipboard.writeText(url);
    return "copied";
  } catch {
    return "failed";
  }
}

// The share sheet is where a phone offers "Lagre bilde" and sending to
// friends. Everywhere else the poster is downloaded as a file.
export async function sharePoster(poster: Poster, fileName: string): Promise<ShareOutcome> {
  if (Platform.OS !== "web") return "failed";

  const file = new File([poster.blob], fileName, { type: "image/png" });
  if (prefersShareSheet() && navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file] });
      return "shared";
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return "cancelled";
    }
  }
  try {
    const link = document.createElement("a");
    link.href = poster.uri;
    link.download = fileName;
    link.click();
    return "saved";
  } catch {
    return "failed";
  }
}
