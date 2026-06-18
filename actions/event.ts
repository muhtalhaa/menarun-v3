"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin-auth";
import { type ActionResult } from "@/lib/errors";
import { eventSchema, type EventInput } from "@/lib/validations/event.schema";
import { prisma } from "@/lib/prisma";

function revalidateAdminPaths() {
  revalidatePath("/admin");
  revalidatePath("/admin/event");
  revalidatePath("/");
  revalidatePath("/leaderboard");
  revalidatePath("/input");
}

export async function createEvent(
  input: EventInput
): Promise<ActionResult<{ id: string }>> {
  const adminCheck = await requireAdmin();
  if (!adminCheck.success) return adminCheck;

  const parsed = eventSchema.safeParse(input);
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

  const event = await prisma.event.create({
    data: {
      nama: data.nama,
      deskripsi: data.deskripsi,
      tanggalMulai: new Date(data.tanggalMulai),
      tanggalSelesai: new Date(data.tanggalSelesai),
      jamMulaiSubmit: data.jamMulaiSubmit,
      jamBatasSubmit: data.jamBatasSubmit,
      isActive: data.isActive,
    },
  });

  revalidateAdminPaths();

  return { success: true, data: { id: event.id } };
}

export async function updateEvent(
  id: string,
  input: EventInput
): Promise<ActionResult<{ id: string }>> {
  const adminCheck = await requireAdmin();
  if (!adminCheck.success) return adminCheck;

  const parsed = eventSchema.safeParse(input);
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

  const existing = await prisma.event.findUnique({ where: { id } });
  if (!existing) {
    return {
      success: false,
      error: {
        code: "NOT_FOUND",
        message: "Event tidak ditemukan.",
      },
    };
  }

  const data = parsed.data;

  await prisma.event.update({
    where: { id },
    data: {
      nama: data.nama,
      deskripsi: data.deskripsi,
      tanggalMulai: new Date(data.tanggalMulai),
      tanggalSelesai: new Date(data.tanggalSelesai),
      jamMulaiSubmit: data.jamMulaiSubmit,
      jamBatasSubmit: data.jamBatasSubmit,
      isActive: data.isActive,
    },
  });

  revalidateAdminPaths();

  return { success: true, data: { id } };
}

export async function deleteEvent(
  id: string
): Promise<ActionResult<{ softDeleted: boolean }>> {
  const adminCheck = await requireAdmin();
  if (!adminCheck.success) return adminCheck;

  const existing = await prisma.event.findUnique({ where: { id } });
  if (!existing) {
    return {
      success: false,
      error: {
        code: "NOT_FOUND",
        message: "Event tidak ditemukan.",
      },
    };
  }

  const activityCount = await prisma.activity.count({
    where: { eventId: id },
  });

  if (activityCount > 0) {
    await prisma.event.update({
      where: { id },
      data: { isActive: false },
    });

    revalidateAdminPaths();
    return { success: true, data: { softDeleted: true } };
  }

  await prisma.event.delete({ where: { id } });

  revalidateAdminPaths();
  return { success: true, data: { softDeleted: false } };
}

export async function toggleEventActive(
  id: string
): Promise<ActionResult<{ isActive: boolean }>> {
  const adminCheck = await requireAdmin();
  if (!adminCheck.success) return adminCheck;

  const existing = await prisma.event.findUnique({ where: { id } });
  if (!existing) {
    return {
      success: false,
      error: {
        code: "NOT_FOUND",
        message: "Event tidak ditemukan.",
      },
    };
  }

  const updated = await prisma.event.update({
    where: { id },
    data: { isActive: !existing.isActive },
  });

  revalidateAdminPaths();

  return { success: true, data: { isActive: updated.isActive } };
}
