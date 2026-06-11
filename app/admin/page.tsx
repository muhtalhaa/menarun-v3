import { PixelCard } from "@/components/ui/PixelCard";
import { prisma } from "@/lib/prisma";
import { Users, Calendar, Activity } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const [participantCount, eventCount, activityCount, activeEventCount] =
    await Promise.all([
      prisma.participant.count(),
      prisma.event.count(),
      prisma.activity.count(),
      prisma.event.count({ where: { isActive: true } }),
    ]);

  const stats = [
    {
      label: "Total Peserta",
      value: participantCount,
      icon: Users,
      color: "text-tosca",
    },
    {
      label: "Total Event",
      value: eventCount,
      icon: Calendar,
      color: "text-tosca-dark",
    },
    {
      label: "Event Aktif",
      value: activeEventCount,
      icon: Calendar,
      color: "text-semantic-success",
    },
    {
      label: "Total Aktivitas",
      value: activityCount,
      icon: Activity,
      color: "text-semantic-info",
    },
  ];

  return (
    <div>
      <h1 className="font-pixel text-xs text-tosca-dark md:text-sm">
        Dashboard
      </h1>
      <p className="mt-2 font-pixelBody text-lg text-text-muted">
        Ringkasan platform menaRun.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <PixelCard key={label} className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-sans text-sm text-text-muted">{label}</p>
                <p className="mt-1 font-pixel text-sm text-tosca-dark">
                  {value.toLocaleString("id-ID")}
                </p>
              </div>
              <Icon size={28} className={color} />
            </div>
          </PixelCard>
        ))}
      </div>
    </div>
  );
}
