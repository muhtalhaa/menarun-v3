"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin-auth";
import { type ActionResult } from "@/lib/errors";
import { durationSecFromPaceAndDistance } from "@/lib/pace";
import { prisma } from "@/lib/prisma";
import { extractActivityId } from "@/lib/strava-url";
import { adminUpdateActivitySchema } from "@/lib/validations/activity.schema";

export async function updateActivity(
  input: unknown
): Promise<ActionResult<{ id: string }>> {
  const auth = await requireAdmin();
  if (!auth.success) return auth;

  const parsed = adminUpdateActivitySchema.safeParse(input);
  if (!parsed.success) {
    const firstError = parsed.error.errors[0]?.message ?? "Data tidak valid";
    return {
      success: false,
      error: { code: "VALIDATION_ERROR", message: firstError },
    };
  }

  const { activityId, stravaUrl, distanceKm, pacePerKm, elevationM } =
    parsed.data;

  const existing = await prisma.activity.findUnique({
    where: { id: activityId },
    select: { id: true, eventId: true },
  });

  if (!existing) {
    return {
      success: false,
      error: { code: "NOT_FOUND", message: "Aktivitas tidak ditemukan." },
    };
  }

  const stravaActivityId = extractActivityId(stravaUrl);
  const durationSec = durationSecFromPaceAndDistance(pacePerKm, distanceKm);

  try {
    await prisma.activity.update({
      where: { id: activityId },
      data: {
        stravaUrl,
        stravaActivityId,
        distanceKm,
        pacePerKm,
        elevationM,
        durationSec,
      },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return {
        success: false,
        error: {
          code: "DUPLICATE_ACTIVITY",
          message: "Link Strava ini sudah digunakan aktivitas lain.",
        },
      };
    }

    return {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "Gagal memperbarui aktivitas.",
      },
    };
  }

  revalidatePath(`/admin/event/${existing.eventId}/detail`);
  return { success: true, data: { id: activityId } };
}

export async function deleteActivity(
  activityId: string
): Promise<ActionResult<{ id: string }>> {
  const auth = await requireAdmin();
  if (!auth.success) return auth;

  const existing = await prisma.activity.findUnique({
    where: { id: activityId },
    select: { id: true, eventId: true },
  });

  if (!existing) {
    return {
      success: false,
      error: { code: "NOT_FOUND", message: "Aktivitas tidak ditemukan." },
    };
  }

  await prisma.activity.delete({ where: { id: activityId } });

  revalidatePath(`/admin/event/${existing.eventId}/detail`);
  return { success: true, data: { id: activityId } };
}
