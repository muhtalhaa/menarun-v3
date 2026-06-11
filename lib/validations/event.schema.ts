import { z } from "zod";

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
    isActive: z.boolean().default(true),
  })
  .refine((data) => new Date(data.tanggalSelesai) >= new Date(data.tanggalMulai), {
    message: "Tanggal selesai harus setelah tanggal mulai",
    path: ["tanggalSelesai"],
  });

export type EventInput = z.infer<typeof eventSchema>;
