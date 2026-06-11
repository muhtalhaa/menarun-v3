export interface Activity {
  id: string;
  participantId: string;
  eventId: string;
  stravaUrl: string;
  stravaActivityId: string | null;
  distanceKm: number;
  durationSec: number;
  durationType: "moving" | "elapsed";
  pacePerKm: string | null;
  activityDate: string;
  submittedAt: string;
}

export interface SubmitActivityInput {
  token: string;
  stravaUrl: string;
  eventId: string;
}

export interface StravaParseResult {
  stravaActivityId: string | null;
  title: string | null;
  distanceKm: number;
  durationSec: number;
  durationType: "moving" | "elapsed";
  pacePerKm: string | null;
  activityDate: string;
  sportType: string | null;
  rawMeta: Record<string, string>;
}

export interface ActivitySubmitSummary {
  nama: string;
  distanceKm: number;
  duration: string;
  pace: string | null;
  sisaKuotaHariIni: number;
}
