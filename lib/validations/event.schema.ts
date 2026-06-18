import { z } from "zod";
import { isValidTimeHHmm } from "@/lib/submit-window";

const timeField = (label: string) =>
  z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, `Format ${label} tidak valid (gunakan HH:mm)`)
    .refine(isValidTimeHHmm, `Format ${label} tidak valid`);

export const eventSchema = z
  .object({
    nama: z
      .string()
      .min(3, "Nama event minimal 3 karakter")
      .max(150, "Nama event maksimal 150 karakter"),
    deskripsi: z
      .string()
      .min(10, "Deskripsi minimal 10 karakter")
      .max(2000, "Deskripsi maksimal 2000 karakter"),
    tanggalMulai: z.string().date("Format tanggal tidak valid"),
    tanggalSelesai: z.string().date("Format tanggal tidak valid"),
    jamMulaiSubmit: timeField("jam mulai submit"),
    jamBatasSubmit: timeField("jam batas submit"),
    isActive: z.boolean().default(true),
  })
  .refine((data) => new Date(data.tanggalSelesai) >= new Date(data.tanggalMulai), {
    message: "Tanggal selesai harus setelah tanggal mulai",
    path: ["tanggalSelesai"],
  })
  .refine(
    (data) => data.jamBatasSubmit > data.jamMulaiSubmit,
    {
      message: "Jam batas submit harus setelah jam mulai submit",
      path: ["jamBatasSubmit"],
    }
  );

export type EventInput = z.infer<typeof eventSchema>;
