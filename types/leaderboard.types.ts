import type { EventSummary } from "@/types/event.types";

export interface LeaderboardEntry {
  rank: number;
  participantId: string;
  nama: string;
  majlis: string;
  noAims: string;
  totalDistanceKm: number;
  activityCount: number;
  avgPacePerKm: string | null;
  totalElevationM: number;
}

export interface LeaderboardData {
  event: EventSummary;
  entries: LeaderboardEntry[];
  totalParticipants: number;
  totalDistanceKm: number;
  isEventCurrentlyActive: boolean;
}
