import { useEffect, useState, type ReactNode } from "react";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Avatar from "../components/Avatar";
import {
  ActionBar,
  Band,
  Body,
  ErrorText,
  Fact,
  Footer,
  Heading,
  Kicker,
  LinkRow,
  StampButton,
} from "../components/ui";
import { formatDistance, formatMinutes } from "../lib/geo";
import {
  formatScore,
  loadReport,
  reportDate,
  reportTitle,
  type Judge,
  type ReportData,
  type Scores,
  type StopReport,
} from "../lib/report";
import { createPoster, POSTER_ASPECT, type Poster } from "../lib/reportPoster";
import { reportLink, sharePoster, shareReportLink } from "../lib/reportShare";
import { getMembership } from "../lib/storage";
import { colors, hardShadow } from "../lib/theme";

const CATEGORIES: { key: keyof Scores; label: string }[] = [
  { key: "beer", label: "Drikke" },
  { key: "atmosphere", label: "Stemning" },
  { key: "overall", label: "Overall" },
];

function scoreLine(scores: Scores): string {
  return CATEGORIES.map(({ key, label }) => `${label} ${formatScore(scores[key])}`).join(" · ");
}

function judges(count: number): string {
  return count === 1 ? "1 dommer" : `${count} dommere`;
}

// One line of the ranking: place, stop and the score it is ranked on.
function RankRow({ place, stop }: { place: number | null; stop: StopReport }) {
  return (
    <View className="flex-row items-center gap-3 border-t border-ink py-3">
      <Text className="w-6 font-mono text-[14px] text-ink-soft">{place ?? "–"}</Text>
      <View className="flex-1 gap-1">
        <Text className="font-display text-[20px] uppercase text-ink" numberOfLines={2}>
          {stop.venue.name}
        </Text>
        <Kicker tone="soft">
          {stop.score == null
            ? `Stopp ${stop.stopNumber} · ingen karakterer`
            : `Stopp ${stop.stopNumber} · ${judges(stop.raters)}`}
        </Kicker>
        {stop.score == null ? null : (
          <Text className="font-body text-[13px] text-ink">{scoreLine(stop)}</Text>
        )}
      </View>
      {stop.score == null ? null : (
        <Text
          className="font-display text-[28px] text-ink"
          accessibilityLabel={`${formatScore(stop.score)} av 10`}
        >
          {formatScore(stop.score)}
        </Text>
      )}
    </View>
  );
}

function Award({
  label,
  title,
  detail,
  left,
}: {
  label: string;
  title: string;
  detail: string;
  left?: ReactNode;
}) {
  return (
    <View className="flex-row items-center gap-3 border-[1.5px] border-ink bg-paper p-3">
      {left}
      <View className="flex-1 gap-1">
        <Kicker>{label}</Kicker>
        <Text className="font-display text-[22px] uppercase text-ink" numberOfLines={2}>
          {title}
        </Text>
        <Text className="font-body text-[13px] text-ink-soft">{detail}</Text>
      </View>
    </View>
  );
}

function JudgeAward({ label, judge }: { label: string; judge: Judge }) {
  return (
    <Award
      label={label}
      title={judge.member.name}
      detail={`Ga ${formatScore(judge.average)} i snitt`}
      left={
        <Avatar name={judge.member.name} avatar={judge.member.avatar} size={44} surface={colors.paper} />
      }
    />
  );
}

export default function ReportScreen() {
  const { groupId } = useLocalSearchParams<{ groupId: string }>();
  const insets = useSafeAreaInsets();

  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [poster, setPoster] = useState<Poster | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    if (!groupId) {
      setLoading(false);
      return;
    }
    getMembership(groupId)
      .catch(() => null)
      .then((memberId) => loadReport(groupId, memberId))
      .then(setData)
      .catch(() => setError("Klarte ikke å hente rapporten."))
      .finally(() => setLoading(false));
  }, [groupId]);

  // Drawn up front so the share sheet can open straight from the tap; browsers
  // refuse to share if too much happens between the tap and the call.
  useEffect(() => {
    if (!data) return;
    let uri: string | null = null;
    let stale = false;
    createPoster(data)
      .then((made) => {
        if (stale) {
          if (made) URL.revokeObjectURL(made.uri);
          return;
        }
        uri = made?.uri ?? null;
        setPoster(made);
      })
      .catch(() => {});
    return () => {
      stale = true;
      if (uri) URL.revokeObjectURL(uri);
    };
  }, [data]);

  const flash = (message: string) => {
    setNotice(message);
    setTimeout(() => setNotice(null), 2500);
  };

  if (loading || !data) {
    return (
      <View className="flex-1 bg-ink" style={{ paddingTop: insets.top }}>
        <StatusBar style="light" />
        <View className="flex-1 items-center justify-center gap-4 bg-cream px-[18px]">
          {loading ? (
            <ActivityIndicator color={colors.ink} />
          ) : (
            <ErrorText>{error ?? "Fant ikke rapporten."}</ErrorText>
          )}
        </View>
        <Footer>
          <ActionBar label="Til start" onPress={() => router.replace("/")} />
        </Footer>
      </View>
    );
  }

  const { group, route, report } = data;
  const title = reportTitle(group, route);
  const finished = group.status === "completed";
  const { best, worst } = report;
  const unrated = report.stops.filter((stop) => stop.score == null);
  const hasAwards =
    report.bestBeer || report.bestAtmosphere || report.dispute || worst || report.strictest;

  const handleSharePoster = async () => {
    if (!poster) return;
    const outcome = await sharePoster(poster, `kveldsrapport-${group.invite_code.toLowerCase()}.png`);
    if (outcome === "saved") flash("Plakaten er lastet ned");
    if (outcome === "failed") flash("Feil: klarte ikke å dele plakaten");
  };

  const handleShareLink = async () => {
    const winner = best ? ` ${best.venue.name} vant med ${formatScore(best.score)}.` : "";
    const outcome = await shareReportLink(group.id, `Kveldsrapport fra ${title}.${winner}`);
    if (outcome === "copied") flash("Lenken er kopiert");
    if (outcome === "failed") flash("Feil: klarte ikke å kopiere lenken");
  };

  return (
    <View className="flex-1 bg-ink" style={{ paddingTop: insets.top }}>
      <StatusBar style="light" />
      <ScrollView className="bg-cream" contentContainerStyle={{ flexGrow: 1 }}>
        <Band tone="ink" divider={false} className="gap-2 py-8">
          <Kicker tone="light">
            {finished ? "Kveldsrapport" : "Crawlen pågår"} · {reportDate(group)}
          </Kicker>
          {/* Long names step down a size so they wrap between words. */}
          <Heading size={title.length > 12 ? 32 : 40} tone="ochre">
            {title}
          </Heading>
          {group.name !== route.name ? <Kicker tone="light">{route.name}</Kicker> : null}
        </Band>

        <Band tone="sand" className="flex-row flex-wrap gap-x-6 gap-y-3 py-4">
          <Fact label="Stopp" value={String(report.stops.length)} />
          {report.walk.meters > 0 ? (
            <Fact label="Gange" value={formatDistance(report.walk.meters)} />
          ) : null}
          {report.durationMinutes ? (
            <Fact label="Varighet" value={formatMinutes(report.durationMinutes)} />
          ) : null}
          {report.judgeCount > 0 ? <Fact label="Dommere" value={String(report.judgeCount)} /> : null}
        </Band>

        {best ? (
          <Band className="gap-3 py-7">
            <Kicker>Kveldens vinner</Kicker>
            <View className="flex-row items-center gap-4">
              <View className="flex-1 gap-2">
                <Heading size={best.venue.name.length > 16 ? 30 : 38}>{best.venue.name}</Heading>
                <Kicker tone="soft">
                  Stopp {best.stopNumber} · {judges(best.raters)}
                </Kicker>
              </View>
              <View
                className="h-[84px] w-[84px] items-center justify-center border-[1.5px] border-ink bg-ochre"
                style={hardShadow}
                accessibilityLabel={`${formatScore(best.score)} av 10`}
              >
                <Text className="font-display text-[40px] text-ink">{formatScore(best.score)}</Text>
              </View>
            </View>
            <Body>{scoreLine(best)}</Body>
          </Band>
        ) : (
          <Band className="gap-2 py-7">
            <Kicker>Ingen karakterer</Kicker>
            <Heading size={26}>Ingen dømte i kveld</Heading>
            <Body>
              Gjengen var innom {report.stops.length} stopp, men ingen ga karakterer. Neste gang
              kåres en vinner.
            </Body>
          </Band>
        )}

        <Band tone="sand" className="py-7">
          <Kicker className="pb-3">{best ? "Karakterboka" : "Stoppene"}</Kicker>
          {report.ranked.map((stop, index) => (
            <RankRow key={stop.venue.id} place={index + 1} stop={stop} />
          ))}
          {unrated.map((stop) => (
            <RankRow key={stop.venue.id} place={null} stop={stop} />
          ))}
          <View className="border-t border-ink" />
        </Band>

        {hasAwards ? (
          <Band className="gap-3 py-7">
            <Kicker>Kåringer</Kicker>
            {report.bestBeer ? (
              <Award
                label="Beste drikke"
                title={report.bestBeer.venue.name}
                detail={`${formatScore(report.bestBeer.beer)} i snitt for det som ble bestilt`}
              />
            ) : null}
            {report.bestAtmosphere ? (
              <Award
                label="Beste stemning"
                title={report.bestAtmosphere.venue.name}
                detail={`${formatScore(report.bestAtmosphere.atmosphere)} i snitt`}
              />
            ) : null}
            {report.dispute ? (
              <Award
                label="Kveldens krangel"
                title={report.dispute.stop.venue.name}
                detail={`${report.dispute.high.member.name} ga ${formatScore(
                  report.dispute.high.value
                )}, ${report.dispute.low.member.name} ga ${formatScore(report.dispute.low.value)}`}
              />
            ) : null}
            {worst ? (
              <Award
                label="Bunnplassering"
                title={worst.venue.name}
                detail={`${formatScore(worst.score)} i snitt. Noen må komme sist.`}
              />
            ) : null}
            {report.strictest ? (
              <JudgeAward label="Strengeste dommer" judge={report.strictest} />
            ) : null}
            {report.kindest ? <JudgeAward label="Snilleste dommer" judge={report.kindest} /> : null}
          </Band>
        ) : null}

        {report.mine.length > 0 ? (
          <Band tone="sand" className="py-7">
            <Kicker>Dine karakterer</Kicker>
            <Text className="pb-3 pt-1 font-body text-[13px] text-ink-soft">
              Bare du ser denne delen. Gruppas snitt står i parentes.
            </Text>
            {report.mine.map(({ stop, mine }) => (
              <View key={stop.venue.id} className="gap-2 border-t border-ink py-3">
                <Text className="font-display text-[18px] uppercase text-ink" numberOfLines={1}>
                  {stop.venue.name}
                </Text>
                <View className="flex-row gap-4">
                  {CATEGORIES.map(({ key, label }) => (
                    <Fact
                      key={key}
                      grow
                      label={label}
                      value={mine[key] == null ? "–" : `${mine[key]} (${formatScore(stop[key])})`}
                    />
                  ))}
                </View>
              </View>
            ))}
            <View className="border-t border-ink" />
          </Band>
        ) : null}

        <Band tone={report.mine.length > 0 ? "cream" : "sand"} className="gap-4 py-7">
          <View className="gap-1">
            <Kicker>Del kvelden</Kicker>
            <Body>
              {poster
                ? "Plakaten kan lagres som bilde eller sendes videre. Lenken åpner hele rapporten."
                : "Lenken åpner hele rapporten for alle som får den."}
            </Body>
          </View>
          {poster ? (
            <View className="items-center gap-4">
              <View
                className="w-full border-[1.5px] border-ink"
                style={[hardShadow, { maxWidth: 280, aspectRatio: POSTER_ASPECT }]}
              >
                <Image
                  source={{ uri: poster.uri }}
                  contentFit="cover"
                  accessibilityLabel={`Plakat med kveldsrapporten fra ${title}`}
                  style={{ width: "100%", height: "100%" }}
                />
              </View>
              <StampButton label="Del plakat" onPress={handleSharePoster} />
            </View>
          ) : null}
          <LinkRow label={reportLink(group.id) ? "Del lenke til rapporten" : "Del rapporten"} onPress={handleShareLink} />
          <Text accessibilityLiveRegion="polite" className="min-h-[18px] font-body-bold text-[13px] text-ink">
            {notice ?? ""}
          </Text>
        </Band>
      </ScrollView>
      <Footer>
        <ActionBar label="Til start" onPress={() => router.replace("/")} />
      </Footer>
    </View>
  );
}
