import * as cheerio from "cheerio";
import { formatInTimeZone } from "date-fns-tz";
import { computePacePerKm } from "@/lib/format";
import type { StravaParseResult } from "@/types/activity.types";

const WIB_TIMEZONE = "Asia/Jakarta";
const FETCH_TIMEOUT_MS = 8000;
const MI_TO_KM = 1.60934;

export type StravaErrorCode =
  | "INVALID_URL"
  | "PARSE_FAILED"
  | "FUTURE_DATE";

export class StravaParseError extends Error {
  code: StravaErrorCode;

  constructor(code: StravaErrorCode, message: string) {
    super(message);
    this.code = code;
    this.name = "StravaParseError";
  }
}

export function extractActivityId(url: string): string | null {
  const match = url.match(/strava\.com\/activities\/(\d+)/i);
  return match?.[1] ?? null;
}

export function isValidStravaUrl(url: string): boolean {
  return url.includes("strava.com") || url.includes("strava.app.link");
}

function parseDistanceKm(text: string): number | null {
  const kmMatch = text.match(/(\d+(?:[.,]\d+)?)\s*(?:km|kilometer|kilometre)/i);
  if (kmMatch) {
    return parseFloat(kmMatch[1].replace(",", "."));
  }

  const miMatch = text.match(/(\d+(?:[.,]\d+)?)\s*(?:mi|mile)/i);
  if (miMatch) {
    return parseFloat(miMatch[1].replace(",", ".")) * MI_TO_KM;
  }

  return null;
}

function parseDurationSec(text: string): {
  durationSec: number;
  durationType: "moving" | "elapsed";
} | null {
  const lower = text.toLowerCase();

  const movingSection = extractLabeledSection(lower, [
    "moving time",
    "waktu bergerak",
  ]);
  const elapsedSection = extractLabeledSection(lower, [
    "elapsed time",
    "waktu berlalu",
  ]);

  const movingDuration = movingSection
    ? parseTimeString(movingSection)
    : null;
  if (movingDuration !== null) {
    return { durationSec: movingDuration, durationType: "moving" };
  }

  const elapsedDuration = elapsedSection
    ? parseTimeString(elapsedSection)
    : null;
  if (elapsedDuration !== null) {
    return { durationSec: elapsedDuration, durationType: "elapsed" };
  }

  const inlineDuration = parseTimeString(text);
  if (inlineDuration !== null) {
    return { durationSec: inlineDuration, durationType: "moving" };
  }

  return null;
}

function extractLabeledSection(text: string, labels: string[]): string | null {
  for (const label of labels) {
    const idx = text.indexOf(label);
    if (idx === -1) continue;

    const slice = text.slice(idx, idx + 80);
    const timeMatch = slice.match(
      /(\d{1,2}:\d{2}(?::\d{2})?|\d+\s*h\s*\d+\s*m(?:\s*\d+\s*s)?|\d+\s*m(?:\s*\d+\s*s)?)/i
    );
    if (timeMatch) return timeMatch[1];
  }
  return null;
}

function parseTimeString(raw: string): number | null {
  const hms = raw.match(/(\d{1,2}):(\d{2})(?::(\d{2}))?/);
  if (hms) {
    const hours = hms[3] !== undefined ? parseInt(hms[1], 10) : 0;
    const minutes = hms[3] !== undefined ? parseInt(hms[2], 10) : parseInt(hms[1], 10);
    const seconds = hms[3] !== undefined ? parseInt(hms[3], 10) : parseInt(hms[2], 10);
    return hours * 3600 + minutes * 60 + seconds;
  }

  const hm = raw.match(/(\d+)\s*h\s*(\d+)\s*m(?:\s*(\d+)\s*s)?/i);
  if (hm) {
    const hours = parseInt(hm[1], 10);
    const minutes = parseInt(hm[2], 10);
    const seconds = hm[3] ? parseInt(hm[3], 10) : 0;
    return hours * 3600 + minutes * 60 + seconds;
  }

  const ms = raw.match(/(\d+)\s*m(?:in(?:ute)?s?)?(?:\s*(\d+)\s*s(?:ec(?:ond)?s?)?)?/i);
  if (ms && !raw.toLowerCase().includes("km")) {
    const minutes = parseInt(ms[1], 10);
    const seconds = ms[2] ? parseInt(ms[2], 10) : 0;
    return minutes * 60 + seconds;
  }

  return null;
}

function parseSportType(text: string): string | null {
  const sports = ["Run", "Ride", "Swim", "Walk", "Hike", "Workout"];
  for (const sport of sports) {
    if (new RegExp(`\\b${sport}\\b`, "i").test(text)) {
      return sport;
    }
  }
  return null;
}

function parseActivityDate(
  description: string,
  publishedTime: string | null
): string | null {
  if (publishedTime) {
    const d = new Date(publishedTime);
    if (!isNaN(d.getTime())) {
      return formatInTimeZone(d, WIB_TIMEZONE, "yyyy-MM-dd");
    }
  }

  const longDate = description.match(
    /(?:on\s+)?(?:\w+day,?\s+)?(\w+\s+\d{1,2},?\s+\d{4})/i
  );
  if (longDate) {
    const d = new Date(longDate[1]);
    if (!isNaN(d.getTime())) {
      return formatInTimeZone(d, WIB_TIMEZONE, "yyyy-MM-dd");
    }
  }

  const shortDate = description.match(/(\d{1,2}\s+\w+\s+\d{4})/i);
  if (shortDate) {
    const d = new Date(shortDate[1]);
    if (!isNaN(d.getTime())) {
      return formatInTimeZone(d, WIB_TIMEZONE, "yyyy-MM-dd");
    }
  }

  return null;
}

function isFutureDateWib(dateStr: string): boolean {
  const todayWib = formatInTimeZone(new Date(), WIB_TIMEZONE, "yyyy-MM-dd");
  return dateStr > todayWib;
}

function collectOgMeta($: cheerio.CheerioAPI): Record<string, string> {
  const meta: Record<string, string> = {};

  $("meta[property^='og:'], meta[name^='twitter:'], meta[property^='article:']").each(
    (_, el) => {
      const property =
        $(el).attr("property") ?? $(el).attr("name") ?? "";
      const content = $(el).attr("content") ?? "";
      if (property && content) {
        meta[property] = content;
      }
    }
  );

  return meta;
}

export function parseStravaHtml(
  html: string,
  resolvedUrl: string
): StravaParseResult {
  const $ = cheerio.load(html);
  const rawMeta = collectOgMeta($);

  const title = rawMeta["og:title"] ?? null;
  const description = rawMeta["og:description"] ?? "";
  const publishedTime = rawMeta["article:published_time"] ?? null;

  const stravaActivityId = extractActivityId(resolvedUrl);

  const distanceKm = parseDistanceKm(description);
  const duration = parseDurationSec(description);
  const activityDate = parseActivityDate(description, publishedTime);
  const sportType = parseSportType(description);

  if (distanceKm === null || distanceKm <= 0) {
    throw new StravaParseError(
      "PARSE_FAILED",
      "Tidak dapat membaca data aktivitas. Pastikan link publik dan valid."
    );
  }

  if (!duration || duration.durationSec <= 0) {
    throw new StravaParseError(
      "PARSE_FAILED",
      "Tidak dapat membaca data aktivitas. Pastikan link publik dan valid."
    );
  }

  if (!activityDate) {
    throw new StravaParseError(
      "PARSE_FAILED",
      "Tidak dapat membaca data aktivitas. Pastikan link publik dan valid."
    );
  }

  if (isFutureDateWib(activityDate)) {
    throw new StravaParseError(
      "FUTURE_DATE",
      "Tanggal aktivitas tidak boleh di masa depan."
    );
  }

  if (distanceKm >= 200) {
    throw new StravaParseError(
      "PARSE_FAILED",
      "Tidak dapat membaca data aktivitas. Pastikan link publik dan valid."
    );
  }

  const pacePerKm = computePacePerKm(distanceKm, duration.durationSec);

  return {
    stravaActivityId,
    title,
    distanceKm: Math.round(distanceKm * 100) / 100,
    durationSec: duration.durationSec,
    durationType: duration.durationType,
    pacePerKm,
    activityDate,
    sportType,
    rawMeta,
  };
}

async function resolveStravaUrl(url: string): Promise<string> {
  if (extractActivityId(url)) {
    return url;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      method: "GET",
      redirect: "follow",
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; menaRun/3.0; +https://menarun.app)",
        Accept: "text/html",
      },
    });

    return response.url;
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchStravaHtml(url: string): Promise<{ html: string; finalUrl: string }> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      method: "GET",
      redirect: "follow",
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; menaRun/3.0; +https://menarun.app)",
        Accept: "text/html,application/xhtml+xml",
        "Accept-Language": "en-US,en;q=0.9",
      },
    });

    if (!response.ok) {
      throw new StravaParseError(
        "PARSE_FAILED",
        "Tidak dapat membaca data aktivitas. Pastikan link publik dan valid."
      );
    }

    const html = await response.text();
    return { html, finalUrl: response.url };
  } catch (error) {
    if (error instanceof StravaParseError) throw error;

    throw new StravaParseError(
      "PARSE_FAILED",
      "Tidak dapat membaca data aktivitas. Pastikan link publik dan valid."
    );
  } finally {
    clearTimeout(timeout);
  }
}

export async function parseStravaUrl(stravaUrl: string): Promise<StravaParseResult> {
  if (!isValidStravaUrl(stravaUrl)) {
    throw new StravaParseError(
      "INVALID_URL",
      "Link Strava tidak valid. Pastikan URL mengandung strava.com"
    );
  }

  let resolvedUrl = stravaUrl;
  try {
    resolvedUrl = await resolveStravaUrl(stravaUrl);
  } catch {
    if (!extractActivityId(stravaUrl)) {
      throw new StravaParseError(
        "PARSE_FAILED",
        "Tidak dapat membaca data aktivitas. Pastikan link publik dan valid."
      );
    }
  }

  const activityId = extractActivityId(resolvedUrl) ?? extractActivityId(stravaUrl);
  const fetchUrl = activityId
    ? `https://www.strava.com/activities/${activityId}`
    : resolvedUrl;

  const { html, finalUrl } = await fetchStravaHtml(fetchUrl);
  return parseStravaHtml(html, finalUrl);
}
