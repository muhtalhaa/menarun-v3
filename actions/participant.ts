"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin-auth";
import { duplicateAimsMessage, type ActionResult } from "@/lib/errors";
import { normalizePhone } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import {
  updateParticipantSchema,
  type UpdateParticipantInput,
} from "@/lib/validations/participant.schema";

function revalidateParticipantPaths() {
  revalidatePath("/admin/peserta");
  revalidatePath("/");
  revalidatePath("/leaderboard");
  revalidatePath("/input");
}

export async function updateParticipant(
  id: string,
  input: UpdateParticipantInput
): Promise<ActionResult<{ id: string }>> {
  const adminCheck = await requireAdmin();
  if (!adminCheck.success) return adminCheck;

  const normalizedInput = {
    ...input,
    noHp: normalizePhone(input.noHp),
  };

  const parsed = updateParticipantSchema.safeParse(normalizedInput);
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

  const existing = await prisma.participant.findUnique({ where: { id } });
  if (!existing) {
    return {
      success: false,
      error: {
        code: "NOT_FOUND",
        message: "Peserta tidak ditemukan.",
      },
    };
  }

  const data = parsed.data;

  const majlis = await prisma.majlis.findFirst({
    where: { nama: data.majlis, isActive: true },
  });

  if (!majlis && data.majlis !== existing.majlis) {
    return {
      success: false,
      error: {
        code: "INVALID_MAJLIS",
        message: "Majlis tidak valid. Pilih majlis dari daftar.",
      },
    };
  }

  if (data.noAims !== existing.noAims) {
    const duplicateAims = await prisma.participant.findUnique({
      where: { noAims: data.noAims },
    });

    if (duplicateAims) {
      return {
        success: false,
        error: {
          code: "DUPLICATE_AIMS",
          message: duplicateAimsMessage(data.noAims),
        },
      };
    }
  }

  try {
    await prisma.participant.update({
      where: { id },
      data: {
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
        message: "Terjadi kesalahan saat memperbarui peserta.",
      },
    };
  }

  revalidateParticipantPaths();

  return { success: true, data: { id } };
}

export async function deleteParticipant(
  id: string
): Promise<ActionResult<{ deleted: boolean }>> {
  const adminCheck = await requireAdmin();
  if (!adminCheck.success) return adminCheck;

  const existing = await prisma.participant.findUnique({
    where: { id },
    include: { _count: { select: { activities: true } } },
  });

  if (!existing) {
    return {
      success: false,
      error: {
        code: "NOT_FOUND",
        message: "Peserta tidak ditemukan.",
      },
    };
  }

  if (existing._count.activities > 0) {
    return {
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: `Peserta memiliki ${existing._count.activities} aktivitas. Hapus aktivitas terlebih dahulu sebelum menghapus akun.`,
      },
    };
  }

  await prisma.participant.delete({ where: { id } });

  revalidateParticipantPaths();

  return { success: true, data: { deleted: true } };
}
