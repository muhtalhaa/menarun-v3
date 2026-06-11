import { z } from "zod";

export const adminLoginSchema = z.object({
  email: z.string().email("Format email tidak valid"),
  password: z.string().min(1, "Password wajib diisi"),
});

export type AdminLoginInput = z.infer<typeof adminLoginSchema>;
