import Link from "next/link";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SubmitActivityForm } from "@/components/forms/SubmitActivityForm";
import { PixelCard } from "@/components/ui/PixelCard";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function InputPage() {
  const events = await prisma.event.findMany({
    where: { isActive: true },
    orderBy: { tanggalMulai: "desc" },
    select: {
      id: true,
      nama: true,
      tanggalMulai: true,
      tanggalSelesai: true,
    },
  });

  const eventOptions = events.map((event) => ({
    ...event,
    tanggalMulai: event.tanggalMulai.toISOString(),
    tanggalSelesai: event.tanggalSelesai.toISOString(),
  }));

  return (
    <main className="min-h-screen bg-bg-primary">
      <SiteHeader />

      <div className="mx-auto max-w-lg px-4 py-8">
        {events.length === 0 ? (
          <PixelCard className="p-6 text-center">
            <p className="font-pixelBody text-xl text-text-secondary">
              Tidak ada event aktif saat ini.
            </p>
            <p className="mt-2 font-sans text-sm text-text-muted">
              Silakan coba lagi nanti.
            </p>
          </PixelCard>
        ) : (
          <SubmitActivityForm events={eventOptions} />
        )}

        <p className="mt-6 text-center font-pixelBody text-lg">
          <Link
            href="/lupa-token"
            className="text-tosca underline-offset-2 hover:underline"
          >
            Lupa Token?
          </Link>
        </p>

        <SiteFooter />
      </div>
    </main>
  );
}
