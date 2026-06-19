import { notFound } from "next/navigation";
import { ParticipantDetailView } from "@/components/leaderboard/ParticipantDetailView";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { getParticipantEventDetail } from "@/lib/participant-public";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ eventId: string; participantId: string }>;
}

export default async function ParticipantDetailPage({ params }: PageProps) {
  const { eventId, participantId } = await params;
  const detail = await getParticipantEventDetail(eventId, participantId);

  if (!detail) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-bg-primary">
      <SiteHeader />

      <div className="mx-auto max-w-3xl px-4 py-6 md:py-8">
        <ParticipantDetailView detail={detail} />
        <SiteFooter />
      </div>
    </main>
  );
}
