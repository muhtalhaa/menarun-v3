import { getEventById } from "@/lib/events";
import { getLeaderboardEntries } from "@/lib/leaderboard";
import { prisma } from "@/lib/prisma";
import type { ParticipantEventDetail } from "@/types/participant-public.types";

export async function getParticipantEventDetail(
  eventId: string,
  participantId: string
): Promise<ParticipantEventDetail | null> {
  const [event, participant, activities] = await Promise.all([
    getEventById(eventId),
    prisma.participant.findUnique({
      where: { id: participantId },
      select: { id: true, nama: true, majlis: true },
    }),
    prisma.activity.findMany({
      where: { eventId, participantId },
      orderBy: [{ submittedAt: "desc" }],
      select: {
        id: true,
        distanceKm: true,
        pacePerKm: true,
        elevationM: true,
        stravaUrl: true,
        activityDate: true,
        submittedAt: true,
      },
    }),
  ]);

  if (!event || !participant || activities.length === 0) {
    return null;
  }

  const entries = await getLeaderboardEntries(eventId);
  const entry = entries.find((e) => e.participantId === participantId);

  const totalDistanceKm =
    entry?.totalDistanceKm ??
    Math.round(
      activities.reduce((sum, a) => sum + Number(a.distanceKm), 0) * 100
    ) / 100;

  return {
    participantId: participant.id,
    nama: participant.nama,
    majlis: participant.majlis,
    rank: entry?.rank ?? null,
    totalDistanceKm,
    activityCount: activities.length,
    event,
    activities: activities.map((activity) => ({
      id: activity.id,
      distanceKm: Number(activity.distanceKm),
      pacePerKm: activity.pacePerKm,
      elevationM: activity.elevationM,
      stravaUrl: activity.stravaUrl,
      activityDate: activity.activityDate.toISOString(),
      submittedAt: activity.submittedAt.toISOString(),
    })),
  };
}
