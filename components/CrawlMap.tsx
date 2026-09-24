import { useEffect, useMemo, useRef, useState } from "react";
import { Pressable, Text, View } from "react-native";
import MapView, { Marker, UrlTile } from "react-native-maps";
import type { Region } from "react-native-maps";
import type { Venue } from "../types/venue";

type StopStatus = "done" | "current" | "upcoming";

type MapVenue = {
  venue: Venue;
  status: StopStatus;
};

type CrawlMapProps = {
  venues: Venue[];
  currentIndex: number;
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

function Pin({ status, number, selected }: { status: StopStatus; number: number; selected: boolean }) {
  if (status === "done") {
    return (
      <View
        style={{
          width: 30,
          height: 30,
          borderRadius: 15,
          borderWidth: 3,
          borderColor: "#241d18",
          backgroundColor: "#241d18",
          alignItems: "center",
          justifyContent: "center",
          shadowColor: "#241d18",
          shadowOffset: { width: 2, height: 2 },
          shadowOpacity: 1,
          shadowRadius: 0,
          elevation: 2,
          opacity: selected ? 0.85 : 1,
        }}
      >
        <Text className="font-body-bold text-xs text-paper-raised">✓</Text>
      </View>
    );
  }

  if (status === "current") {
    return (
      <View
        style={{
          width: 40,
          height: 40,
          borderRadius: 20,
          borderWidth: 4,
          borderColor: "#d9a026",
          backgroundColor: "#8c2f24",
          alignItems: "center",
          justifyContent: "center",
          shadowColor: "#241d18",
          shadowOffset: { width: 2, height: 2 },
          shadowOpacity: 1,
          shadowRadius: 0,
          elevation: 3,
          opacity: selected ? 0.85 : 1,
        }}
      >
        <Text className="font-display text-base text-paper-raised">{number}</Text>
      </View>
    );
  }

  return (
    <View
      style={{
        width: 30,
        height: 30,
        borderRadius: 15,
        borderWidth: 3,
        borderStyle: "dashed",
        borderColor: "#241d18",
        backgroundColor: "#fff8ec",
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#241d18",
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 1,
        shadowRadius: 0,
        elevation: 2,
        opacity: selected ? 0.85 : 1,
      }}
    >
      <Text className="font-display text-xs text-ink">{number}</Text>
    </View>
  );
}

function Callout({ venue }: { venue: Venue }) {
  return (
    <View
      style={{
        maxWidth: 200,
        marginBottom: 8,
        borderWidth: 3,
        borderColor: "#241d18",
        backgroundColor: "#fff8ec",
        paddingHorizontal: 10,
        paddingVertical: 8,
        shadowColor: "#241d18",
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 1,
        shadowRadius: 0,
        elevation: 3,
      }}
    >
      <Text className="font-display text-sm uppercase text-ink" numberOfLines={1}>
        {venue.name}
      </Text>
      {venue.tagline ? (
        <Text className="pt-0.5 text-xs leading-4 text-ink-body" numberOfLines={2}>
          {venue.tagline}
        </Text>
      ) : null}
    </View>
  );
}

export default function CrawlMap({ venues, currentIndex }: CrawlMapProps) {
  const mapRef = useRef<MapView>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const mapVenues = useMemo<MapVenue[]>(
    () =>
      venues.map((venue, index) => ({
        venue,
        status: index < currentIndex ? "done" : index === currentIndex ? "current" : "upcoming",
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
          backgroundColor: "#e1d3ba",
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
