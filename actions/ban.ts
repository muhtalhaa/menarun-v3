"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin-auth";
import { type ActionResult } from "@/lib/errors";
import { prisma } from "@/lib/prisma";
import {
  banParticipantSchema,
  unbanParticipantSchema,
} from "@/lib/validations/activity.schema";

function parseDateInput(value: string): Date {
  return new Date(`${value}T00:00:00.000Z`);
}

export async function banParticipant(
  input: unknown
): Promise<ActionResult<{ id: string }>> {
  const auth = await requireAdmin();
  if (!auth.success) return auth;

  const parsed = banParticipantSchema.safeParse(input);
  if (!parsed.success) {
    const firstError = parsed.error.errors[0]?.message ?? "Data tidak valid";
    return {
      success: false,
      error: { code: "VALIDATION_ERROR", message: firstError },
    };
  }

  const { participantId, eventId, tanggalMulai, tanggalSelesai } = parsed.data;

  const [participant, event] = await Promise.all([
    prisma.participant.findUnique({ where: { id: participantId } }),
    prisma.event.findUnique({ where: { id: eventId } }),
  ]);

  if (!participant) {
    return {
      success: false,
      error: { code: "NOT_FOUND", message: "Peserta tidak ditemukan." },
    };
  }

  if (!event) {
    return {
      success: false,
      error: { code: "NOT_FOUND", message: "Event tidak ditemukan." },
    };
  }

  const ban = await prisma.participantBan.create({
    data: {
      participantId,
      eventId,
      tanggalMulai: parseDateInput(tanggalMulai),
      tanggalSelesai: parseDateInput(tanggalSelesai),
    },
  });

  revalidatePath("/admin/peserta");
  return { success: true, data: { id: ban.id } };
}

export async function unbanParticipant(
  input: unknown
): Promise<ActionResult<{ id: string }>> {
  const auth = await requireAdmin();
  if (!auth.success) return auth;

  const parsed = unbanParticipantSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: { code: "VALIDATION_ERROR", message: "Data tidak valid." },
    };
  }

  const existing = await prisma.participantBan.findUnique({
    where: { id: parsed.data.banId },
  });

  if (!existing) {
    return {
      success: false,
      error: { code: "NOT_FOUND", message: "Ban tidak ditemukan." },
    };
  }

  await prisma.participantBan.delete({ where: { id: parsed.data.banId } });

  revalidatePath("/admin/peserta");
  return { success: true, data: { id: parsed.data.banId } };
}
