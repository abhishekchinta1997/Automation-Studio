import { DynamicRecord } from "../types/table";

function daysAgoISO(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

export const initialDynamicRecords: DynamicRecord[] = [
  { id: "REC-1001", name: "Alice Smith", email: "alice.smith@example.com", role: "Engineering Lead", status: "Active", joinDate: "2024-01-15", lastLogin: "2026-10-30 09:15", locked: false },
  { id: "REC-1002", name: "Bob Johnson", email: "bob.johnson@example.com", role: "DevOps Engineer", status: "Active", joinDate: "2024-02-10", lastLogin: "2026-10-29 14:22", locked: false },
  { id: "REC-1003", name: "Charlie Davis", email: "charlie.davis@example.com", role: "Product Manager", status: "Pending", joinDate: "2024-03-05", lastLogin: "Never", locked: false },
  { id: "REC-1004", name: "Diana Prince", email: "diana.prince@example.com", role: "Automation QA", status: "Active", joinDate: "2024-03-20", lastLogin: "2026-10-30 11:05", locked: false },
  { id: "REC-1005", name: "Ethan Hunt", email: "ethan.hunt@example.com", role: "Security Auditor", status: "Inactive", joinDate: "2024-04-11", lastLogin: "2026-09-14 08:40", locked: true },
  { id: "REC-1006", name: "Fiona Gallagher", email: "fiona.g@example.com", role: "Frontend Developer", status: "Active", joinDate: "2024-05-02", lastLogin: "2026-10-28 16:50", locked: false },
  { id: "REC-1007", name: "George Clark", email: "george.clark@example.com", role: "Backend Engineer", status: "Active", joinDate: "2024-05-18", lastLogin: "2026-10-27 10:12", locked: false },
  { id: "REC-1008", name: "Hannah Abbott", email: "hannah.a@example.com", role: "UI/UX Designer", status: "Pending", joinDate: "2024-06-01", lastLogin: "Never", locked: false },
  { id: "REC-1009", name: "Ian Malcolm", email: "ian.malcolm@example.com", role: "Data Scientist", status: "Active", joinDate: "2024-06-14", lastLogin: "2026-10-25 19:30", locked: false },
  { id: "REC-1010", name: "Julia Roberts", email: "julia.r@example.com", role: "HR Manager", status: "Inactive", joinDate: "2024-07-09", lastLogin: "2026-08-19 12:00", locked: true },
  { id: "REC-1011", name: "Kevin Bacon", email: "kevin.b@example.com", role: "Software Architect", status: "Active", joinDate: "2024-07-22", lastLogin: "2026-10-30 07:45", locked: false },
  { id: "REC-1012", name: "Laura Croft", email: "laura.c@example.com", role: "Penetration Tester", status: "Active", joinDate: "2024-08-03", lastLogin: "2026-10-21 15:10", locked: true },
  { id: "REC-1013", name: "Michael Scott", email: "michael.s@example.com", role: "Regional Manager", status: "Pending", joinDate: "2024-08-19", lastLogin: "Never", locked: false },
  { id: "REC-1014", name: "Natalie Portman", email: "natalie.p@example.com", role: "AI Research Lead", status: "Active", joinDate: "2024-09-01", lastLogin: "2026-10-29 18:05", locked: false },
  { id: "REC-1015", name: "Oscar Isaac", email: "oscar.i@example.com", role: "Full Stack Engineer", status: "Active", joinDate: "2024-09-15", lastLogin: "2026-10-26 13:20", locked: false },
  { id: "REC-1016", name: "Peter Parker", email: "peter.p@example.com", role: "Junior Developer", status: "Active", joinDate: "2024-10-02", lastLogin: "Never", locked: false },
  { id: "REC-1017", name: "Quinn Fabray", email: "quinn.f@example.com", role: "QA Engineer", status: "Inactive", joinDate: "2024-10-18", lastLogin: "2026-07-30 11:11", locked: true },
  { id: "REC-1018", name: "Rachel Green", email: "rachel.g@example.com", role: "Product Designer", status: "Active", joinDate: "2024-11-05", lastLogin: "2026-10-28 09:50", locked: false },
  { id: "REC-1019", name: "Steve Rogers", email: "steve.r@example.com", role: "System Administrator", status: "Active", joinDate: "2024-11-20", lastLogin: "2026-10-30 08:00", locked: false },
  { id: "REC-1020", name: "Tony Stark", email: "tony.s@example.com", role: "Chief Technology Officer", status: "Active", joinDate: "2024-12-01", lastLogin: "2026-10-30 10:30", locked: false },
  { id: "REC-1021", name: "Uma Thurman", email: "uma.t@example.com", role: "Security Engineer", status: "Pending", joinDate: "2024-12-12", lastLogin: "Never", locked: false },
  { id: "REC-1022", name: "Victor Stone", email: "victor.s@example.com", role: "Cloud Architect", status: "Active", joinDate: daysAgoISO(6), lastLogin: "2026-10-29 17:40", locked: false },
  { id: "REC-1023", name: "Wanda Maximoff", email: "wanda.m@example.com", role: "Automation Expert", status: "Active", joinDate: daysAgoISO(4), lastLogin: "2026-10-30 12:15", locked: false },
  { id: "REC-1024", name: "Xavier Woods", email: "xavier.w@example.com", role: "Developer Advocate", status: "Inactive", joinDate: daysAgoISO(3), lastLogin: "2026-10-28 14:00", locked: true },
  { id: "REC-1025", name: "Yara Shahidi", email: "yara.s@example.com", role: "Software Engineer", status: "Active", joinDate: daysAgoISO(1), lastLogin: "Never", locked: false },
  { id: "REC-1026", name: "Zachary Levi", email: "zachary.l@example.com", role: "QA Lead", status: "Active", joinDate: daysAgoISO(0), lastLogin: "2026-10-30 15:25", locked: false },
];
