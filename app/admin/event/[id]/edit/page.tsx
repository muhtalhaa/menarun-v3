import { formatInTimeZone } from "date-fns-tz";
import { notFound } from "next/navigation";
import { EventForm } from "@/components/forms/EventForm";
import { prisma } from "@/lib/prisma";

const WIB = "Asia/Jakarta";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminEventEditPage({ params }: PageProps) {
  const { id } = await params;

  const event = await prisma.event.findUnique({ where: { id } });
  if (!event) notFound();

  return (
    <EventForm
      mode="edit"
      eventId={id}
      defaultValues={{
        nama: event.nama,
        deskripsi: event.deskripsi,
        tanggalMulai: formatInTimeZone(event.tanggalMulai, WIB, "yyyy-MM-dd"),
        tanggalSelesai: formatInTimeZone(event.tanggalSelesai, WIB, "yyyy-MM-dd"),
        jamMulaiSubmit: event.jamMulaiSubmit,
        jamBatasSubmit: event.jamBatasSubmit,
        isActive: event.isActive,
      }}
    />
  );
}
