"use client";

import { useMemo, useState } from "react";
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
import { PixelCard } from "@/components/ui/PixelCard";
import { PixelInput } from "@/components/ui/PixelInput";
import { PixelButton } from "@/components/ui/PixelButton";
import { formatDateId } from "@/lib/format";

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
}

interface ParticipantsTableProps {
  data: ParticipantRow[];
}

export function ParticipantsTable({ data }: ParticipantsTableProps) {
  const [sorting, setSorting] = useState<SortingState>([
    { id: "createdAt", desc: true },
  ]);
  const [globalFilter, setGlobalFilter] = useState("");

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
    ],
    []
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
          <table className="w-full min-w-[900px] border-collapse font-sans text-sm">
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
                        className="max-w-[180px] truncate px-3 py-2.5 text-text-primary"
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
    </div>
  );
}
