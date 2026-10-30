import { DynamicRecord, TableSortDirection, TableSortKey } from "../types/table";

/**
 * Escapes a cell value for standard CSV compatibility.
 * Prevents formula injection (=, +, -, @) and escapes quotes/commas/newlines.
 */
export function escapeCSVCell(value: unknown): string {
  if (value === null || value === undefined) return '""';
  let str = String(value);

  // Prevent formula injection in spreadsheet software
  if (/^[=+\-@]/.test(str)) {
    str = "'" + str;
  }

  // Quote if it contains special characters or double quotes
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return `"${str}"`;
}

/**
 * Converts a list of records into safe, RFC-4180 compliant CSV string.
 */
export function recordsToCSV(records: DynamicRecord[]): string {
  const headers = ["ID", "Full Name", "Email", "Role", "Status", "Join Date"];
  const rows = records.map((r) => [
    escapeCSVCell(r.id),
    escapeCSVCell(r.name),
    escapeCSVCell(r.email),
    escapeCSVCell(r.role),
    escapeCSVCell(r.status),
    escapeCSVCell(r.joinDate),
  ]);

  return [headers.map((h) => `"${h}"`).join(","), ...rows.map((row) => row.join(","))].join("\r\n");
}

/**
 * Triggers a client-side download using a Blob and clean object URL revocation.
 */
export function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: `${mimeType};charset=utf-8;` });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.setTimeout(() => URL.revokeObjectURL(url), 100);
}

/**
 * Natural sort comparator supporting numeric chunks (e.g. REC-1002 before REC-1010)
 * with a stable fallback to ID.
 */
export function compareDynamicRecords(
  a: DynamicRecord,
  b: DynamicRecord,
  sortKey: TableSortKey,
  sortDirection: TableSortDirection
): number {
  const valA = a[sortKey];
  const valB = b[sortKey];

  let cmp = 0;
  if (typeof valA === "string" && typeof valB === "string") {
    cmp = valA.localeCompare(valB, undefined, { numeric: true, sensitivity: "base" });
  }

  if (cmp === 0 && sortKey !== "id") {
    cmp = a.id.localeCompare(b.id, undefined, { numeric: true });
  }

  return sortDirection === "asc" ? cmp : -cmp;
}
