import { z } from "zod";

export const reportActivitySchema = z.object({
  eventId: z.string().uuid("Event tidak valid"),
  reportedParticipantId: z.string().uuid("Peserta tidak valid"),
  token: z
    .string()
    .min(1, "Token wajib diisi")
    .max(12, "Token tidak valid"),
  detail: z
    .string()
    .min(10, "Detail laporan minimal 10 karakter")
    .max(2000, "Detail laporan maksimal 2000 karakter"),
});

export type ReportActivityInput = z.infer<typeof reportActivitySchema>;
