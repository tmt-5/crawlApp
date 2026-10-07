import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { Pressable, Text, View } from "react-native";
import MapView, { Marker, Polyline, UrlTile } from "react-native-maps";
import type { Region } from "react-native-maps";
import { legPath } from "../lib/geo";
import { colors } from "../lib/theme";
import type { Venue } from "../types/venue";
import {
  legStatus,
  stopStatus,
  type CrawlMapProps,
  type LegStatus,
  type StopStatus,
} from "./CrawlMap.types";

// Native map. The web map (CrawlMap.web.tsx) is the primary one for now; this
// keeps the same props and draws stops and legs, without live positions.

type MapVenue = {
  venue: Venue;
  status: StopStatus;
};

const LEG_STYLE: Record<LegStatus, { strokeColor: string; lineDashPattern?: number[] }> = {
  walked: { strokeColor: "rgba(23,21,17,0.5)" },
  current: { strokeColor: "#E84B2C" },
  upcoming: { strokeColor: "#E84B2C", lineDashPattern: [2, 9] },
};

const OSLO_FALLBACK: Region = {
  latitude: 59.9139,
  longitude: 10.7522,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};
const MIN_DELTA = 0.008;
const FIT_PADDING = { top: 60, right: 40, bottom: 40, left: 40 };

function hasCoordinates(venue: Venue): venue is Venue & { latitude: number; longitude: number } {
  return typeof venue.latitude === "number" && typeof venue.longitude === "number";
}

// Same three states as the web pins: done has a check, current is larger with
// a thicker frame, upcoming is just a number.
function Pin({ status, number, selected }: { status: StopStatus; number: number; selected: boolean }) {
  const size = status === "current" ? 40 : 30;
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        borderWidth: status === "current" ? 3 : 2,
        borderColor: colors.ink,
        backgroundColor:
          status === "done" ? colors.ink : status === "current" ? colors.ochre : colors.paper,
        alignItems: "center",
        justifyContent: "center",
        opacity: selected ? 0.85 : 1,
      }}
    >
      <Text
        className={`font-display ${status === "current" ? "text-[22px]" : "text-[15px]"} ${
          status === "done" ? "text-paper" : "text-ink"
        }`}
      >
        {status === "done" ? "✓" : number}
      </Text>
    </View>
  );
}

function Callout({ venue }: { venue: Venue }) {
  return (
    <View
      style={{
        maxWidth: 200,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: colors.ink,
        backgroundColor: colors.paper,
        paddingHorizontal: 10,
        paddingVertical: 8,
      }}
    >
      <Text className="font-display text-sm uppercase text-ink" numberOfLines={1}>
        {venue.name}
      </Text>
      {venue.tagline ? (
        <Text className="pt-0.5 text-xs leading-4 text-ink-soft" numberOfLines={2}>
          {venue.tagline}
        </Text>
      ) : null}
    </View>
  );
}

export default function CrawlMap({ stops, currentIndex }: CrawlMapProps) {
  const venues = useMemo(() => stops.map((stop) => stop.venue), [stops]);
  const mapRef = useRef<MapView>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const mapVenues = useMemo<MapVenue[]>(
    () =>
      venues.map((venue, index) => ({
        venue,
        status: stopStatus(index, currentIndex),
      })),
    [venues, currentIndex]
  );

  const located = useMemo(() => mapVenues.filter((v) => hasCoordinates(v.venue)), [mapVenues]);

  const initialRegion = useMemo<Region>(() => {
    if (located.length === 0) return OSLO_FALLBACK;
    const lngs = located.map((v) => v.venue.longitude as number);
    const lats = located.map((v) => v.venue.latitude as number);
    const west = Math.min(...lngs);
    const east = Math.max(...lngs);
    const south = Math.min(...lats);
    const north = Math.max(...lats);
    return {
      latitude: (north + south) / 2,
      longitude: (east + west) / 2,
      latitudeDelta: Math.max(north - south, MIN_DELTA) * 1.6,
      longitudeDelta: Math.max(east - west, MIN_DELTA) * 1.6,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (located.length === 0) return;
    mapRef.current?.fitToCoordinates(
      located.map((v) => ({
        latitude: v.venue.latitude as number,
        longitude: v.venue.longitude as number,
      })),
      { edgePadding: FIT_PADDING, animated: true }
    );
  }, [located]);

  return (
    <View style={{ flex: 1 }}>
      <MapView
        ref={mapRef}
        style={{ flex: 1 }}
        mapType="none"
        initialRegion={initialRegion}
        onPress={() => setSelectedId(null)}
      >
        <UrlTile
          urlTemplate="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          maximumZ={19}
          shouldReplaceMapContent
        />
        {stops.map((_, index) => {
          const path = legPath(stops, index);
          if (!path) return null;
          const coordinates = path.map(([longitude, latitude]) => ({ latitude, longitude }));
          return (
            <Fragment key={`leg-${index}`}>
              <Polyline
                coordinates={coordinates}
                strokeColor="rgba(36,29,24,0.18)"
                strokeWidth={9}
                lineCap="round"
              />
              <Polyline
                coordinates={coordinates}
                strokeWidth={5}
                lineCap="round"
                {...LEG_STYLE[legStatus(index, currentIndex)]}
              />
            </Fragment>
          );
        })}
        {located.map(({ venue, status }, index) => (
          <Marker
            key={venue.id}
            coordinate={{ latitude: venue.latitude as number, longitude: venue.longitude as number }}
            anchor={{ x: 0.5, y: 1 }}
            onPress={() => setSelectedId((prev) => (prev === venue.id ? null : venue.id))}
          >
            <View style={{ alignItems: "center" }}>
              {selectedId === venue.id ? <Callout venue={venue} /> : null}
              <Pressable hitSlop={8}>
                <Pin status={status} number={index + 1} selected={selectedId === venue.id} />
              </Pressable>
            </View>
          </Marker>
        ))}
      </MapView>

      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "#DED0AE",
          opacity: 0.16,
        }}
      />

      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          bottom: 4,
          right: 4,
          backgroundColor: "rgba(244,236,224,0.75)",
        }}
      >
        <Text style={{ fontSize: 9, paddingHorizontal: 4 }} className="text-ink">
          © OpenStreetMap contributors
        </Text>
      </View>
    </View>
  );
}
