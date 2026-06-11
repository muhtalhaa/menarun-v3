export function extractActivityId(url: string): string | null {
  const match = url.match(/strava\.com\/activities\/(\d+)/i);
  return match?.[1] ?? null;
}

export function isValidStravaUrl(url: string): boolean {
  return url.includes("strava.com") || url.includes("strava.app.link");
}
