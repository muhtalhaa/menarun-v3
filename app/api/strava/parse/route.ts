import { NextResponse } from "next/server";
import {
  isActivityWithinEventPeriod,
  outsideEventPeriodMessage,
} from "@/lib/event-date-validation";
import {
  getClientIpFromHeaders,
  isParseRateLimited,
  recordParseAttempt,
} from "@/lib/parse-rate-limiter";
import { prisma } from "@/lib/prisma";
import { parseStravaUrl, StravaParseError } from "@/lib/strava-parser";
import { stravaParseRequestSchema } from "@/lib/validations/activity.schema";

export async function POST(request: Request) {
  const ip = getClientIpFromHeaders(request.headers);

  if (isParseRateLimited(ip)) {
    return NextResponse.json(
      {
        error: {
          code: "RATE_LIMIT_EXCEEDED",
          message: "Terlalu banyak permintaan. Coba lagi dalam 1 menit.",
        },
      },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      {
        error: {
          code: "VALIDATION_ERROR",
          message: "Format permintaan tidak valid.",
        },
      },
      { status: 400 }
    );
  }

  const parsed = stravaParseRequestSchema.safeParse(body);
  if (!parsed.success) {
    recordParseAttempt(ip);
    const firstError = parsed.error.errors[0]?.message ?? "Data tidak valid";
    return NextResponse.json(
      {
        error: {
          code: "VALIDATION_ERROR",
          message: firstError,
        },
      },
      { status: 400 }
    );
  }

  recordParseAttempt(ip);

  try {
    const data = await parseStravaUrl(parsed.data.stravaUrl);

    if (parsed.data.eventId) {
      const event = await prisma.event.findUnique({
        where: { id: parsed.data.eventId },
      });

      if (!event) {
        return NextResponse.json(
          {
            error: {
              code: "EVENT_INACTIVE",
              message: "Event tidak aktif atau tidak ditemukan.",
            },
          },
          { status: 422 }
        );
      }

      if (
        !isActivityWithinEventPeriod(
          data.activityDate,
          event.tanggalMulai,
          event.tanggalSelesai
        )
      ) {
        return NextResponse.json(
          {
            error: {
              code: "OUTSIDE_EVENT_PERIOD",
              message: outsideEventPeriodMessage(
                data.activityDate,
                event.tanggalMulai,
                event.tanggalSelesai
              ),
            },
          },
          { status: 422 }
        );
      }
    }

    return NextResponse.json({
      data: {
        distance_km: data.distanceKm,
        duration_sec: data.durationSec,
        duration_type: data.durationType,
        pace_per_km: data.pacePerKm,
        activity_date: data.activityDate,
        title: data.title,
        sport_type: data.sportType,
        strava_activity_id: data.stravaActivityId,
      },
    });
  } catch (error) {
    if (error instanceof StravaParseError) {
      return NextResponse.json(
        {
          error: {
            code: error.code,
            message: error.message,
          },
        },
        { status: 422 }
      );
    }

    return NextResponse.json(
      {
        error: {
          code: "PARSE_FAILED",
          message:
            "Tidak dapat membaca data aktivitas. Pastikan link publik dan valid.",
        },
      },
      { status: 422 }
    );
  }
}
