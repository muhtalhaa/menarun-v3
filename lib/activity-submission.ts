import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { type ActionResult } from "@/lib/errors";
import { wibTodayDate } from "@/lib/format";
import { durationSecFromPaceAndDistance } from "@/lib/pace";
import {
  getRemainingDailyQuota,
  isDailyLimitExceeded,
  getDailySubmissionCount,
} from "@/lib/rate-limiter";
import { extractActivityId } from "@/lib/strava-url";
import type {
  ActivitySubmitSummary,
  ManualActivityInput,
} from "@/types/activity.types";

interface SubmissionParticipant {
  id: string;
  nama: string;
}

interface SubmissionEvent {
  id: string;
}

export async function processActivitySubmission(
  participant: SubmissionParticipant,
  event: SubmissionEvent,
  input: ManualActivityInput
): Promise<ActionResult<ActivitySubmitSummary>> {
  const dailyCount = await getDailySubmissionCount(
    participant.id,
    event.id
  );
  if (isDailyLimitExceeded(dailyCount)) {
    return {
      success: false,
      error: {
        code: "RATE_LIMIT_EXCEEDED",
        message:
          "Token ini sudah mencapai batas 2 aktivitas hari ini untuk event ini. Coba lagi besok.",
      },
    };
  }

  const stravaActivityId = extractActivityId(input.stravaUrl);

  if (stravaActivityId) {
    const duplicate = await prisma.activity.findFirst({
      where: { stravaActivityId },
    });

    if (duplicate) {
      return {
        success: false,
        error: {
          code: "DUPLICATE_ACTIVITY",
          message: "Aktivitas Strava ini sudah pernah disubmit.",
        },
      };
    }
  }

  const durationSec = durationSecFromPaceAndDistance(
    input.pacePerKm,
    input.distanceKm
  );

  try {
    await prisma.activity.create({
      data: {
        participantId: participant.id,
        eventId: event.id,
        stravaUrl: input.stravaUrl,
        stravaActivityId,
        distanceKm: input.distanceKm,
        durationSec,
        durationType: "moving",
        pacePerKm: input.pacePerKm,
        elevationM: input.elevationM,
        activityDate: wibTodayDate(),
      },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return {
        success: false,
        error: {
          code: "DUPLICATE_ACTIVITY",
          message: "Aktivitas Strava ini sudah pernah disubmit.",
        },
      };
    }

    return {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "Terjadi kesalahan saat menyimpan aktivitas. Silakan coba lagi.",
      },
    };
  }

  const sisaKuotaHariIni = await getRemainingDailyQuota(
    participant.id,
    event.id
  );

  return {
    success: true,
    data: {
      nama: participant.nama,
      distanceKm: input.distanceKm,
      pace: input.pacePerKm,
      elevationM: input.elevationM,
      sisaKuotaHariIni,
    },
  };
}
