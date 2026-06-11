import { addDays, startOfDay } from "date-fns";
import { fromZonedTime, toZonedTime } from "date-fns-tz";
import { prisma } from "@/lib/prisma";

export const DAILY_SUBMISSION_LIMIT = 2;
const WIB_TIMEZONE = "Asia/Jakarta";

export function getWibDayBounds(now = new Date()) {
  const zonedNow = toZonedTime(now, WIB_TIMEZONE);
  const startWib = startOfDay(zonedNow);
  const endWib = addDays(startWib, 1);

  return {
    start: fromZonedTime(startWib, WIB_TIMEZONE),
    end: fromZonedTime(endWib, WIB_TIMEZONE),
  };
}

export async function getDailySubmissionCount(
  participantId: string,
  now = new Date()
): Promise<number> {
  const { start, end } = getWibDayBounds(now);

  return prisma.activity.count({
    where: {
      participantId,
      submittedAt: {
        gte: start,
        lt: end,
      },
    },
  });
}

export async function getRemainingDailyQuota(
  participantId: string,
  now = new Date()
): Promise<number> {
  const count = await getDailySubmissionCount(participantId, now);
  return Math.max(0, DAILY_SUBMISSION_LIMIT - count);
}

export function isDailyLimitExceeded(count: number): boolean {
  return count >= DAILY_SUBMISSION_LIMIT;
}
