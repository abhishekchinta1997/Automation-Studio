import { AppUser } from "../types/user";
import { TableSearchMode } from "../types/table";

export const SUPER_USER_EMAIL = "admin@example.com";
export const SUPER_USER_ID = "USR-1001";

export function isSuperUser(user?: Partial<AppUser> | null): boolean {
  return (
    user?.id === SUPER_USER_ID ||
    user?.email === SUPER_USER_EMAIL ||
    user?.role === "Super User"
  );
}

export function isAdminUser(user?: Partial<AppUser> | null): boolean {
  return user?.role === "Admin User" || isSuperUser(user);
}

export function isLocked(user?: { locked?: boolean; status?: string } | null): boolean {
  return user?.locked === true || user?.status === "Locked";
}

export function isNeverLoggedIn(record?: { lastLogin?: string } | null): boolean {
  const val = String(record?.lastLogin ?? "").trim().toLowerCase();
  return !val || val === "never" || val === "n/a" || val === "not logged in";
}

export function testIdSlug(value: string): string {
  return String(value || "unknown")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function matchesBySearchMode(
  values: string[],
  query: string,
  mode: TableSearchMode
): boolean {
  if (!query) return true;
  const lowered = values.map((v) => v.toLowerCase());
  if (mode === "exact") return lowered.some((v) => v === query);
  if (mode === "starts") return lowered.some((v) => v.startsWith(query));
  return lowered.some((v) => v.includes(query));
}
