import { z } from "zod";

export const submitActivitySchema = z.object({
  token: z
    .string()
    .min(1, "Token wajib diisi")
    .max(12, "Token tidak valid"),
  stravaUrl: z
    .string()
    .url("Format URL tidak valid")
    .refine(
      (url) => url.includes("strava.com") || url.includes("strava.app.link"),
      "URL harus link Strava"
    ),
  eventId: z.string().uuid("Event tidak valid"),
});

export const stravaParseRequestSchema = z.object({
  stravaUrl: z
    .string()
    .url("Format URL tidak valid")
    .refine(
      (url) => url.includes("strava.com") || url.includes("strava.app.link"),
      "URL harus link Strava"
    ),
  eventId: z.string().uuid("Event tidak valid").optional(),
});

export type SubmitActivityInput = z.infer<typeof submitActivitySchema>;
