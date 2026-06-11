import { customAlphabet } from "nanoid";
import { prisma } from "@/lib/prisma";

const ALPHABET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";
const generate = customAlphabet(ALPHABET, 8);

export async function generateUniqueToken(): Promise<string> {
  for (let i = 0; i < 5; i++) {
    const token = generate();
    const exists = await prisma.participant.findUnique({ where: { token } });
    if (!exists) return token;
  }
  throw new Error("Gagal membuat token unik");
}
