"use client";

import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState, useTransition } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import { toast } from "sonner";
import { unbanParticipant } from "@/actions/ban";
import { BanParticipantDialog } from "@/components/admin/BanParticipantDialog";
import { PixelCard } from "@/components/ui/PixelCard";
import { PixelInput } from "@/components/ui/PixelInput";
import { PixelButton } from "@/components/ui/PixelButton";
import { formatDateId } from "@/lib/format";

export interface ParticipantBanRow {
  id: string;
  eventNama: string;
  tanggalMulai: string;
  tanggalSelesai: string;
}

export interface ParticipantRow {
  id: string;
  token: string;
  nama: string;
  noAims: string;
  majlis: string;
  email: string;
  usia: number;
  noHp: string;
  createdAt: string;
  activeBans: ParticipantBanRow[];
}

interface EventOption {
  id: string;
  nama: string;
}

interface ParticipantsTableProps {
  data: ParticipantRow[];
  events: EventOption[];
}

export function ParticipantsTable({ data, events }: ParticipantsTableProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [sorting, setSorting] = useState<SortingState>([
    { id: "createdAt", desc: true },
  ]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [banTarget, setBanTarget] = useState<ParticipantRow | null>(null);

  const handleUnban = useCallback(
    (banId: string) => {
      if (!confirm("Cabut ban ini?")) return;

      startTransition(async () => {
        const result = await unbanParticipant({ banId });
        if (!result.success) {
          toast.error(result.error.message);
          return;
        }
        toast.success("Ban berhasil dicabut.");
        router.refresh();
      });
    },
    [router]
  );

  const columns = useMemo<ColumnDef<ParticipantRow>[]>(
    () => [
      { accessorKey: "token", header: "Token" },
      { accessorKey: "nama", header: "Nama" },
      { accessorKey: "noAims", header: "No. AIMS" },
      { accessorKey: "majlis", header: "Majlis" },
      { accessorKey: "email", header: "Email" },
      { accessorKey: "usia", header: "Usia" },
      { accessorKey: "noHp", header: "No. HP" },
      {
        accessorKey: "createdAt",
        header: "Tgl Registrasi",
        cell: ({ getValue }) => formatDateId(getValue<string>()),
      },
      {
        id: "statusBanned",
        header: "Status Banned",
        cell: ({ row }) => {
          const bans = row.original.activeBans;
          if (bans.length === 0) {
            return <span className="text-text-muted">—</span>;
          }

          return (
            <div className="space-y-1">
              {bans.map((ban) => (
                <div
                  key={ban.id}
                  className="rounded-pixel border border-semantic-danger/30 bg-semantic-danger/5 px-2 py-1 text-xs text-semantic-danger"
                >
                  <p>
                    Banned untuk event &quot;{ban.eventNama}&quot;
                  </p>
                  <p className="text-text-muted">
                    {formatDateId(ban.tanggalMulai)} –{" "}
                    {formatDateId(ban.tanggalSelesai)}
                  </p>
                  <button
                    type="button"
                    className="mt-1 font-semibold underline"
                    onClick={() => handleUnban(ban.id)}
                    disabled={isPending}
                  >
                    Unban
                  </button>
                </div>
              ))}
            </div>
          );
        },
      },
      {
        id: "actions",
        header: "Aksi",
        cell: ({ row }) => (
          <PixelButton
            variant="secondary"
            className="text-[10px] !px-2 !py-1 !text-semantic-danger"
            onClick={() => setBanTarget(row.original)}
          >
            Ban
          </PixelButton>
        ),
      },
    ],
    [handleUnban, isPending]
  );

  const table = useReactTable({
    data,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    globalFilterFn: (row, _columnId, filterValue) => {
      const q = filterValue.toLowerCase();
      const p = row.original;
      return (
        p.nama.toLowerCase().includes(q) ||
        p.token.toLowerCase().includes(q) ||
        p.noAims.includes(q) ||
        p.majlis.toLowerCase().includes(q) ||
        p.email.toLowerCase().includes(q)
      );
    },
    initialState: { pagination: { pageSize: 50 } },
  });

  return (
    <div className="flex flex-col gap-4">
      <PixelInput
        label="Cari peserta"
        placeholder="Nama, token, AIMS, majlis, email..."
        value={globalFilter}
        onChange={(e) => setGlobalFilter(e.target.value)}
      />

      <PixelCard className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px] border-collapse font-sans text-sm">
            <thead>
              {table.getHeaderGroups().map((hg) => (
                <tr
                  key={hg.id}
                  className="border-b-2 border-tosca-muted bg-bg-toscaTint"
                >
                  {hg.headers.map((header) => (
                    <th
                      key={header.id}
                      className="cursor-pointer px-3 py-2 text-left font-semibold text-text-secondary"
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                      {header.column.getIsSorted() === "asc" && " ↑"}
                      {header.column.getIsSorted() === "desc" && " ↓"}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="px-3 py-8 text-center text-text-muted"
                  >
                    Tidak ada data peserta.
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-tosca-muted/50 hover:bg-bg-toscaTint/50"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td
                        key={cell.id}
                        className="max-w-[220px] px-3 py-2.5 align-top text-text-primary"
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </PixelCard>

      <div className="flex items-center justify-between font-sans text-sm text-text-muted">
        <span>
          Halaman {table.getState().pagination.pageIndex + 1} dari{" "}
          {table.getPageCount() || 1} · {table.getFilteredRowModel().rows.length}{" "}
          peserta
        </span>
        <div className="flex gap-2">
          <PixelButton
            variant="secondary"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            ← Prev
          </PixelButton>
          <PixelButton
            variant="secondary"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next →
          </PixelButton>
        </div>
      </div>

      {banTarget && (
        <BanParticipantDialog
          participantId={banTarget.id}
          participantName={banTarget.nama}
          events={events}
          onClose={() => setBanTarget(null)}
        />
      )}
    </div>
  );
}
