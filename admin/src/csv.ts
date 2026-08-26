/**
 * Spreadsheet exports.
 *
 * CSV rather than a real .xlsx file: Excel and Google Sheets both open it
 * without a converter, and it stays readable if either ever stops being the
 * tool of choice.
 */

/**
 * A cell beginning =, +, - or @ is read as a formula by Excel and Sheets, and
 * a name or note carrying one can run when the file is opened. Prefixing an
 * apostrophe forces it back to text — the cell still reads correctly, it just
 * cannot execute.
 */
function safeCell(value: unknown): string {
  if (value === null || value === undefined) return '';
  const text = String(value);
  const guarded = /^[=+\-@\t\r]/.test(text) ? `'${text}` : text;
  // Quotes are doubled and the whole cell wrapped, so commas, quotes and
  // newlines inside an address survive the trip.
  return `"${guarded.replace(/"/g, '""')}"`;
}

export type Column<T> = {
  header: string;
  value: (row: T) => unknown;
};

export function toCsv<T>(rows: T[], columns: Column<T>[]): string {
  const head = columns.map(c => safeCell(c.header)).join(',');
  const body = rows.map(row => columns.map(c => safeCell(c.value(row))).join(','));
  // CRLF is what Excel expects; Sheets is happy with it too.
  return [head, ...body].join('\r\n');
}

export function downloadCsv(filename: string, csv: string): void {
  // Without the byte order mark Excel reads the file as the local codepage and
  // turns ₹ and every accented name into mojibake. Sheets ignores it.
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/** A date stamp for the filename, so successive exports do not overwrite. */
export function stamp(): string {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

/** Spreadsheets sort ISO dates correctly; localised ones sort alphabetically. */
export function isoDate(value?: string | null): string {
  if (!value) return '';
  const date = new Date(value);
  return Number.isNaN(+date) ? '' : date.toISOString().slice(0, 19).replace('T', ' ');
}
