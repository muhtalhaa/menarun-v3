import { z } from "zod";
import { isValidPacePerKm } from "@/lib/pace";
import { isValidStravaUrl } from "@/lib/strava-url";

const stravaUrlField = z
  .string()
  .url("Format URL tidak valid")
  .refine(isValidStravaUrl, "URL harus link Strava");

const paceField = z
  .string()
  .min(1, "Pace wajib diisi")
  .refine(isValidPacePerKm, "Format pace tidak valid. Gunakan M:SS, contoh: 5:30");

const distanceField = z
  .number({ invalid_type_error: "Jarak harus berupa angka" })
  .min(0.01, "Jarak minimal 0.01 km")
  .max(200, "Jarak maksimal 200 km")
  .transform((v) => Math.round(v * 100) / 100);

const elevationField = z
  .number({ invalid_type_error: "Elevasi harus berupa angka" })
  .int("Elevasi harus bilangan bulat")
  .min(0, "Elevasi minimal 0 meter")
  .max(10000, "Elevasi maksimal 10000 meter");

export const submitActivitySchema = z.object({
  eventId: z.string().uuid("Event tidak valid"),
  token: z
    .string()
    .min(1, "Token wajib diisi")
    .max(12, "Token tidak valid"),
  stravaUrl: stravaUrlField,
  distanceKm: distanceField,
  pacePerKm: paceField,
  elevationM: elevationField,
});

export const adminUpdateActivitySchema = z.object({
  activityId: z.string().uuid("Aktivitas tidak valid"),
  stravaUrl: stravaUrlField,
  distanceKm: distanceField,
  pacePerKm: paceField,
  elevationM: elevationField,
});

export const banParticipantSchema = z
  .object({
    participantId: z.string().uuid("Peserta tidak valid"),
    eventId: z.string().uuid("Event tidak valid"),
    tanggalMulai: z.string().min(1, "Tanggal mulai wajib diisi"),
    tanggalSelesai: z.string().min(1, "Tanggal selesai wajib diisi"),
  })
  .refine(
    (data) => data.tanggalSelesai >= data.tanggalMulai,
    {
      message: "Tanggal selesai harus sama atau setelah tanggal mulai.",
      path: ["tanggalSelesai"],
    }
  );

export const unbanParticipantSchema = z.object({
  banId: z.string().uuid("Ban tidak valid"),
});

export type SubmitActivityInput = z.infer<typeof submitActivitySchema>;
export type AdminUpdateActivityInput = z.infer<typeof adminUpdateActivitySchema>;
