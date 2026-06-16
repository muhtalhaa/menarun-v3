import { ParticipantsTable } from "@/components/admin/ParticipantsTable";
import { getActiveBansByParticipantIds } from "@/lib/ban";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminPesertaPage() {
  const [participants, events, majlisList] = await Promise.all([
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
        _count: { select: { activities: true } },
      },
    }),
    prisma.event.findMany({
      orderBy: { tanggalMulai: "desc" },
      select: { id: true, nama: true },
    }),
    prisma.majlis.findMany({
      where: { isActive: true },
      orderBy: { nama: "asc" },
      select: { nama: true },
    }),
  ]);

  const banMap = await getActiveBansByParticipantIds(
    participants.map((p) => p.id)
  );

  const rows = participants.map((p) => ({
    id: p.id,
    token: p.token,
    nama: p.nama,
    noAims: p.noAims,
    majlis: p.majlis,
    email: p.email,
    usia: p.usia,
    noHp: p.noHp,
    createdAt: p.createdAt.toISOString(),
    activityCount: p._count.activities,
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
        <ParticipantsTable
          data={rows}
          events={events}
          majlisOptions={majlisList.map((m) => m.nama)}
        />
      </div>
    </div>
  );
}
