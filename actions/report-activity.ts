"use server";

import { type ActionResult } from "@/lib/errors";
import { prisma } from "@/lib/prisma";
import { reportActivitySchema } from "@/lib/validations/report.schema";

export async function reportParticipantActivity(
  input: unknown
): Promise<ActionResult<{ id: string }>> {
  const parsed = reportActivitySchema.safeParse(input);
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

  const { eventId, reportedParticipantId, token, detail } = parsed.data;
  const normalizedToken = token.trim().toUpperCase();

  const reporter = await prisma.participant.findUnique({
    where: { token: normalizedToken },
  });

  if (!reporter) {
    return {
      success: false,
      error: {
        code: "INVALID_TOKEN",
        message: "Token tidak valid. Periksa kembali token Anda.",
      },
    };
  }

  if (reporter.id === reportedParticipantId) {
    return {
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Anda tidak dapat melaporkan aktivitas diri sendiri.",
      },
    };
  }

  const [event, reportedParticipant, activityCount] = await Promise.all([
    prisma.event.findUnique({ where: { id: eventId } }),
    prisma.participant.findUnique({ where: { id: reportedParticipantId } }),
    prisma.activity.count({
      where: { eventId, participantId: reportedParticipantId },
    }),
  ]);

  if (!event || !reportedParticipant || activityCount === 0) {
    return {
      success: false,
      error: {
        code: "NOT_FOUND",
        message: "Data peserta atau event tidak ditemukan.",
      },
    };
  }

  const report = await prisma.activityReport.create({
    data: {
      eventId,
      reportedParticipantId,
      reporterParticipantId: reporter.id,
      detail: detail.trim(),
    },
  });

  return { success: true, data: { id: report.id } };
}
