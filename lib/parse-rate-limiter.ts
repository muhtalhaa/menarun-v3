const MAX_REQUESTS = 10;
const WINDOW_MS = 60 * 1000;

const attemptStore = new Map<string, number[]>();

export function getClientIpFromHeaders(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() ?? "unknown";
  }
  return headers.get("x-real-ip") ?? "unknown";
}

export function isParseRateLimited(ip: string): boolean {
  const now = Date.now();
  const attempts = (attemptStore.get(ip) ?? []).filter(
    (t) => now - t < WINDOW_MS
  );
  attemptStore.set(ip, attempts);
  return attempts.length >= MAX_REQUESTS;
}

export function recordParseAttempt(ip: string): void {
  const now = Date.now();
  const attempts = (attemptStore.get(ip) ?? []).filter(
    (t) => now - t < WINDOW_MS
  );
  attempts.push(now);
  attemptStore.set(ip, attempts);
}
