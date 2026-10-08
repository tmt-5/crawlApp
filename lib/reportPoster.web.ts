import { formatDistance, formatMinutes } from "./geo";
import { formatScore, reportDate, reportTitle, type ReportData } from "./report";
import { colors, fonts } from "./theme";

// The evening as one portrait card for sharing: masthead, the facts, the
// winner, the ranking and who judged hardest. Drawn straight onto a canvas so
// it looks the same in every browser and needs no screenshot library.

export type Poster = { blob: Blob; uri: string };

const W = 1080;
const H = 1620;
export const POSTER_ASPECT = W / H;

const MARGIN = 64;
const INNER = W - MARGIN * 2;
const MAX_RANKED = 5;

type Ctx = CanvasRenderingContext2D;

function setFont(ctx: Ctx, family: string, size: number, spacing = 0) {
  ctx.font = `${size}px "${family}"`;
  // Not in every browser; the poster reads fine without it.
  (ctx as Ctx & { letterSpacing?: string }).letterSpacing = `${spacing}px`;
}

function clip(ctx: Ctx, text: string, maxWidth: number): string {
  if (ctx.measureText(text).width <= maxWidth) return text;
  let cut = text;
  while (cut.length > 1 && ctx.measureText(`${cut}…`).width > maxWidth) cut = cut.slice(0, -1);
  return `${cut.trimEnd()}…`;
}

// Draws one line, stepping the size down until it fits and clipping if the
// smallest size is still too wide. Returns the size used.
function fitLine(
  ctx: Ctx,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  family: string,
  size: number,
  minSize: number
): number {
  let used = size;
  setFont(ctx, family, used);
  while (used > minSize && ctx.measureText(text).width > maxWidth) {
    used -= 4;
    setFont(ctx, family, used);
  }
  ctx.fillText(clip(ctx, text, maxWidth), x, y);
  return used;
}

function label(ctx: Ctx, text: string, x: number, y: number, color: string, maxWidth = INNER) {
  setFont(ctx, fonts.mono, 26, 1.5);
  ctx.fillStyle = color;
  ctx.fillText(clip(ctx, text.toUpperCase(), maxWidth), x, y);
}

function rule(ctx: Ctx, y: number, weight = 3) {
  ctx.fillStyle = colors.ink;
  ctx.fillRect(MARGIN, y, INNER, weight);
}

export async function createPoster({ group, route, report }: ReportData): Promise<Poster | null> {
  if (typeof document === "undefined") return null;
  await Promise.all(
    [fonts.display, fonts.body, fonts.bodyBold, fonts.mono].map((family) =>
      document.fonts.load(`40px "${family}"`).catch(() => [])
    )
  );

  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  ctx.textBaseline = "alphabetic";

  ctx.fillStyle = colors.cream;
  ctx.fillRect(0, 0, W, H);

  // Masthead
  const mastHeight = 330;
  ctx.fillStyle = colors.ink;
  ctx.fillRect(0, 0, W, mastHeight);
  label(ctx, `Kveldsrapport · ${reportDate(group)}`, MARGIN, 96, colors.paperLight);
  ctx.fillStyle = colors.ochre;
  fitLine(ctx, reportTitle(group, route).toUpperCase(), MARGIN, 216, INNER, fonts.display, 124, 72);
  const subtitle = [group.name !== route.name ? route.name : null, route.neighborhood]
    .filter(Boolean)
    .join(" · ");
  if (subtitle) label(ctx, subtitle, MARGIN, 280, colors.sand);

  // Facts
  const facts: [string, string][] = [["Stopp", String(report.stops.length)]];
  if (report.walk.meters > 0) facts.push(["Gange", formatDistance(report.walk.meters)]);
  if (report.durationMinutes) facts.push(["Varighet", formatMinutes(report.durationMinutes)]);
  if (report.judgeCount > 0) facts.push(["Dommere", String(report.judgeCount)]);
  const factsHeight = 150;
  ctx.fillStyle = colors.sand;
  ctx.fillRect(0, mastHeight, W, factsHeight);
  ctx.fillStyle = colors.ink;
  ctx.fillRect(0, mastHeight + factsHeight, W, 3);
  const factWidth = INNER / facts.length;
  facts.forEach(([name, value], i) => {
    const x = MARGIN + factWidth * i;
    label(ctx, name, x, mastHeight + 56, colors.inkSoft, factWidth - 16);
    ctx.fillStyle = colors.ink;
    fitLine(ctx, value, x, mastHeight + 116, factWidth - 16, fonts.display, 56, 36);
  });

  let y = mastHeight + factsHeight + 76;

  if (!report.best) {
    label(ctx, "Kveldens stopp", MARGIN, y, colors.red);
    y += 30;
    report.stops.slice(0, 8).forEach((stop) => {
      rule(ctx, y, 2);
      ctx.fillStyle = colors.ink;
      setFont(ctx, fonts.display, 52);
      ctx.fillText(String(stop.stopNumber), MARGIN, y + 62);
      fitLine(ctx, stop.venue.name.toUpperCase(), MARGIN + 70, y + 62, INNER - 70, fonts.display, 52, 36);
      y += 88;
    });
  } else {
    // Winner: name on the left, the score in an ochre well with the print shadow.
    const well = 190;
    label(ctx, "Kveldens vinner", MARGIN, y, colors.red);
    const wellX = W - MARGIN - well;
    const wellY = y - 26;
    ctx.fillStyle = colors.ink;
    ctx.fillRect(wellX + 10, wellY + 10, well, well);
    ctx.fillStyle = colors.ochre;
    ctx.fillRect(wellX, wellY, well, well);
    ctx.lineWidth = 4;
    ctx.strokeStyle = colors.ink;
    ctx.strokeRect(wellX, wellY, well, well);
    ctx.fillStyle = colors.ink;
    ctx.textAlign = "center";
    fitLine(ctx, formatScore(report.best.score), wellX + well / 2, wellY + 128, well - 24, fonts.display, 104, 64);
    ctx.textAlign = "left";

    const nameWidth = INNER - well - 40;
    ctx.fillStyle = colors.ink;
    fitLine(ctx, report.best.venue.name.toUpperCase(), MARGIN, y + 100, nameWidth, fonts.display, 96, 52);
    label(
      ctx,
      `Drikke ${formatScore(report.best.beer)} · Stemning ${formatScore(report.best.atmosphere)}`,
      MARGIN,
      y + 150,
      colors.inkSoft,
      nameWidth
    );
    y += 236;

    // Ranking
    report.ranked.slice(0, MAX_RANKED).forEach((stop, i) => {
      rule(ctx, y, i === 0 ? 3 : 2);
      const baseline = y + 60;
      ctx.fillStyle = colors.inkSoft;
      setFont(ctx, fonts.mono, 30);
      ctx.fillText(String(i + 1), MARGIN, baseline - 4);
      ctx.fillStyle = colors.ink;
      setFont(ctx, fonts.display, 50);
      ctx.textAlign = "right";
      ctx.fillText(formatScore(stop.score), W - MARGIN, baseline);
      ctx.textAlign = "left";
      fitLine(ctx, stop.venue.name.toUpperCase(), MARGIN + 60, baseline, INNER - 200, fonts.display, 50, 36);
      y += 84;
    });
    rule(ctx, y, 3);
  }

  // Awards along the bottom, at most two.
  const awards: [string, string, string][] = [];
  if (report.strictest) {
    awards.push([
      "Strengeste dommer",
      report.strictest.member.name,
      `Snitt ${formatScore(report.strictest.average)}`,
    ]);
  }
  if (report.dispute) {
    const { stop, high, low } = report.dispute;
    awards.push([
      "Kveldens krangel",
      stop.venue.name,
      `${high.member.name} ${formatScore(high.value)} · ${low.member.name} ${formatScore(low.value)}`,
    ]);
  } else if (report.kindest) {
    awards.push([
      "Snilleste dommer",
      report.kindest.member.name,
      `Snitt ${formatScore(report.kindest.average)}`,
    ]);
  }
  const footerY = H - 64;
  const awardHeight = 170;
  const awardY = footerY - 56 - awardHeight;
  if (awards.length > 0 && awardY > y + 24) {
    const gap = 24;
    const width = (INNER - gap * (awards.length - 1)) / awards.length;
    awards.forEach(([name, winner, detail], i) => {
      const x = MARGIN + (width + gap) * i;
      ctx.fillStyle = colors.paper;
      ctx.fillRect(x, awardY, width, awardHeight);
      ctx.lineWidth = 3;
      ctx.strokeStyle = colors.ink;
      ctx.strokeRect(x, awardY, width, awardHeight);
      label(ctx, name, x + 24, awardY + 48, colors.red, width - 48);
      ctx.fillStyle = colors.ink;
      fitLine(ctx, winner.toUpperCase(), x + 24, awardY + 104, width - 48, fonts.display, 52, 36);
      setFont(ctx, fonts.body, 26);
      ctx.fillStyle = colors.inkSoft;
      ctx.fillText(clip(ctx, detail, width - 48), x + 24, awardY + 144);
    });
  }

  // The site it came from, whatever domain that is.
  label(ctx, window.location.host, MARGIN, footerY, colors.inkSoft);

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
  return blob ? { blob, uri: URL.createObjectURL(blob) } : null;
}
