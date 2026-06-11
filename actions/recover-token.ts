"use server";

import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { type ActionResult } from "@/lib/errors";
import {
  tokenRecoverySchema,
  type TokenRecoveryInput,
} from "@/lib/validations/registration.schema";

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 60 * 60 * 1000;

const attemptStore = new Map<string, number[]>();

function getClientIp(headerStore: Headers): string {
  const forwarded = headerStore.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() ?? "unknown";
  }
  return headerStore.get("x-real-ip") ?? "unknown";
}

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const attempts = (attemptStore.get(ip) ?? []).filter(
    (t) => now - t < WINDOW_MS
  );
  attemptStore.set(ip, attempts);
  return attempts.length >= MAX_ATTEMPTS;
}

function recordAttempt(ip: string): void {
  const now = Date.now();
  const attempts = (attemptStore.get(ip) ?? []).filter(
    (t) => now - t < WINDOW_MS
  );
  attempts.push(now);
  attemptStore.set(ip, attempts);
}

async function resolveClientIp(): Promise<string> {
  try {
    const headerStore = await headers();
    return getClientIp(headerStore);
  } catch {
    return "unknown";
  }
}

export async function recoverToken(
  input: TokenRecoveryInput
): Promise<ActionResult<{ token: string }>> {
  const ip = await resolveClientIp();

  if (isRateLimited(ip)) {
    return {
      success: false,
      error: {
        code: "RATE_LIMIT_EXCEEDED",
        message:
          "Terlalu banyak percobaan. Silakan coba lagi dalam 1 jam.",
      },
    };
  }

  const parsed = tokenRecoverySchema.safeParse(input);
  if (!parsed.success) {
    recordAttempt(ip);
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

  const { noAims, email } = parsed.data;

  const participant = await prisma.participant.findFirst({
    where: {
      noAims,
      email: email.toLowerCase(),
    },
  });

  if (!participant) {
    recordAttempt(ip);
    return {
      success: false,
      error: {
        code: "TOKEN_NOT_FOUND",
        message:
          "No. AIMS dan email tidak cocok. Periksa kembali data Anda.",
      },
    };
  }

  return {
    success: true,
    data: { token: participant.token },
  };
}
