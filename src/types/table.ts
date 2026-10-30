export type DynamicRecordStatus = "Active" | "Pending" | "Inactive";

export interface DynamicRecord {
  id: string;
  name: string;
  email: string;
  role: string;
  status: DynamicRecordStatus;
  joinDate: string;
}

export type TableSortKey = keyof DynamicRecord;
export type TableSortDirection = "asc" | "desc";
