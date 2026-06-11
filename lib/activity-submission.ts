import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { type ActionResult } from "@/lib/errors";
import {
  isActivityWithinEventPeriod,
  outsideEventPeriodMessage,
} from "@/lib/event-date-validation";
import { formatDuration } from "@/lib/format";
import {
  getRemainingDailyQuota,
  isDailyLimitExceeded,
  getDailySubmissionCount,
} from "@/lib/rate-limiter";
import type {
  ActivitySubmitSummary,
  StravaParseResult,
} from "@/types/activity.types";

interface SubmissionParticipant {
  id: string;
  nama: string;
}

interface SubmissionEvent {
  id: string;
  tanggalMulai: Date;
  tanggalSelesai: Date;
}

export async function processActivitySubmission(
  participant: SubmissionParticipant,
  event: SubmissionEvent,
  stravaUrl: string,
  stravaData: StravaParseResult
): Promise<ActionResult<ActivitySubmitSummary>> {
  const dailyCount = await getDailySubmissionCount(participant.id);
  if (isDailyLimitExceeded(dailyCount)) {
    return {
      success: false,
      error: {
        code: "RATE_LIMIT_EXCEEDED",
        message:
          "Token ini sudah mencapai batas 2 aktivitas hari ini. Coba lagi besok.",
      },
    };
  }

  if (
    !isActivityWithinEventPeriod(
      stravaData.activityDate,
      event.tanggalMulai,
      event.tanggalSelesai
    )
  ) {
    return {
      success: false,
      error: {
        code: "OUTSIDE_EVENT_PERIOD",
        message: outsideEventPeriodMessage(
          stravaData.activityDate,
          event.tanggalMulai,
          event.tanggalSelesai
        ),
      },
    };
  }

  const activityDate = new Date(stravaData.activityDate);

  if (stravaData.stravaActivityId) {
    const duplicate = await prisma.activity.findFirst({
      where: { stravaActivityId: stravaData.stravaActivityId },
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

  try {
    await prisma.activity.create({
      data: {
        participantId: participant.id,
        eventId: event.id,
        stravaUrl,
        stravaActivityId: stravaData.stravaActivityId,
        distanceKm: stravaData.distanceKm,
        durationSec: stravaData.durationSec,
        durationType: stravaData.durationType,
        pacePerKm: stravaData.pacePerKm,
        activityDate,
        rawMeta: stravaData.rawMeta,
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

  const sisaKuotaHariIni = await getRemainingDailyQuota(participant.id);

  return {
    success: true,
    data: {
      nama: participant.nama,
      distanceKm: stravaData.distanceKm,
      duration: formatDuration(stravaData.durationSec),
      pace: stravaData.pacePerKm,
      sisaKuotaHariIni,
    },
  };
}
