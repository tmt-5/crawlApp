import { getCheckins } from "./checkins";
import { routeWalk, type Walk } from "./geo";
import { getGroup, getMembers } from "./groups";
import { getRoute } from "./routes";
import type { Group, Member } from "../types/group";
import type { CrawlRouteWithStops } from "../types/route";
import type { Checkin, Venue } from "../types/venue";

// The evening report: what the group thought of each stop, who judged how,
// and how far they walked. Everything is derived from the check-ins.

export type Scores = {
  beer: number | null;
  atmosphere: number | null;
  overall: number | null;
};

export type StopReport = Scores & {
  stopNumber: number;
  venue: Venue;
  // How many gave at least one rating here.
  raters: number;
  // What the stop is ranked on: the overall average, or the mean of the other
  // two when nobody gave an overall rating.
  score: number | null;
};

export type Judge = { member: Member; average: number };

export type Dispute = {
  stop: StopReport;
  high: { member: Member; value: number };
  low: { member: Member; value: number };
};

export type MyStop = { stop: StopReport; mine: Scores };

export type Report = {
  stops: StopReport[];
  // Rated stops, best first.
  ranked: StopReport[];
  best: StopReport | null;
  worst: StopReport | null;
  bestBeer: StopReport | null;
  bestAtmosphere: StopReport | null;
  dispute: Dispute | null;
  strictest: Judge | null;
  kindest: Judge | null;
  judgeCount: number;
  walk: Walk;
  durationMinutes: number | null;
  mine: MyStop[];
};

// A "krangel" needs at least this many points between the highest and lowest.
const DISPUTE_MIN_GAP = 2;

function mean(values: (number | null)[]): number | null {
  const given = values.filter((value): value is number => value != null);
  return given.length === 0 ? null : given.reduce((sum, value) => sum + value, 0) / given.length;
}

function combined(scores: Scores): number | null {
  return scores.overall ?? mean([scores.beer, scores.atmosphere]);
}

function scoresOf(checkin: Checkin): Scores {
  return {
    beer: checkin.rating_beer,
    atmosphere: checkin.rating_atmosphere,
    overall: checkin.rating_overall,
  };
}

// The highest of `items` by `value`, earliest first on a tie. Null unless at
// least two items have a value, since a winner of one is no contest.
function top<T>(items: T[], value: (item: T) => number | null, direction: 1 | -1 = 1): T | null {
  const scored = items.filter((item) => value(item) != null);
  if (scored.length < 2) return null;
  return scored.reduce((best, item) =>
    (value(item)! - value(best)!) * direction > 0 ? item : best
  );
}

export function buildReport(
  group: Group,
  route: CrawlRouteWithStops,
  members: Member[],
  checkins: Checkin[],
  memberId: string | null
): Report {
  // A report opened before the crawl is over covers the stops reached so far.
  const visited =
    group.status === "completed" ? route.stops : route.stops.slice(0, group.current_stop_index + 1);
  const memberById = new Map(members.map((member) => [member.id, member]));

  const stops: StopReport[] = [];
  const mine: MyStop[] = [];
  let dispute: (Dispute & { gap: number }) | null = null;

  for (const [index, routeStop] of visited.entries()) {
    const here = checkins.filter((checkin) => checkin.venue_id === routeStop.venue_id);
    const averages: Scores = {
      beer: mean(here.map((c) => c.rating_beer)),
      atmosphere: mean(here.map((c) => c.rating_atmosphere)),
      overall: mean(here.map((c) => c.rating_overall)),
    };
    const stop: StopReport = {
      ...averages,
      stopNumber: index + 1,
      venue: routeStop.venue,
      raters: here.filter((c) => combined(scoresOf(c)) != null).length,
      score: combined(averages),
    };
    stops.push(stop);

    const own = here.find((checkin) => checkin.member_id === memberId);
    if (own && combined(scoresOf(own)) != null) mine.push({ stop, mine: scoresOf(own) });

    const verdicts = here.flatMap((checkin) => {
      const member = memberById.get(checkin.member_id);
      const value = combined(scoresOf(checkin));
      return member && value != null ? [{ member, value }] : [];
    });
    const high = top(verdicts, (v) => v.value);
    const low = top(verdicts, (v) => v.value, -1);
    if (high && low) {
      const gap = high.value - low.value;
      if (gap >= DISPUTE_MIN_GAP && gap > (dispute?.gap ?? 0)) dispute = { stop, high, low, gap };
    }
  }

  const judges: Judge[] = members.flatMap((member) => {
    const given = checkins
      .filter((c) => c.member_id === member.id && visited.some((s) => s.venue_id === c.venue_id))
      .flatMap((c) => [c.rating_beer, c.rating_atmosphere, c.rating_overall]);
    const average = mean(given);
    return average == null ? [] : [{ member, average }];
  });
  const strictest = top(judges, (judge) => judge.average, -1);
  const kindest = top(judges, (judge) => judge.average);
  const judgesDiffer = !!strictest && !!kindest && strictest.average !== kindest.average;

  const ranked = stops
    .filter((stop) => stop.score != null)
    .sort((a, b) => b.score! - a.score! || a.stopNumber - b.stopNumber);
  const best = ranked[0] ?? null;
  const last = ranked.length > 1 ? ranked[ranked.length - 1] : null;

  const started = group.started_at ? Date.parse(group.started_at) : NaN;
  const ended = group.completed_at ? Date.parse(group.completed_at) : NaN;
  const minutes = Math.round((ended - started) / 60_000);

  return {
    stops,
    ranked,
    best,
    worst: last && best && last.score! < best.score! ? last : null,
    bestBeer: top(stops, (stop) => stop.beer),
    bestAtmosphere: top(stops, (stop) => stop.atmosphere),
    dispute,
    strictest: judgesDiffer ? strictest : null,
    kindest: judgesDiffer ? kindest : null,
    judgeCount: judges.length,
    walk: routeWalk(visited),
    durationMinutes: Number.isFinite(minutes) && minutes > 0 ? minutes : null,
    mine,
  };
}

export type ReportData = {
  group: Group;
  route: CrawlRouteWithStops;
  report: Report;
};

export async function loadReport(groupId: string, memberId: string | null): Promise<ReportData | null> {
  const group = await getGroup(groupId);
  if (!group?.route_id) return null;
  const [route, members, checkins] = await Promise.all([
    getRoute(group.route_id),
    getMembers(groupId),
    getCheckins(groupId),
  ]);
  if (!route) return null;
  return { group, route, report: buildReport(group, route, members, checkins, memberId) };
}

// "8,7" — one decimal with a Norwegian comma; whole numbers stay whole.
export function formatScore(value: number | null): string {
  if (value == null) return "–";
  const rounded = Math.round(value * 10) / 10;
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1).replace(".", ",");
}

// A group still named after its route has no name of its own.
export function reportTitle(group: Group, route: CrawlRouteWithStops): string {
  return group.name || route.name;
}

// "onsdag 7. oktober"
export function reportDate(group: Group): string {
  const date = new Date(group.completed_at ?? group.started_at ?? group.created_at);
  return date.toLocaleDateString("nb-NO", { weekday: "long", day: "numeric", month: "long" });
}
