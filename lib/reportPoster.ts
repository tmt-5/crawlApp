import type { ReportData } from "./report";

// Native placeholder. The poster is drawn on a browser canvas (see
// reportPoster.web.ts); the native app shares the report as text for now.

export type Poster = { blob: Blob; uri: string };

export const POSTER_ASPECT = 2 / 3;

export async function createPoster(_data: ReportData): Promise<Poster | null> {
  return null;
}
