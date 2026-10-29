export type Role = "Super User" | "Admin User" | "Test User";

export type UserStatus =
  | "Active"
  | "Disabled"
  | "Locked";

export interface AppUser {
  id: string;
  name: string;
  email: string;
  password: string;

  role: Role;
  status: UserStatus;

  createdDate: string;
  lastLogin: string;

  locked?: boolean;
}

export interface ActivityItem {
  id: string;
  message: string;
  time: string;

  action?: string;
  user?: string;
  performedBy?: string;
  dateTime?: string;
  status?: string;
}

export interface LoginAttempt {
  id: string;
  username: string;
  fullName: string;
  loginStatus: "Success" | "Failed" | "Blocked";
  timestamp: string;
}

export interface SystemLog {
  id: string;
  level: "Info" | "Warning" | "Error";
  source: string;
  event: string;
  details: string;
  timestamp: string;
}
