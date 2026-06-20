import Link from "next/link";
import { Suspense } from "react";
import { QuoteCard } from "@/components/layout/QuoteCard";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { LeaderboardView } from "@/components/leaderboard/LeaderboardView";
import { PixelCard } from "@/components/ui/PixelCard";
import { PixelLoader } from "@/components/ui/PixelLoader";
import { PixelButton } from "@/components/ui/PixelButton";
import { getEventsForFilter } from "@/lib/events";
import {
  getLeaderboardData,
  resolveLeaderboardEventId,
} from "@/lib/leaderboard";
import { parseLeaderboardPage } from "@/lib/leaderboard-pagination";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ eventId?: string; page?: string }>;
}

export default async function HomePage({ searchParams }: PageProps) {
  const { eventId: requestedEventId, page: requestedPage } = await searchParams;
  const resolvedEventId = await resolveLeaderboardEventId(requestedEventId);
  const events = await getEventsForFilter();

  if (!resolvedEventId) {
    return (
      <main className="min-h-screen bg-bg-primary">
        <SiteHeader />
        <div className="mx-auto max-w-lg px-4 py-8">
          <PixelCard className="p-6 text-center">
            <h1 className="font-pixel text-xs text-tosca-dark md:text-sm">
              menaRun v3
            </h1>
            <p className="mt-4 font-pixelBody text-xl text-text-secondary">
              Belum ada event tersedia.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link href="/registrasi">
                <PixelButton className="w-full sm:w-auto">Registrasi</PixelButton>
              </Link>
              <Link href="/input">
                <PixelButton variant="secondary" className="w-full sm:w-auto">
                  Input Aktivitas
                </PixelButton>
              </Link>
            </div>
          </PixelCard>
          <SiteFooter />
        </div>
      </main>
    );
  }

  const data = await getLeaderboardData(resolvedEventId);

  if (!data) {
    return (
      <main className="min-h-screen bg-bg-primary">
        <SiteHeader />
        <div className="mx-auto max-w-lg px-4 py-8">
          <PixelCard className="p-6 text-center">
            <p className="font-pixelBody text-xl text-text-secondary">
              Event tidak ditemukan.
            </p>
          </PixelCard>
          <SiteFooter />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-bg-primary">
      <SiteHeader />

      <div className="mx-auto max-w-lg px-4 py-6 md:max-w-2xl md:py-8">
        <Suspense
          fallback={
            <div className="flex justify-center py-12">
              <PixelLoader />
            </div>
          }
        >
          <LeaderboardView
            data={data}
            events={events}
            page={parseLeaderboardPage(requestedPage)}
            showCta
          />
        </Suspense>

        <p className="mt-8 text-center font-pixelBody text-lg">
          <Link
            href="/lupa-token"
            className="text-tosca underline-offset-2 hover:underline"
          >
            Lupa Token?
          </Link>
        </p>

        <div className="mt-6">
          <QuoteCard />
        </div>

        <SiteFooter />
      </div>
    </main>
  );
}
