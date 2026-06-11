import { ParticipantsTable } from "@/components/admin/ParticipantsTable";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminPesertaPage() {
  const participants = await prisma.participant.findMany({
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
  });

  const rows = participants.map((p) => ({
    ...p,
    createdAt: p.createdAt.toISOString(),
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
        <ParticipantsTable data={rows} />
      </div>
    </div>
  );
}
