"use server";

import { Prisma } from "@prisma/client";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { generateUniqueToken } from "@/lib/token-generator";
import { duplicateAimsMessage, type ActionResult } from "@/lib/errors";
import { normalizePhone } from "@/lib/format";
import {
  registrationSchema,
  type RegistrationInput,
} from "@/lib/validations/registration.schema";

export async function registerParticipant(
  input: RegistrationInput
): Promise<ActionResult<{ token: string }> | never> {
  const normalizedInput = {
    ...input,
    noHp: normalizePhone(input.noHp),
  };

  const parsed = registrationSchema.safeParse(normalizedInput);
  if (!parsed.success) {
    const firstError = parsed.error.errors[0]?.message ?? "Data tidak valid";
    return {
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: firstError,
        details: parsed.error.flatten().fieldErrors,
      },
    };
  }

  const data = parsed.data;

  const majlis = await prisma.majlis.findFirst({
    where: { nama: data.majlis, isActive: true },
  });

  if (!majlis) {
    return {
      success: false,
      error: {
        code: "INVALID_MAJLIS",
        message: "Majlis tidak valid. Pilih majlis dari daftar.",
      },
    };
  }

  const existingAims = await prisma.participant.findUnique({
    where: { noAims: data.noAims },
  });

  if (existingAims) {
    return {
      success: false,
      error: {
        code: "DUPLICATE_AIMS",
        message: duplicateAimsMessage(data.noAims),
      },
    };
  }

  const token = await generateUniqueToken();

  try {
    await prisma.participant.create({
      data: {
        token,
        nama: data.nama,
        noAims: data.noAims,
        majlis: data.majlis,
        email: data.email.toLowerCase(),
        usia: data.usia,
        noHp: data.noHp,
      },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      const target = (error.meta?.target as string[]) ?? [];
      if (target.includes("no_aims")) {
        return {
          success: false,
          error: {
            code: "DUPLICATE_AIMS",
            message: duplicateAimsMessage(data.noAims),
          },
        };
      }
    }
    return {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "Terjadi kesalahan saat registrasi. Silakan coba lagi.",
      },
    };
  }

  redirect(`/registrasi/sukses?token=${token}`);
}
