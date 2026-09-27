import { useEffect, useRef, useState } from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { metersBetween } from "./geo";
import { watchPosition, type LocationError, type Position } from "./location";
import { supabase } from "./supabase";

// Live positions are shared with Supabase Realtime Presence: nothing is
// stored, a position disappears when its owner stops sharing or closes the page.

const MIN_MOVE_METERS = 10;
const MAX_SILENCE_MS = 30_000;

export type SharedPosition = Position & { memberId: string };

// This device's position while `enabled`, updated only when it has moved a
// little or gone quiet for a while, so the group channel isn't flooded.
export function useDeviceLocation(enabled: boolean): {
  position: Position | null;
  error: LocationError | null;
} {
  const [position, setPosition] = useState<Position | null>(null);
  const [error, setError] = useState<LocationError | null>(null);
  const last = useRef<{ position: Position; at: number } | null>(null);

  useEffect(() => {
    if (!enabled) {
      setPosition(null);
      setError(null);
      last.current = null;
      return;
    }
    return watchPosition(
      (next) => {
        const previous = last.current;
        const moved = previous ? (metersBetween(previous.position, next) ?? Infinity) : Infinity;
        if (previous && moved < MIN_MOVE_METERS && Date.now() - previous.at < MAX_SILENCE_MS) {
          return;
        }
        last.current = { position: next, at: Date.now() };
        setPosition(next);
        setError(null);
      },
      setError
    );
  }, [enabled]);

  return { position, error };
}

// Everyone in the group who is sharing, including this member once their own
// position has gone through the channel.
export function useGroupPositions(
  groupId: string | undefined,
  memberId: string | null,
  position: Position | null
): SharedPosition[] {
  const [positions, setPositions] = useState<SharedPosition[]>([]);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const subscribed = useRef(false);
  const latest = useRef(position);
  latest.current = position;

  useEffect(() => {
    if (!groupId || !memberId) return;

    const channel = supabase.channel(`group-positions:${groupId}`, {
      config: { presence: { key: memberId } },
    });
    channel.on("presence", { event: "sync" }, () => {
      const state = channel.presenceState<Position>();
      setPositions(
        Object.entries(state).flatMap(([key, metas]) => {
          const meta = metas[metas.length - 1];
          return meta && typeof meta.latitude === "number" && typeof meta.longitude === "number"
            ? [{ memberId: key, latitude: meta.latitude, longitude: meta.longitude }]
            : [];
        })
      );
    });
    channel.subscribe((status) => {
      if (status !== "SUBSCRIBED") return;
      subscribed.current = true;
      if (latest.current) channel.track(latest.current);
    });
    channelRef.current = channel;

    return () => {
      subscribed.current = false;
      channelRef.current = null;
      supabase.removeChannel(channel);
    };
  }, [groupId, memberId]);

  useEffect(() => {
    const channel = channelRef.current;
    if (!channel || !subscribed.current) return;
    if (position) {
      channel.track(position);
    } else {
      channel.untrack();
    }
  }, [position]);

  return positions;
}
