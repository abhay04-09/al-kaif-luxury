import React from 'react';
import { Download } from 'lucide-react';
import { Column, downloadCsv, stamp, toCsv } from '../csv';

/**
 * Downloads what is currently on screen as a spreadsheet.
 *
 * It exports the filtered rows rather than everything, because someone who has
 * just narrowed the list to March's unpaid orders means to export those.
 */
export function ExportButton<T>({
  rows,
  columns,
  filename,
  label = 'Export'
}: {
  rows: T[];
  columns: Column<T>[];
  filename: string;
  label?: string;
}) {
  const disabled = rows.length === 0;

  return (
    <button
      type="button"
      disabled={disabled}
      title={
        disabled
          ? 'Nothing to export'
          : `Download ${rows.length} row${rows.length === 1 ? '' : 's'} as CSV`
      }
      onClick={() => downloadCsv(`${filename}-${stamp()}.csv`, toCsv(rows, columns))}
      className="inline-flex items-center gap-2 border border-[#2A2A2a] hover:border-[#C5A059] text-[#DFC27C] px-3 py-2 text-[10px] uppercase tracking-[0.2em] rounded-xs transition disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-[#2A2A2a]"
    >
      <Download className="w-3.5 h-3.5" />
      {label}
      {!disabled && <span className="text-[#A7A7A7]">({rows.length})</span>}
    </button>
  );
}
