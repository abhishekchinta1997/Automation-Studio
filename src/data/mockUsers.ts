import { AppUser, ActivityItem } from "../types/user";

export const initialUsers: AppUser[] = [
  {
    id: "USR-1001",
    name: "Super User",
    email: "admin@example.com",
    password: "admin123",
    role: "Super User",
    status: "Active",
    createdDate: new Date().toISOString().slice(0, 10),
    lastLogin: "2026-05-23 09:10",
    locked: false,
  },

  {
    id: "USR-1002",
    name: "Test User",
    email: "test@example.com",
    password: "test123",
    role: "Test User",
    status: "Active",
    createdDate: "2026-05-20",
    lastLogin: "2026-05-22 14:30",
    locked: false,
  },

  {
    id: "USR-1003",
    name: "Priya Kumar",
    email: "priya@example.com",
    password: "test123",
    role: "Test User",
    status: "Disabled",
    createdDate: "2026-05-18",
    lastLogin: "2026-05-19 10:15",
    locked: true,
  },

  {
    id: "USR-1004",
    name: "Admin User",
    email: "manager@example.com",
    password: "manager123",
    role: "Admin User",
    status: "Active",
    createdDate: "2026-05-15",
    lastLogin: "2026-05-21 11:00",
    locked: false,
  },

  {
    id: "USR-1005",
    name: "Sarah Wilson",
    email: "sarah@example.com",
    password: "test123",
    role: "Test User",
    status: "Active",
    createdDate: "2026-05-12",
    lastLogin: "2026-05-20 08:45",
    locked: false,
  },
];

export const initialActivity: ActivityItem[] = [];
