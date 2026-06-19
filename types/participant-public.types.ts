import type { EventSummary } from "@/types/event.types";

export interface PublicActivityRow {
  id: string;
  distanceKm: number;
  pacePerKm: string | null;
  elevationM: number;
  stravaUrl: string;
  activityDate: string;
  submittedAt: string;
}

export interface ParticipantEventDetail {
  participantId: string;
  nama: string;
  majlis: string;
  rank: number | null;
  totalDistanceKm: number;
  activityCount: number;
  event: EventSummary;
  activities: PublicActivityRow[];
}
