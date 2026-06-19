import { prisma } from "@/lib/prisma";

export interface EventReportRow {
  id: string;
  createdAt: string;
  reporterNama: string;
  reporterToken: string;
  reportedNama: string;
  reportedToken: string;
  detail: string;
}

export async function getEventReports(eventId: string): Promise<EventReportRow[]> {
  const reports = await prisma.activityReport.findMany({
    where: { eventId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      detail: true,
      createdAt: true,
      reporterParticipant: { select: { nama: true, token: true } },
      reportedParticipant: { select: { nama: true, token: true } },
    },
  });

  return reports.map((report) => ({
    id: report.id,
    createdAt: report.createdAt.toISOString(),
    reporterNama: report.reporterParticipant.nama,
    reporterToken: report.reporterParticipant.token,
    reportedNama: report.reportedParticipant.nama,
    reportedToken: report.reportedParticipant.token,
    detail: report.detail,
  }));
}
