import { formatInTimeZone } from "date-fns-tz";
import { prisma } from "@/lib/prisma";
import { formatDateId } from "@/lib/format";

const WIB_TIMEZONE = "Asia/Jakarta";

export interface ActiveBanInfo {
  id: string;
  eventId: string;
  eventNama: string;
  tanggalMulai: Date;
  tanggalSelesai: Date;
}

function todayWibDateString(now = new Date()): string {
  return formatInTimeZone(now, WIB_TIMEZONE, "yyyy-MM-dd");
}

export function isBanActiveOnDate(
  tanggalMulai: Date,
  tanggalSelesai: Date,
  now = new Date()
): boolean {
  const today = todayWibDateString(now);
  const start = formatInTimeZone(tanggalMulai, WIB_TIMEZONE, "yyyy-MM-dd");
  const end = formatInTimeZone(tanggalSelesai, WIB_TIMEZONE, "yyyy-MM-dd");
  return today >= start && today <= end;
}

export async function getActiveBanForParticipantEvent(
  participantId: string,
  eventId: string,
  now = new Date()
): Promise<ActiveBanInfo | null> {
  const bans = await prisma.participantBan.findMany({
    where: { participantId, eventId },
    include: { event: { select: { nama: true } } },
    orderBy: { createdAt: "desc" },
  });

  const active = bans.find((ban) =>
    isBanActiveOnDate(ban.tanggalMulai, ban.tanggalSelesai, now)
  );

  if (!active) return null;

  return {
    id: active.id,
    eventId: active.eventId,
    eventNama: active.event.nama,
    tanggalMulai: active.tanggalMulai,
    tanggalSelesai: active.tanggalSelesai,
  };
}

export function buildBanMessage(ban: ActiveBanInfo): string {
  return `Anda sudah terbanned dari event "${ban.eventNama}" dari "${formatDateId(ban.tanggalMulai)}" sampai "${formatDateId(ban.tanggalSelesai)}"`;
}

export async function getActiveBansByParticipantIds(
  participantIds: string[],
  now = new Date()
): Promise<Map<string, ActiveBanInfo[]>> {
  if (participantIds.length === 0) return new Map();

  const bans = await prisma.participantBan.findMany({
    where: { participantId: { in: participantIds } },
    include: { event: { select: { nama: true } } },
    orderBy: { createdAt: "desc" },
  });

  const map = new Map<string, ActiveBanInfo[]>();

  for (const ban of bans) {
    if (!isBanActiveOnDate(ban.tanggalMulai, ban.tanggalSelesai, now)) {
      continue;
    }

    const info: ActiveBanInfo = {
      id: ban.id,
      eventId: ban.eventId,
      eventNama: ban.event.nama,
      tanggalMulai: ban.tanggalMulai,
      tanggalSelesai: ban.tanggalSelesai,
    };

    const existing = map.get(ban.participantId) ?? [];
    existing.push(info);
    map.set(ban.participantId, existing);
  }

  return map;
}
