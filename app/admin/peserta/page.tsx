import { ParticipantsTable } from "@/components/admin/ParticipantsTable";
import { getActiveBansByParticipantIds } from "@/lib/ban";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminPesertaPage() {
  const [participants, events] = await Promise.all([
    prisma.participant.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        token: true,
        nama: true,
        noAims: true,
        majlis: true,
        email: true,
        usia: true,
        noHp: true,
        createdAt: true,
      },
    }),
    prisma.event.findMany({
      orderBy: { tanggalMulai: "desc" },
      select: { id: true, nama: true },
    }),
  ]);

  const banMap = await getActiveBansByParticipantIds(
    participants.map((p) => p.id)
  );

  const rows = participants.map((p) => ({
    ...p,
    createdAt: p.createdAt.toISOString(),
    activeBans: (banMap.get(p.id) ?? []).map((ban) => ({
      id: ban.id,
      eventNama: ban.eventNama,
      tanggalMulai: ban.tanggalMulai.toISOString(),
      tanggalSelesai: ban.tanggalSelesai.toISOString(),
    })),
  }));

  return (
    <div>
      <h1 className="font-pixel text-xs text-tosca-dark md:text-sm">
        Data Peserta
      </h1>
      <p className="mt-2 font-pixelBody text-lg text-text-muted">
        {participants.length} peserta terdaftar
      </p>

      <div className="mt-6">
        <ParticipantsTable data={rows} events={events} />
      </div>
    </div>
  );
}
