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
  elevationM: number;
  activityDate: string;
  submittedAt: string;
}

export interface SubmitActivityInput {
  eventId: string;
  token: string;
  stravaUrl: string;
  distanceKm: number;
  pacePerKm: string;
  elevationM: number;
}

export interface ActivitySubmitSummary {
  nama: string;
  distanceKm: number;
  pace: string;
  elevationM: number;
  sisaKuotaHariIni: number;
}

export interface ManualActivityInput {
  stravaUrl: string;
  distanceKm: number;
  pacePerKm: string;
  elevationM: number;
}
