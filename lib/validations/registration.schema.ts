import { z } from "zod";

export const registrationSchema = z.object({
  nama: z
    .string()
    .min(2, "Nama minimal 2 karakter")
    .max(100, "Nama maksimal 100 karakter")
    .regex(/^[a-zA-Z\s.'-]+$/, "Nama hanya boleh huruf dan spasi"),
  noAims: z
    .string()
    .length(5, "No. AIMS harus 5 digit")
    .regex(/^\d{5}$/, "No. AIMS harus berupa 5 digit angka"),
  majlis: z.string().min(1, "Majlis wajib dipilih"),
  email: z.string().email("Format email tidak valid"),
  usia: z
    .number({ invalid_type_error: "Usia harus angka" })
    .int("Usia harus bilangan bulat")
    .min(10, "Usia minimal 10 tahun")
    .max(99, "Usia maksimal 99 tahun"),
  noHp: z.string().regex(/^08\d{8,11}$/, "Format: 08xxxxxxxxxx"),
});

export const tokenRecoverySchema = z.object({
  noAims: z
    .string()
    .length(5, "No. AIMS harus 5 digit")
    .regex(/^\d{5}$/, "No. AIMS harus berupa 5 digit angka"),
  email: z.string().email("Format email tidak valid"),
});

export type RegistrationInput = z.infer<typeof registrationSchema>;
export type TokenRecoveryInput = z.infer<typeof tokenRecoverySchema>;
