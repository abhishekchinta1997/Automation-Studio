import { useEffect, useMemo, useState } from "react";
import { useApp } from "../context/AppContext";
import { initialUsers } from "../data/mockUsers";
import { AppUser } from "../types/user";

type ModalType =
  | "total"
  | "super"
  | "admin"
  | "test"
  | "locked"
  | "disabled"
  | "superUserProfile"
  | null;

type FormattedUserRow = {
  id: string;
  name: string;
  email: string;
  status: string;
  role: string;
  lastLogin: string;
  createdDate: string;
};

type DashboardModalState = {
  type: ModalType;
  title: string;
  rows?: FormattedUserRow[];
};

function getToday() {
  return new Date().toISOString().slice(0, 10);
}

function isSuperUser(user: Partial<AppUser> | null | undefined) {
  return user?.id === "USR-1001" || user?.email === "admin@example.com" || user?.role === "Super User";
}

function isAdminUser(user: Partial<AppUser> | null | undefined) {
  return user?.role === "Admin User" || isSuperUser(user);
}

function isLocked(user: Partial<AppUser> | null | undefined) {
  return user?.locked === true || user?.status === "Locked";
}

function safePercent(value: number, total: number) {
  if (!total) return 0;
  return Math.round((value / total) * 100);
}

function testIdSlug(value: string) {
  return String(value || "unknown")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function formatUser(user: Partial<AppUser> | null | undefined): FormattedUserRow {
  return {
    id: user?.id || "USR-0000",
    name: user?.name || "Unknown User",
    email: user?.email || "unknown@example.com",
    status: isLocked(user) ? `${user?.status || "Active"} (Locked)` : user?.status || "Active",
    role: isSuperUser(user) ? "Super User" : user?.role || "Test User",
    lastLogin: user?.lastLogin || "Never",
    createdDate: user?.createdDate || getToday(),
  };
}

export default function AdminHomePage() {
  const { users, activity, loginAttempts, systemLogs, currentUser, showToast, recordAuditEvent } = useApp();
  const today = getToday();
  const dashboardUsers = users?.length ? users : initialUsers;

  const [modal, setModal] = useState<DashboardModalState>({ type: null, title: "" });
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [activityFilter, setActivityFilter] = useState<"today" | "7days" | "30days">("today");
  const [activitySearch, setActivitySearch] = useState("");

  const canUseSuperActions = isSuperUser(currentUser);
  const canUseAdminActions = isAdminUser(currentUser);
  const loggedInProfile = currentUser
    ? formatUser(currentUser)
    : formatUser(dashboardUsers.find((u) => isSuperUser(u)) || dashboardUsers[0]);

  useEffect(() => {
    function handleScroll() {
      setShowScrollTop(window.scrollY > 300);
    }
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const counts = useMemo(() => {
    const superUsers = dashboardUsers.filter((u) => isSuperUser(u)).length;
    const adminUsers = dashboardUsers.filter((u) => !isSuperUser(u) && u.role === "Admin User").length;
    const testUsers = dashboardUsers.filter((u) => u.role === "Test User").length;
    const disabledUsers = dashboardUsers.filter((u) => u.status === "Disabled").length;
    const lockedUsers = dashboardUsers.filter((u) => isLocked(u)).length;
    const activeUsers = dashboardUsers.filter((u) => u.status === "Active" && !isLocked(u)).length;

    return {
      totalUsers: dashboardUsers.length,
      superUsers,
      adminUsers,
      testUsers,
      activeUsers,
      disabledUsers,
      lockedUsers,
    };
  }, [dashboardUsers]);

  const usersByType: Record<Exclude<ModalType, "superUserProfile" | null>, AppUser[]> = {
    total: dashboardUsers,
    super: dashboardUsers.filter((u) => isSuperUser(u)),
    admin: dashboardUsers.filter((u) => !isSuperUser(u) && u.role === "Admin User"),
    test: dashboardUsers.filter((u) => u.role === "Test User"),
    locked: dashboardUsers.filter((u) => isLocked(u)),
    disabled: dashboardUsers.filter((u) => u.status === "Disabled"),
  };

  const activityRows = useMemo(() => {
    return (activity || [])
      .map((item) => ({
        id: item.id,
        type: item.action || item.message || "User Activity",
        user: item.user || "User",
        performedBy: item.performedBy || currentUser?.name || "System",
        dateTime: item.dateTime || item.time || today,
        status: item.status || "Success",
      }))
      .filter((row) => {
        const query = activitySearch.trim().toLowerCase();
        const matchesSearch =
          !query ||
          `${row.type} ${row.user} ${row.performedBy} ${row.status}`.toLowerCase().includes(query);
        if (!matchesSearch) return false;
        if (activityFilter === "today") {
          const dt = String(row.dateTime);
          const localeToday = new Date().toLocaleDateString();
          return (
            dt.includes(today) ||
            dt.includes(localeToday) ||
            !dt.match(/^\d{4}-\d{2}-\d{2}/)
          );
        }
        return true;
      });
  }, [activity, activityFilter, activitySearch, currentUser?.name, today]);

  const summaryCards: {
    key: Exclude<ModalType, "superUserProfile" | null>;
    title: string;
    count: number;
    icon: string;
    tone: string;
  }[] = [
    { key: "total", title: "Total Users", count: counts.totalUsers, icon: "👥", tone: "purple" },
    { key: "super", title: "Super Users", count: counts.superUsers, icon: "🛡️", tone: "indigo" },
    { key: "admin", title: "Admin Users", count: counts.adminUsers, icon: "🧑‍💼", tone: "blue" },
    { key: "test", title: "Test Users", count: counts.testUsers, icon: "🧪", tone: "violet" },
    { key: "locked", title: "Locked Users", count: counts.lockedUsers, icon: "🔒", tone: "amber" },
    { key: "disabled", title: "Disabled Users", count: counts.disabledUsers, icon: "🚫", tone: "red" },
  ];

  const quickActions = [
    {
      label: "Export CSV",
      icon: "📄",
      testId: "admin-dashboard-export-csv-button",
      action: () => exportUsersCsv(dashboardUsers),
    },
    {
      label: "Export Excel",
      icon: "📗",
      testId: "admin-dashboard-export-excel-button",
      action: () => exportUsersExcel(dashboardUsers),
    },
    {
      label: "Export PDF",
      icon: "📕",
      testId: "admin-dashboard-export-pdf-button",
      action: exportUsersPdf,
    },
    {
      label: "View Recent Activity",
      icon: "🕘",
      testId: "admin-dashboard-recent-activity-button",
      action: () => document.getElementById("recent-activity-section")?.scrollIntoView({ behavior: "smooth" }),
    },
    {
      label: "Open User Analytics",
      icon: "📊",
      testId: "admin-dashboard-user-analytics-button",
      action: () => document.getElementById("analytics-section")?.scrollIntoView({ behavior: "smooth" }),
    },
  ];

  function openUserList(key: Exclude<ModalType, "superUserProfile" | null>, title: string) {
    setModal({ type: key, title, rows: usersByType[key].map(formatUser) });
  }

  function exportUsersCsv(exportUsers: AppUser[]) {
    const header = ["User ID", "Name", "Email", "Role", "Status", "Created Date", "Last Login"];
    const rows = exportUsers.map((u) => {
      const user = formatUser(u);
      return [user.id, user.name, user.email, user.role, user.status, user.createdDate, user.lastLogin];
    });
    const csv = [header, ...rows]
      .map((row) => row.map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "admin-users-export.csv";
    link.click();
    URL.revokeObjectURL(url);
    recordAuditEvent(
      "Export Users CSV",
      `Exported ${exportUsers.length} user record(s) to CSV`,
      { source: "Admin Dashboard", targetUser: `${exportUsers.length} user(s)`, level: "Info", status: "Success" }
    );
    showToast("Users CSV exported", "success");
  }

  function exportUsersExcel(exportUsers: AppUser[]) {
    const header = ["User ID", "Name", "Email", "Role", "Status", "Created Date", "Last Login"];
    const rows = exportUsers.map((u) => {
      const user = formatUser(u);
      return [user.id, user.name, user.email, user.role, user.status, user.createdDate, user.lastLogin];
    });
    const table = [header, ...rows]
      .map(
        (row) =>
          `<tr>${row
            .map((cell) => `<td>${String(cell ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;")}</td>`)
            .join("")}</tr>`
      )
      .join("");
    const excelHtml = `<html><head><meta charset="UTF-8" /></head><body><table>${table}</table></body></html>`;
    const blob = new Blob([excelHtml], { type: "application/vnd.ms-excel;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "admin-users-export.xls";
    link.click();
    URL.revokeObjectURL(url);
    recordAuditEvent(
      "Export Users Excel",
      `Exported ${exportUsers.length} user record(s) to Excel`,
      { source: "Admin Dashboard", targetUser: `${exportUsers.length} user(s)`, level: "Info", status: "Success" }
    );
    showToast("Users Excel exported", "success");
  }

  function exportUsersPdf() {
    const rowsHtml = dashboardUsers
      .map((u) => {
        const user = formatUser(u);
        return `
          <tr>
            <td>${user.id}</td>
            <td>${user.name}</td>
            <td>${user.email}</td>
            <td>${user.role}</td>
            <td>${user.status}</td>
            <td>${user.createdDate}</td>
            <td>${user.lastLogin}</td>
          </tr>
        `;
      })
      .join("");

    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>User Table Export</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 24px; }
              h1 { margin-bottom: 20px; }
              table { width: 100%; border-collapse: collapse; }
              th, td { border: 1px solid #ccc; padding: 10px; text-align: left; }
              th { background: #f3f4f6; }
            </style>
          </head>
          <body>
            <h1>User Management Report</h1>
            <table>
              <thead>
                <tr>
                  <th>User ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Created Date</th>
                  <th>Last Login</th>
                </tr>
              </thead>
              <tbody>
                ${rowsHtml}
              </tbody>
            </table>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }

    recordAuditEvent(
      "Export Users PDF",
      `Exported ${dashboardUsers.length} user record(s) to PDF report`,
      { source: "Admin Dashboard", targetUser: `${dashboardUsers.length} user(s)`, level: "Info", status: "Success" }
    );
    showToast("Users table exported to PDF", "success");
  }

  return (
    <section className="admin-dashboard enterprise-dashboard" data-testid="admin-dashboard-page">
      <div className="dashboard-hero" data-testid="admin-dashboard-overview-widget">
        <div>
          <span className="eyebrow">Test Administration Portal</span>
          <h1>Admin Dashboard</h1>
          <p className="muted">
            User governance, role metrics, and real-time session audit logs for test automation.
          </p>
        </div>
        <button
          className="role-badge purple clickable"
          data-testid="super-user-badge"
          aria-label="Open super user details"
          onClick={() => setModal({ type: "superUserProfile", title: "Super User Details" })}
        >
          🛡️ {canUseSuperActions ? "Super User" : "Admin User"}
        </button>
      </div>

      <section className="card dashboard-section" data-testid="admin-dashboard-quick-actions-section">
        <SectionTitle
          icon="⚡"
          title="Quick Actions"
          subtitle="Common user export tasks and direct navigation to analytics and session logs."
        />
        <div className="quick-action-grid modern-actions">
          {quickActions.map((action) => (
            <button
              key={action.testId}
              className="action-card"
              data-testid={action.testId}
              onClick={action.action}
              disabled={!canUseAdminActions}
            >
              <span>{action.icon}</span>
              <strong>{action.label}</strong>
            </button>
          ))}
        </div>
      </section>

      <section
        className="summary-card-grid dashboard-summary-grid"
        data-testid="admin-dashboard-summary-cards-section"
      >
        {summaryCards.map((card) => (
          <DashboardSummaryCard
            key={card.key}
            title={card.title}
            count={card.count}
            icon={card.icon}
            tone={card.tone}
            onView={() => openUserList(card.key, card.title)}
          />
        ))}
      </section>

      <section
        id="analytics-section"
        className="card dashboard-section analytics-wrapper"
        data-testid="admin-dashboard-analytics-section"
      >
        <SectionTitle
          icon="📊"
          title="User Analytics"
          subtitle="Live user status breakdown and role distribution synced with the active user directory."
        />
        <div className="dashboard-two-column">
          <AnalyticsCard title="User Status Overview" testId="user-status-overview-widget">
            <ProgressRow label="Active Users" value={counts.activeUsers} total={counts.totalUsers} tone="green" />
            <ProgressRow label="Disabled Users" value={counts.disabledUsers} total={counts.totalUsers} tone="red" />
            <ProgressRow label="Locked Users" value={counts.lockedUsers} total={counts.totalUsers} tone="amber" />
          </AnalyticsCard>
          <AnalyticsCard title="Role Distribution" testId="role-distribution-widget">
            <ProgressRow label="Super Users" value={counts.superUsers} total={counts.totalUsers} tone="purple" />
            <ProgressRow label="Admin Users" value={counts.adminUsers} total={counts.totalUsers} tone="blue" />
            <ProgressRow label="Test Users" value={counts.testUsers} total={counts.totalUsers} tone="violet" />
          </AnalyticsCard>
        </div>
      </section>

      <section
        id="recent-activity-section"
        className="card dashboard-section"
        data-testid="admin-dashboard-recent-activity-section"
      >
        <SectionTitle
          icon="📌"
          title="Recent Activity"
          subtitle="Real-time stream of user edits, logins, and table exports performed during this session."
        />
        <div className="activity-toolbar">
          {(["today", "7days", "30days"] as const).map((filter) => (
            <button
              key={filter}
              type="button"
              className={activityFilter === filter ? "filter-active" : "filter-button"}
              data-testid={`admin-dashboard-activity-filter-${filter}`}
              onClick={() => setActivityFilter(filter)}
            >
              {filter === "today" ? "Today" : filter === "7days" ? "Last 7 Days" : "Last 30 Days"}
            </button>
          ))}
          <input
            data-testid="admin-dashboard-activity-search-input"
            placeholder="Search activity logs..."
            value={activitySearch}
            onChange={(event) => setActivitySearch(event.target.value)}
          />
        </div>
        <div className="table-wrap professional-table" data-testid="admin-dashboard-activity-log-list">
          <table data-testid="admin-dashboard-recent-activity-table">
            <thead>
              <tr>
                <th>Action</th>
                <th>Target / Subject</th>
                <th>Performed By</th>
                <th>Timestamp</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {activityRows.map((row, index) => (
                <tr
                  key={row.id || `${row.type}-${index}`}
                  data-testid={`admin-dashboard-activity-row-${testIdSlug(`${row.type}-${row.user}-${row.dateTime}`)}`}
                >
                  <td>
                    <strong>{row.type}</strong>
                  </td>
                  <td>{row.user}</td>
                  <td>{row.performedBy}</td>
                  <td>{row.dateTime}</td>
                  <td>
                    <span
                      className={`status-badge ${row.status.toLowerCase()}`}
                      data-testid={`admin-dashboard-activity-status-badge-${testIdSlug(`${row.type}-${row.user}`)}`}
                    >
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!activityRows.length && (
            <div className="practice-message empty" data-testid="admin-dashboard-no-recent-activity">
              No recent activity recorded in this session yet. Sign in, create or edit users, or export tables to populate this table.
            </div>
          )}
        </div>
      </section>

      <section
        id="system-logs-section"
        className="card dashboard-section"
        data-testid="admin-dashboard-system-logs-section"
      >
        <SectionTitle
          icon="🧾"
          title="System Logs"
          subtitle="Runtime audit events generated by authentication, user management, and data exports."
        />
        <div className="table-wrap professional-table">
          <table data-testid="admin-dashboard-system-logs-table">
            <thead>
              <tr>
                <th>Level</th>
                <th>Source</th>
                <th>Event</th>
                <th>Details</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {systemLogs.map((log) => (
                <tr key={log.id} data-testid={`system-log-row-${testIdSlug(log.id)}`}>
                  <td>
                    <span className={`status-badge ${String(log.level).toLowerCase()}`}>{log.level}</span>
                  </td>
                  <td>{log.source}</td>
                  <td>{log.event}</td>
                  <td className="wide-cell">{log.details}</td>
                  <td>{log.timestamp}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!systemLogs.length && (
            <div className="practice-message empty" data-testid="admin-dashboard-no-system-logs">
              No system logs captured in this session yet. Perform login, user edits, or export actions to generate logs.
            </div>
          )}
        </div>
      </section>

      <section
        id="login-attempts-section"
        className="card dashboard-section"
        data-testid="admin-dashboard-login-attempts-section"
      >
        <SectionTitle
          icon="🔐"
          title="Login Attempts"
          subtitle="Authentication attempts recorded from the login flow during this session."
        />
        <div className="table-wrap professional-table">
          <table data-testid="admin-dashboard-login-attempts-table">
            <thead>
              <tr>
                <th>Username</th>
                <th>Full Name</th>
                <th>Login Status</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {loginAttempts.map((attempt) => (
                <tr key={attempt.id} data-testid={`login-attempt-row-${testIdSlug(attempt.id)}`}>
                  <td>{attempt.username}</td>
                  <td>{attempt.fullName}</td>
                  <td>
                    <span className={`status-badge ${String(attempt.loginStatus).toLowerCase()}`}>
                      {attempt.loginStatus}
                    </span>
                  </td>
                  <td>{attempt.timestamp}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!loginAttempts.length && (
            <div className="practice-message empty" data-testid="admin-dashboard-no-login-attempts">
              No login attempts captured in this session yet.
            </div>
          )}
        </div>
      </section>

      <DashboardModal modal={modal} setModal={setModal} loggedInProfile={loggedInProfile} />

      {showScrollTop && (
        <button
          className="scroll-top-button"
          data-testid="dashboard-scroll-top-button"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          ↑
        </button>
      )}
    </section>
  );
}

function DashboardSummaryCard({
  title,
  count,
  icon,
  tone,
  onView,
}: {
  title: string;
  count: number;
  icon: string;
  tone: string;
  onView: () => void;
}) {
  return (
    <article className={`dashboard-summary-card ${tone}`} data-testid={`admin-dashboard-${testIdSlug(title)}-card`}>
      <span className="status-dot" />
      <div>
        <p>{title}</p>
        <h2>{count}</h2>
      </div>
      <span className="summary-icon">{icon}</span>
      <button type="button" data-testid={`admin-dashboard-${testIdSlug(title)}-view-button`} onClick={onView}>
        View
      </button>
    </article>
  );
}

function SectionTitle({ icon, title, subtitle }: { icon: string; title: string; subtitle: string }) {
  return (
    <div className="section-title">
      <span>{icon}</span>
      <div>
        <h2>{title}</h2>
        <p className="muted">{subtitle}</p>
      </div>
    </div>
  );
}

function AnalyticsCard({
  title,
  testId,
  children,
}: {
  title: string;
  testId: string;
  children: React.ReactNode;
}) {
  return (
    <section className="card analytics-card" data-testid={testId}>
      <h2>{title}</h2>
      <div className="analytics-stack">{children}</div>
    </section>
  );
}

function ProgressRow({
  label,
  value,
  total,
  tone,
}: {
  label: string;
  value: number;
  total: number;
  tone: string;
}) {
  const percent = safePercent(value, total);
  return (
    <div className="progress-row" data-testid={`dashboard-widget-${label.toLowerCase().replaceAll(" ", "-")}`}>
      <div className="between">
        <span>{label}</span>
        <b>{percent}%</b>
      </div>
      <div className="progress-track">
        <span className={tone} style={{ width: `${percent}%` }} />
      </div>
      <small>
        {value} of {total} users
      </small>
    </div>
  );
}

function DashboardModal({
  modal,
  setModal,
  loggedInProfile,
}: {
  modal: DashboardModalState;
  setModal: (next: DashboardModalState) => void;
  loggedInProfile: FormattedUserRow;
}) {
  if (!modal.type) return null;

  const close = () => setModal({ type: null, title: "" });

  return (
    <div className="modal-backdrop" data-testid={`admin-dashboard-popup-modal-${modal.type}`}>
      <div
        className="modal enterprise-modal"
        data-testid={modal.type === "superUserProfile" ? "super-user-popup" : "dashboard-popup-modal"}
      >
        <div className="between">
          <h2>{modal.title}</h2>
          <button
            type="button"
            className="modal-close"
            data-testid={
              modal.type === "superUserProfile" ? "super-user-close-button" : "admin-dashboard-popup-close-button"
            }
            onClick={close}
          >
            Close
          </button>
        </div>

        {modal.type === "superUserProfile" ? (
          <div className="super-user-details">
            <span className="protected-badge">{loggedInProfile.role}</span>
            <DetailGrid
              rows={[
                ["User ID", loggedInProfile.id],
                ["Name", loggedInProfile.name],
                ["Email", loggedInProfile.email],
                ["Role", loggedInProfile.role],
                ["Status", loggedInProfile.status],
                ["Last Login", loggedInProfile.lastLogin],
                ["Created Date", loggedInProfile.createdDate],
                ["Permissions", "Full audit, user governance, exports, dashboard monitoring"],
              ]}
            />
            <p className="muted">This profile shows details for the currently logged-in user.</p>
          </div>
        ) : (
          <div className="modal-table-wrap">
            <table data-testid="admin-dashboard-modal-user-list-table">
              <thead>
                <tr>
                  <th>User ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Status</th>
                  <th>Role</th>
                </tr>
              </thead>
              <tbody>
                {(modal.rows || []).map((row) => (
                  <tr key={row.id} data-testid={`admin-dashboard-modal-user-row-${testIdSlug(row.id)}`}>
                    <td>{row.id}</td>
                    <td>{row.name}</td>
                    <td>{row.email}</td>
                    <td>{row.status}</td>
                    <td>{row.role}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!(modal.rows || []).length && <p className="practice-message">No users found for this category.</p>}
          </div>
        )}
      </div>
    </div>
  );
}

function DetailGrid({ rows }: { rows: [string, string][] }) {
  return (
    <div className="detail-grid">
      {rows.map(([label, value]) => (
        <div key={label}>
          <span>{label}</span>
          <strong>{value}</strong>
        </div>
      ))}
    </div>
  );
}
