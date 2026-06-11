"use server";

import { processActivitySubmission } from "@/lib/activity-submission";
import { prisma } from "@/lib/prisma";
import { type ActionResult } from "@/lib/errors";
import {
  DAILY_SUBMISSION_LIMIT,
  getDailySubmissionCount,
  isDailyLimitExceeded,
} from "@/lib/rate-limiter";
import { parseStravaUrl, StravaParseError } from "@/lib/strava-parser";
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

  const { token, stravaUrl, eventId } = parsed.data;
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

  let stravaData;
  try {
    stravaData = await parseStravaUrl(stravaUrl);
  } catch (error) {
    if (error instanceof StravaParseError) {
      const message =
        error.code === "PARSE_FAILED"
          ? "Link Strava tidak dapat dibaca. Pastikan link valid dan publik."
          : error.message;

      return {
        success: false,
        error: { code: error.code, message },
      };
    }
    return {
      success: false,
      error: {
        code: "PARSE_FAILED",
        message:
          "Link Strava tidak dapat dibaca. Pastikan link valid dan publik.",
      },
    };
  }

  return processActivitySubmission(
    participant,
    event,
    stravaUrl,
    stravaData
  );
}

export { DAILY_SUBMISSION_LIMIT };
