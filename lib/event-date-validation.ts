import { formatInTimeZone } from "date-fns-tz";
import { formatDateId } from "@/lib/format";

const WIB_TIMEZONE = "Asia/Jakarta";

export function isActivityWithinEventPeriod(
  activityDate: string,
  eventStart: Date,
  eventEnd: Date
): boolean {
  const start = formatInTimeZone(eventStart, WIB_TIMEZONE, "yyyy-MM-dd");
  const end = formatInTimeZone(eventEnd, WIB_TIMEZONE, "yyyy-MM-dd");

  return activityDate >= start && activityDate <= end;
}

export function outsideEventPeriodMessage(
  activityDate: string,
  eventStart: Date,
  eventEnd: Date
): string {
  return `Aktivitas tertanggal ${formatDateId(activityDate)} di luar periode event (${formatDateId(eventStart)} – ${formatDateId(eventEnd)}).`;
}
