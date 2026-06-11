import { computePacePerKm } from "@/lib/format";
import {
  getCurrentEvent,
  getEventById,
  isEventInActivePeriod,
} from "@/lib/events";
import { prisma } from "@/lib/prisma";
import type { LeaderboardData, LeaderboardEntry } from "@/types/leaderboard.types";

interface LeaderboardRow {
  participant_id: string;
  nama: string;
  majlis: string;
  no_aims: string;
  total_distance: number;
  activity_count: number;
  first_submission: Date;
  avg_pace_sec: number | null;
}

export async function getLeaderboardEntries(
  eventId: string
): Promise<LeaderboardEntry[]> {
  const rows = await prisma.$queryRaw<LeaderboardRow[]>`
    SELECT
      p.id AS participant_id,
      p.nama,
      p.majlis,
      p.no_aims,
      SUM(a.distance_km)::float AS total_distance,
      COUNT(a.id)::int AS activity_count,
      MIN(a.submitted_at) AS first_submission,
      AVG(a.duration_sec / NULLIF(a.distance_km::float, 0)) AS avg_pace_sec
    FROM activities a
    INNER JOIN participants p ON a.participant_id = p.id
    WHERE a.event_id = ${eventId}
    GROUP BY p.id, p.nama, p.majlis, p.no_aims
    ORDER BY
      total_distance DESC,
      activity_count DESC,
      first_submission ASC
  `;

  return rows.map((row, index) => ({
    rank: index + 1,
    participantId: row.participant_id,
    nama: row.nama,
    majlis: row.majlis,
    noAims: row.no_aims,
    totalDistanceKm: Math.round(row.total_distance * 100) / 100,
    activityCount: row.activity_count,
    avgPacePerKm:
      row.avg_pace_sec && row.avg_pace_sec > 0
        ? computePacePerKm(1, Math.round(row.avg_pace_sec))
        : null,
  }));
}

export async function getLeaderboardData(
  eventId?: string
): Promise<LeaderboardData | null> {
  let event;
  let isEventCurrentlyActive = false;

  if (eventId) {
    event = await getEventById(eventId);
    if (!event) return null;
    isEventCurrentlyActive = isEventInActivePeriod(event);
  } else {
    const current = await getCurrentEvent();
    if (!current.event) return null;
    event = current.event;
    isEventCurrentlyActive = current.isCurrentlyActive;
  }

  const entries = await getLeaderboardEntries(event.id);

  return {
    event,
    entries,
    totalParticipants: entries.length,
    isEventCurrentlyActive,
  };
}

export async function resolveLeaderboardEventId(
  requestedEventId?: string
): Promise<string | null> {
  if (requestedEventId) {
    const event = await getEventById(requestedEventId);
    return event?.id ?? null;
  }

  const { event } = await getCurrentEvent();
  return event?.id ?? null;
}
