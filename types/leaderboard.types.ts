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
}

export interface LeaderboardData {
  event: EventSummary;
  entries: LeaderboardEntry[];
  totalParticipants: number;
  isEventCurrentlyActive: boolean;
}
