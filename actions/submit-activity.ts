"use server";

import { processActivitySubmission } from "@/lib/activity-submission";
import {
  buildBanMessage,
  getActiveBanForParticipantEvent,
} from "@/lib/ban";
import { prisma } from "@/lib/prisma";
import { type ActionResult } from "@/lib/errors";
import {
  DAILY_SUBMISSION_LIMIT,
  getDailySubmissionCount,
  isDailyLimitExceeded,
} from "@/lib/rate-limiter";
import { submitActivitySchema } from "@/lib/validations/activity.schema";
import type { ActivitySubmitSummary } from "@/types/activity.types";

export async function submitActivity(
  input: unknown
): Promise<ActionResult<ActivitySubmitSummary>> {
  const parsed = submitActivitySchema.safeParse(input);
  if (!parsed.success) {
    const firstError = parsed.error.errors[0]?.message ?? "Data tidak valid";
    return {
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: firstError,
        details: parsed.error.flatten().fieldErrors,
      },
    };
  }

  const { token, stravaUrl, eventId, distanceKm, pacePerKm, elevationM } =
    parsed.data;
  const normalizedToken = token.trim().toUpperCase();

  const participant = await prisma.participant.findUnique({
    where: { token: normalizedToken },
  });

  if (!participant) {
    return {
      success: false,
      error: {
        code: "INVALID_TOKEN",
        message: "Token tidak valid. Periksa kembali token Anda.",
      },
    };
  }

  const event = await prisma.event.findUnique({
    where: { id: eventId },
  });

  if (!event || !event.isActive) {
    return {
      success: false,
      error: {
        code: "EVENT_INACTIVE",
        message: "Event tidak aktif atau tidak ditemukan.",
      },
    };
  }

  const activeBan = await getActiveBanForParticipantEvent(
    participant.id,
    eventId
  );
  if (activeBan) {
    return {
      success: false,
      error: {
        code: "BANNED",
        message: buildBanMessage(activeBan),
      },
    };
  }

  const dailyCount = await getDailySubmissionCount(participant.id, eventId);
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

  return processActivitySubmission(participant, event, {
    stravaUrl,
    distanceKm,
    pacePerKm,
    elevationM,
  });
}

export { DAILY_SUBMISSION_LIMIT };
