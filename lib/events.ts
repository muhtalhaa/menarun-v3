import { startOfDay } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { prisma } from "@/lib/prisma";
import type { EventFilterOption, EventSummary } from "@/types/event.types";

const WIB_TIMEZONE = "Asia/Jakarta";

function getTodayWib(): Date {
  const nowWib = toZonedTime(new Date(), WIB_TIMEZONE);
  return startOfDay(nowWib);
}

function toEventSummary(event: {
  id: string;
  nama: string;
  deskripsi: string;
  tanggalMulai: Date;
  tanggalSelesai: Date;
  isActive: boolean;
}): EventSummary {
  return {
    id: event.id,
    nama: event.nama,
    deskripsi: event.deskripsi,
    tanggalMulai: event.tanggalMulai,
    tanggalSelesai: event.tanggalSelesai,
    isActive: event.isActive,
  };
}

export function isEventInActivePeriod(
  event: { tanggalMulai: Date; tanggalSelesai: Date; isActive: boolean },
  today = getTodayWib()
): boolean {
  if (!event.isActive) return false;

  const start = startOfDay(toZonedTime(event.tanggalMulai, WIB_TIMEZONE));
  const end = startOfDay(toZonedTime(event.tanggalSelesai, WIB_TIMEZONE));

  return today >= start && today <= end;
}

export async function getCurrentEvent(): Promise<{
  event: EventSummary | null;
  isCurrentlyActive: boolean;
}> {
  const today = getTodayWib();

  const activeEvents = await prisma.event.findMany({
    where: {
      isActive: true,
      tanggalMulai: { lte: today },
      tanggalSelesai: { gte: today },
    },
    orderBy: { tanggalMulai: "desc" },
    take: 1,
  });

  if (activeEvents[0]) {
    return {
      event: toEventSummary(activeEvents[0]),
      isCurrentlyActive: true,
    };
  }

  const recent = await prisma.event.findFirst({
    orderBy: { tanggalMulai: "desc" },
  });

  if (!recent) {
    return { event: null, isCurrentlyActive: false };
  }

  return {
    event: toEventSummary(recent),
    isCurrentlyActive: false,
  };
}

export async function getEventById(
  eventId: string
): Promise<EventSummary | null> {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
  });

  return event ? toEventSummary(event) : null;
}

export async function getEventsForFilter(): Promise<EventFilterOption[]> {
  const { event: currentEvent } = await getCurrentEvent();

  const events = await prisma.event.findMany({
    orderBy: [{ isActive: "desc" }, { tanggalMulai: "desc" }],
    select: { id: true, nama: true, isActive: true },
  });

  return events.map((e) => ({
    id: e.id,
    nama: e.nama,
    isActive: e.isActive,
    isCurrent: currentEvent?.id === e.id,
  }));
}
