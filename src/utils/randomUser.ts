import { AppUser } from "../types/user";
const names = [
  "Alex Carter",
  "Jordan Lee",
  "Taylor Smith",
  "Morgan Brown",
  "Casey Miller",
  "Riley Davis",
  "Avery Wilson",
  "Jamie Moore",
];
export function createRandomUser(index: number): AppUser {
  const name = names[Math.floor(Math.random() * names.length)] + " " + index;
  const email = name.toLowerCase().replaceAll(" ", ".") + "@example.com";
  return {
    id: "USR-" + Date.now() + "-" + index,
    name,
    email,
    password: "Password123",
    role: Math.random() > 0.75 ? "Admin User" : "Test User",
    status: Math.random() > 0.2 ? "Active" : "Disabled",
    createdDate: new Date().toISOString().slice(0, 10),
    lastLogin: "Never",
  };
}
