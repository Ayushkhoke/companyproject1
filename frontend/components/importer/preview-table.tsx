"use client";

import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import type { ParsedCsvRow } from "../../types/csv-import";

interface PreviewTableProps {
  headers: string[];
  rows: ParsedCsvRow[];
}

const columnHelper = createColumnHelper<ParsedCsvRow>();

export function PreviewTable({ headers, rows }: PreviewTableProps) {
  const columns = headers.map((header) =>
    columnHelper.accessor(header, {
      header,
      cell: (info) => info.getValue() || "—",
    })
  );

  const table = useReactTable({
    data: rows,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (headers.length === 0) {
    return null;
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-950/75 shadow-glow backdrop-blur">
      <div className="border-b border-slate-800 px-6 py-4">
        <p className="text-sm font-medium text-slate-300">CSV preview</p>
        <p className="text-xs text-slate-500">Sticky header, first 25 parsed rows.</p>
      </div>
      <div className="max-h-[540px] overflow-auto">
        <table className="min-w-full border-separate border-spacing-0 text-left text-sm">
          <thead className="sticky top-0 z-10 bg-slate-950">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="border-b border-slate-800 px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400"
                  >
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="border-b border-slate-900/80 odd:bg-slate-950 even:bg-slate-900/40">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="max-w-[280px] border-b border-slate-900/80 px-4 py-3 text-slate-200">
                    <span className="block truncate">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </span>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
