export type DynamicRecordStatus = "Active" | "Pending" | "Inactive";

export type TableSearchMode = "exact" | "partial" | "starts";

export interface DynamicRecord {
  id: string;
  name: string;
  email: string;
  role: string;
  status: DynamicRecordStatus;
  joinDate: string;
  lastLogin?: string;
  locked?: boolean;
}

export type TableSortKey = "id" | "name" | "email" | "role" | "status" | "joinDate";
export type TableSortDirection = "asc" | "desc";
