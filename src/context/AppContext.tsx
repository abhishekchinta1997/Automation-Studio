import React, { createContext, useContext, useMemo, useRef, useState } from "react";
import { AppUser, ActivityItem, UserStatus, LoginAttempt, SystemLog } from "../types/user";
import { initialUsers, initialActivity } from "../data/mockUsers";
import { createRandomUser } from "../utils/randomUser";

type Toast = { message: string; type: "success" | "error" | "info" | "warning" } | null;
interface AppContextType {
  currentUser: AppUser | null;
  users: AppUser[];
  activity: ActivityItem[];
  loginAttempts: LoginAttempt[];
  systemLogs: SystemLog[];
  darkMode: boolean;
  toast: Toast;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  toggleDarkMode: () => void;
  showToast: (message: string, type?: "success" | "error" | "info" | "warning") => void;
  createUser: (user: Omit<AppUser, "id" | "createdDate" | "lastLogin">) => string | null;
  updateUser: (id: string, changes: Partial<AppUser>) => void;
  deleteUsers: (ids: string[]) => void;
  bulkStatus: (ids: string[], status: UserStatus) => void;
  resetPassword: (id: string) => void;
  createRandomUsers: (count: number, role: "Admin User" | "Test User") => void;
  updateOwnProfile: (name: string, password: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

function nowStamp() {
  return new Date().toLocaleString();
}

// Collision-safe ID (Date.now() alone can repeat within the same millisecond).
function newId(prefix: string) {
  const unique =
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID().slice(0, 8)
      : Math.random().toString(36).slice(2, 10);
  return `${prefix}-${Date.now()}-${unique}`;
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [users, setUsers] = useState<AppUser[]>(() => {
    const saved = localStorage.getItem("automation-users");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        // fallback
      }
    }
    return initialUsers;
  });

  // Keep localStorage updated when users change so automatic fallback and re-seeding work properly
  React.useEffect(() => {
    localStorage.setItem("automation-users", JSON.stringify(users));
  }, [users]);
  const [activity, setActivity] = useState<ActivityItem[]>(initialActivity);
  const [loginAttempts, setLoginAttempts] = useState<LoginAttempt[]>([]);
  const [systemLogs, setSystemLogs] = useState<SystemLog[]>([]);
  const [currentUser, setCurrentUser] = useState<AppUser | null>(() => {
    const saved = localStorage.getItem("automation-current-user");
    if (!saved) return null;
    try {
      const parsed = JSON.parse(saved);
      if (parsed && typeof parsed === "object" && typeof parsed.id === "string" && typeof parsed.role === "string") {
        return parsed as AppUser;
      }
    } catch (e) {
      // corrupt session data: fall through and clear it
    }
    localStorage.removeItem("automation-current-user");
    return null;
  });
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("automation-dark-mode") === "true";
  });
  const [toast, setToast] = useState<Toast>(null);
  const toastTimer = useRef<number | undefined>(undefined);

  // Keep the logged-in session (state + storage) in step with edits to the same user record.
  function syncCurrentUser(ids: string[], changes: Partial<AppUser>) {
    if (!currentUser || !ids.includes(currentUser.id)) return;
    const updated = { ...currentUser, ...changes };
    setCurrentUser(updated);
    localStorage.setItem("automation-current-user", JSON.stringify(updated));
  }

  function addSystemLog(level: SystemLog["level"], source: string, event: string, details: string) {
    setSystemLogs((prev) => [
      { id: newId("LOG"), level, source, event, details, timestamp: nowStamp() },
      ...prev,
    ].slice(0, 30));
  }

  function addActivity(message: string, meta?: Partial<ActivityItem>) {
    setActivity((prev) => [
      {
        id: newId("ACT"),
        message,
        time: nowStamp(),
        dateTime: nowStamp(),
        status: "Success",
        ...meta,
      },
      ...prev,
    ].slice(0, 30));
  }

  function showToast(message: string, type: "success" | "error" | "info" | "warning" = "success") {
    window.clearTimeout(toastTimer.current);
    setToast({ message, type });
    toastTimer.current = window.setTimeout(() => setToast(null), 2500);
  }

  async function login(email: string, password: string) {
    await new Promise((r) => setTimeout(r, 700));
    const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    const validUser = user && user.password === password && user.status !== "Disabled";
    const status: LoginAttempt["loginStatus"] = validUser ? "Success" : user?.status === "Disabled" ? "Blocked" : "Failed";

    setLoginAttempts((prev) => [
      {
        id: newId("LOGIN"),
        username: email || "Blank username",
        fullName: user?.name || "Unknown user",
        loginStatus: status,
        timestamp: nowStamp(),
      },
      ...prev,
    ].slice(0, 50));

    addSystemLog(
      status === "Success" ? "Info" : status === "Blocked" ? "Warning" : "Error",
      "Authentication",
      `Login ${status}`,
      `${email || "Blank username"} attempted to sign in${user ? ` as ${user.name}` : " with an unknown account"}.`,
    );

    if (!validUser) return false;

    const updated = { ...user, lastLogin: nowStamp() };
    setCurrentUser(updated);
    localStorage.setItem("automation-current-user", JSON.stringify(updated));
    setUsers((prev) => prev.map((u) => (u.id === user.id ? updated : u)));
    addActivity(`${user.name} logged in`, { action: "Login Success", user: user.name, performedBy: "System", status: "Success" });
    return true;
  }

  function logout() {
    if (currentUser) {
      addActivity(`${currentUser.name} logged out`, { action: "Logout", user: currentUser.name, performedBy: "System", status: "Success" });
      addSystemLog("Info", "Session", "Logout", `${currentUser.name} ended the session.`);
    }
    setCurrentUser(null);
    localStorage.removeItem("automation-current-user");
  }

  function toggleDarkMode() {
    setDarkMode((v) => {
      const next = !v;
      localStorage.setItem("automation-dark-mode", String(next));
      return next;
    });
  }

  function createUser(user: Omit<AppUser, "id" | "createdDate" | "lastLogin">) {
    if (users.some((u) => u.email.toLowerCase() === user.email.toLowerCase())) return "Duplicate email already exists";
    const next: AppUser = { ...user, id: newId("USR"), createdDate: new Date().toISOString().slice(0, 10), lastLogin: "Never" };
    setUsers((prev) => [next, ...prev]);
    addActivity(`Created user ${next.name}`, { action: "User Created", user: next.name, performedBy: currentUser?.name || "System", status: "Success" });
    addSystemLog("Info", "User Management", "User Created", `${next.name} (${next.email}) was created with ${next.role} access.`);
    showToast("User created");
    return null;
  }

  function updateUser(id: string, changes: Partial<AppUser>) {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...changes } : u)));
    syncCurrentUser([id], changes);
    addActivity(`Updated user ${id}`, { action: "User Updated", user: id, performedBy: currentUser?.name || "System", status: "Success" });
    addSystemLog("Info", "User Management", "User Updated", `User ${id} was updated. Changed fields: ${Object.keys(changes).join(", ") || "none"}.`);
    showToast("User updated");
  }

  function deleteUsers(ids: string[]) {
    setUsers((prev) => prev.filter((u) => !ids.includes(u.id)));
    addActivity(`Deleted ${ids.length} user(s)`, { action: "Users Deleted", user: `${ids.length} user(s)`, performedBy: currentUser?.name || "System", status: "Success" });
    addSystemLog("Warning", "User Management", "Users Deleted", `${ids.length} user record(s) were removed.`);
    showToast("User(s) deleted");
  }

  function bulkStatus(ids: string[], status: UserStatus) {
    setUsers((prev) => prev.map((u) => (ids.includes(u.id) ? { ...u, status } : u)));
    syncCurrentUser(ids, { status });
    addActivity(`Bulk ${status} ${ids.length} user(s)`, { action: `Bulk ${status}`, user: `${ids.length} user(s)`, performedBy: currentUser?.name || "System", status: status === "Active" ? "Success" : "Warning" });
    addSystemLog(status === "Active" ? "Info" : "Warning", "Bulk Action", `Bulk ${status}`, `${ids.length} account(s) changed to ${status}.`);
    showToast(`Users ${status}`);
  }

  function resetPassword(id: string) {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, password: "Password123" } : u)));
    syncCurrentUser([id], { password: "Password123" });
    addActivity(`Password reset for ${id}`, { action: "Password Reset", user: id, performedBy: currentUser?.name || "System", status: "Success" });
    addSystemLog("Info", "Security", "Password Reset", `Password was reset for user ${id}.`);
    showToast("Password reset to Password123", "info");
  }

  function createRandomUsers(count: number, role: "Admin User" | "Test User") {
    const list = Array.from({ length: count }, (_, i) => ({ ...createRandomUser(i + users.length + 1), role }));
    setUsers((prev) => [...list, ...prev]);
    addActivity(`Generated ${count} ${role}(s)`, { action: "Generated Users", user: `${count} ${role}(s)`, performedBy: currentUser?.name || "System", status: "Success" });
    addSystemLog("Info", "Automation Practice", "Users Generated", `${count} ${role}(s) were generated for test coverage.`);
    showToast(`${count} ${role}(s) generated`);
  }

  function updateOwnProfile(name: string, password: string) {
    if (!currentUser) return;
    const updated = { ...currentUser, name, password: password || currentUser.password };
    setCurrentUser(updated);
    localStorage.setItem("automation-current-user", JSON.stringify(updated));
    setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
    addActivity(`${updated.name} updated own profile`, { action: "Profile Updated", user: updated.name, performedBy: updated.name, status: "Success" });
    addSystemLog("Info", "Profile", "Profile Updated", `${updated.name} updated their own profile.`);
    showToast("Profile updated");
  }

  const value = useMemo(() => ({
    currentUser,
    users,
    activity,
    loginAttempts,
    systemLogs,
    darkMode,
    toast,
    login,
    logout,
    toggleDarkMode,
    showToast,
    createUser,
    updateUser,
    deleteUsers,
    bulkStatus,
    resetPassword,
    createRandomUsers,
    updateOwnProfile,
  }), [currentUser, users, activity, loginAttempts, systemLogs, darkMode, toast]);

  return <AppContext.Provider value={value}><div className={darkMode ? "dark" : ""}>{children}</div></AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be inside AppProvider");
  return ctx;
}
