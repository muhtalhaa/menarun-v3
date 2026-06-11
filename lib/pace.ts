const PACE_PATTERN = /^(\d{1,2}):(\d{2})$/;

export function isValidPacePerKm(pace: string): boolean {
  const match = pace.trim().match(PACE_PATTERN);
  if (!match) return false;

  const minutes = parseInt(match[1], 10);
  const seconds = parseInt(match[2], 10);

  return minutes >= 0 && seconds >= 0 && seconds < 60 && !(minutes === 0 && seconds === 0);
}

export function pacePerKmToSeconds(pace: string): number {
  const match = pace.trim().match(PACE_PATTERN);
  if (!match) {
    throw new Error("Format pace tidak valid. Gunakan format M:SS, contoh: 5:30");
  }

  const minutes = parseInt(match[1], 10);
  const seconds = parseInt(match[2], 10);

  if (seconds >= 60) {
    throw new Error("Detik pace harus kurang dari 60.");
  }

  return minutes * 60 + seconds;
}

export function durationSecFromPaceAndDistance(
  pacePerKm: string,
  distanceKm: number
): number {
  const paceSec = pacePerKmToSeconds(pacePerKm);
  return Math.round(paceSec * distanceKm);
}
