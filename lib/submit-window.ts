import { formatInTimeZone } from "date-fns-tz";

const WIB_TIMEZONE = "Asia/Jakarta";
const TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;

export function isValidTimeHHmm(value: string): boolean {
  return TIME_PATTERN.test(value);
}

export function parseTimeToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

export function getCurrentWibMinutes(now = new Date()): number {
  const time = formatInTimeZone(now, WIB_TIMEZONE, "HH:mm");
  return parseTimeToMinutes(time);
}

export function isWithinSubmitWindow(
  jamMulaiSubmit: string,
  jamBatasSubmit: string,
  now = new Date()
): boolean {
  const current = getCurrentWibMinutes(now);
  const start = parseTimeToMinutes(jamMulaiSubmit);
  const end = parseTimeToMinutes(jamBatasSubmit);

  return current >= start && current <= end;
}

export function formatTimeWib(time: string): string {
  return `${time} WIB`;
}

export function buildSubmitWindowLabel(
  jamMulaiSubmit: string,
  jamBatasSubmit: string
): string {
  return `${formatTimeWib(jamMulaiSubmit)} – ${formatTimeWib(jamBatasSubmit)}`;
}

export function buildOutsideSubmitWindowMessage(
  jamMulaiSubmit: string,
  jamBatasSubmit: string
): string {
  return `Submit aktivitas hanya dibuka pada jam ${buildSubmitWindowLabel(jamMulaiSubmit, jamBatasSubmit)}. Silakan coba lagi pada jam tersebut.`;
}

export type SubmitWindowStatus = "open" | "before" | "after";

export function getSubmitWindowStatus(
  jamMulaiSubmit: string,
  jamBatasSubmit: string,
  now = new Date()
): SubmitWindowStatus {
  const current = getCurrentWibMinutes(now);
  const start = parseTimeToMinutes(jamMulaiSubmit);
  const end = parseTimeToMinutes(jamBatasSubmit);

  if (current < start) return "before";
  if (current > end) return "after";
  return "open";
}

export function buildSubmitWindowStatusMessage(
  jamMulaiSubmit: string,
  jamBatasSubmit: string,
  now = new Date()
): string {
  const status = getSubmitWindowStatus(jamMulaiSubmit, jamBatasSubmit, now);

  if (status === "open") {
    return `Submit aktivitas sedang dibuka (jam ${buildSubmitWindowLabel(jamMulaiSubmit, jamBatasSubmit)}).`;
  }

  if (status === "before") {
    return `Submit aktivitas dibuka mulai jam ${formatTimeWib(jamMulaiSubmit)} (batas ${formatTimeWib(jamBatasSubmit)}).`;
  }

  return `Submit aktivitas untuk hari ini sudah ditutup (jam ${formatTimeWib(jamMulaiSubmit)} – ${formatTimeWib(jamBatasSubmit)}). Coba lagi besok.`;
}
