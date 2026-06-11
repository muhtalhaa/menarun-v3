import { formatInTimeZone } from "date-fns-tz";
import { id as localeId } from "date-fns/locale";

const WIB_TIMEZONE = "Asia/Jakarta";

export function normalizePhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("62")) {
    return `0${digits.slice(2)}`;
  }
  if (digits.startsWith("8")) {
    return `0${digits}`;
  }
  return digits;
}

export function computePacePerKm(
  distanceKm: number,
  durationSec: number
): string | null {
  if (distanceKm <= 0 || durationSec <= 0) return null;

  const paceSecPerKm = durationSec / distanceKm;
  const minutes = Math.floor(paceSecPerKm / 60);
  const seconds = Math.round(paceSecPerKm % 60);

  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function formatDuration(durationSec: number): string {
  const hours = Math.floor(durationSec / 3600);
  const minutes = Math.floor((durationSec % 3600) / 60);
  const seconds = durationSec % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  }
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function formatDistance(distanceKm: number): string {
  return `${distanceKm.toFixed(2)} km`;
}

export function formatDateId(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return formatInTimeZone(d, WIB_TIMEZONE, "d MMMM yyyy", { locale: localeId });
}

export function formatDateTimeWib(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return formatInTimeZone(d, WIB_TIMEZONE, "d MMM yyyy, HH:mm", {
    locale: localeId,
  });
}

export function wibTodayDate(): Date {
  const today = formatInTimeZone(new Date(), WIB_TIMEZONE, "yyyy-MM-dd");
  return new Date(`${today}T00:00:00.000Z`);
}

export function formatNumberId(value: number): string {
  return new Intl.NumberFormat("id-ID").format(value);
}
