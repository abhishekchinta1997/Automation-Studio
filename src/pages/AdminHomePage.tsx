import { useEffect, useMemo, useState } from "react";
import { useApp } from "../context/AppContext";
import { useNavigate } from "react-router-dom";

type ModalType =
  | "total"
  | "super"
  | "admin"
  | "test"
  | "locked"
  | "disabled"
  | "alert"
  | "nested"
  | "random"
  | "superUserProfile"
  | null;

type DashboardModal = {
  type: ModalType;
  title: string;
  rows?: any[];
  details?: string;
};

function getToday() {
  return new Date().toISOString().slice(0, 10);
}

function isSuperUser(user: any) {
  return user?.id === "USR-1001" || user?.email === "admin@example.com" || user?.role === "Super User";
}

function isAdminUser(user: any) {
  return user?.role === "Admin" || user?.role === "Admin User" || isSuperUser(user);
}

function isLocked(user: any) {
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

function formatUser(user: any) {
  return {
    id: user?.id || "USR-0000",
    name: user?.name || "Unknown User",
    email: user?.email || "unknown@example.com",
    status: isLocked(user) ? "Locked" : user?.status || "Active",
    role: isSuperUser(user) ? "Super User" : user?.role || "Test User",
    lastLogin: user?.lastLogin || "Never",
    createdDate: user?.createdDate || getToday(),
  };
}

function fallbackUsers(today: string) {
  return [
    { id: "USR-1001", name: "Platform Super Admin", email: "admin@example.com", role: "Super User", status: "Active", lastLogin: `${today} 08:40`, createdDate: "2024-01-15" },
    { id: "USR-1042", name: "Maya Patel", email: "maya.patel@example.com", role: "Admin User", status: "Active", lastLogin: `${today} 09:12`, createdDate: "2024-04-03" },
    { id: "USR-1051", name: "Jordan Lee", email: "jordan.lee@example.com", role: "Admin User", status: "Locked", locked: true, lastLogin: `${today} 07:55`, createdDate: "2024-05-18" },
    { id: "USR-1088", name: "Priya Kumar", email: "priya.kumar@example.com", role: "Test User", status: "Disabled", lastLogin: "Never", createdDate: today },
    { id: "USR-1095", name: "Alex Morgan", email: "alex.morgan@example.com", role: "Test User", status: "Active", lastLogin: `${today} 10:18`, createdDate: today },
  ];
}

export default function AdminHomePage() {
  const { users, activity, loginAttempts, systemLogs, currentUser, showToast } = useApp();
  const navigate = useNavigate();
  const today = getToday();
  const dashboardUsers = users?.length ? users : fallbackUsers(today);

  const [modal, setModal] = useState<DashboardModal>({ type: null, title: "" });
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [activityFilter, setActivityFilter] = useState("today");
  const [activitySearch, setActivitySearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [emptyState, setEmptyState] = useState(false);
  const [validationError, setValidationError] = useState("");
  const [skeleton, setSkeleton] = useState(false);
  const [infiniteLoader, setInfiniteLoader] = useState(false);
  const [exportProgress, setExportProgress] = useState(false);

  const canUseSuperActions = isSuperUser(currentUser);
  const canUseAdminActions = isAdminUser(currentUser);
  const loggedInProfile =
  currentUser
    ? formatUser(currentUser)
    : formatUser(
        dashboardUsers.find((u: any) =>
          isSuperUser(u)
        ) || fallbackUsers(today)[0]
      );

      useEffect(() => {
  function handleScroll() {
    setShowScrollTop(window.scrollY > 300);
  }

  window.addEventListener(
    "scroll",
    handleScroll
  );

  return () => {
    window.removeEventListener(
      "scroll",
      handleScroll
    );
  };
}, []);

  const counts = useMemo(() => {
    const superUsers = dashboardUsers.filter((u: any) => isSuperUser(u)).length;
    const adminUsers = dashboardUsers.filter((u: any) => !isSuperUser(u) && (u.role === "Admin" || u.role === "Admin User")).length;
    const testUsers = dashboardUsers.filter((u: any) => u.role === "Test User").length;
    const disabledUsers = dashboardUsers.filter((u: any) => u.status === "Disabled").length;
    const lockedUsers = dashboardUsers.filter((u: any) => isLocked(u)).length;
    const activeUsers = dashboardUsers.filter((u: any) => u.status === "Active" && !isLocked(u)).length;
    const createdToday = dashboardUsers.filter((u: any) => u.createdDate === today).length;

    return { totalUsers: dashboardUsers.length, superUsers, adminUsers, testUsers, activeUsers, disabledUsers, lockedUsers, createdToday };
  }, [dashboardUsers, today]);

  const usersByType = {
    total: dashboardUsers,
    super: dashboardUsers.filter((u: any) => isSuperUser(u)),
    admin: dashboardUsers.filter((u: any) => !isSuperUser(u) && (u.role === "Admin" || u.role === "Admin User")),
    test: dashboardUsers.filter((u: any) => u.role === "Test User"),
    locked: dashboardUsers.filter((u: any) => isLocked(u)),
    disabled: dashboardUsers.filter((u: any) => u.status === "Disabled"),
  };

  const activityRows = useMemo(() => {
    return (activity || []).map((item: any) => ({
      type: item.action || item.message || "User Activity",
      icon: item.status === "Failed" ? "⛔" : item.status === "Warning" ? "⚠️" : "📌",
      user: item.user || item.userName || "User",
      performedBy: item.performedBy || currentUser?.name || "System",
      dateTime: item.dateTime || item.time || today,
      status: item.status || "Success",
    })).filter((row: any) => {
      const query = activitySearch.toLowerCase();
      const matchesSearch = !query || `${row.type} ${row.user} ${row.performedBy} ${row.status}`.toLowerCase().includes(query);
      if (!matchesSearch) return false;
      if (activityFilter === "today") return String(row.dateTime).includes(today) || String(row.dateTime).includes(new Date().toLocaleDateString());
      return true;
    });
  }, [activity, activityFilter, activitySearch, currentUser?.name, today]);

  const summaryCards = [
    { key: "total", title: "Total Users", count: counts.totalUsers, icon: "👥", tone: "purple" },
    { key: "super", title: "Super Users", count: counts.superUsers, icon: "🛡️", tone: "indigo" },
    { key: "admin", title: "Admin Users", count: counts.adminUsers, icon: "🧑‍💼", tone: "blue" },
    { key: "test", title: "Test Users", count: counts.testUsers, icon: "🧪", tone: "violet" },
    { key: "locked", title: "Locked Users", count: counts.lockedUsers, icon: "🔒", tone: "amber" },
    { key: "disabled", title: "Disabled Users", count: counts.disabledUsers, icon: "🚫", tone: "red" },
  ];

  const quickActions = [
    { label: "Export to CSV", icon: "📄", testId: "admin-dashboard-export-csv-button", action: () => exportUsersCsv(dashboardUsers) },
    { label: "Export to Excel", icon: "📗", testId: "admin-dashboard-export-excel-button", action: () => exportUsersExcel(dashboardUsers) },
    { label: "Export to PDF", icon: "📕", testId: "admin-dashboard-export-pdf-button", action: exportUsersPdf },
    { label: "View Recent Activity", icon: "🕘", testId: "admin-dashboard-recent-activity-button", action: () => document.getElementById("recent-activity-section")?.scrollIntoView({ behavior: "smooth" }) },
    { label: "Open User Analytics", icon: "📊", testId: "admin-dashboard-user-analytics-button", action: () => document.getElementById("analytics-section")?.scrollIntoView({ behavior: "smooth" }) },
    { label: "Open System Logs", icon: "🧾", testId: "admin-dashboard-system-logs-button", action: () => document.getElementById("system-logs-section")?.scrollIntoView({ behavior: "smooth" }) },
    { label: "Download Audit Report", icon: "📥", testId: "admin-dashboard-download-audit-report-button", action: downloadAuditReport },
    { label: "View Login Attempts", icon: "⛔", testId: "admin-dashboard-login-attempts-button", action: () => document.getElementById("login-attempts-section")?.scrollIntoView({ behavior: "smooth" }) },
    { label: "Open Automation Lab", icon: "🤖", testId: "admin-dashboard-open-automation-practice-button", action: () => navigate("/admin/lab") },
  ];

  function openUserList(key: string, title: string) {
    setModal({ type: key as ModalType, title, rows: (usersByType as any)[key].map(formatUser) });
  }

  function openDetails(title: string, details: string) {
    setModal({ type: "alert", title, details });
  }

  function exportUsersCsv(exportUsers: any[]) {
    const header = ["User ID", "Name", "Email", "Role", "Status", "Created Date", "Last Login"];
    const rows = exportUsers.map((u: any) => {
      const user = formatUser(u);
      return [user.id, user.name, user.email, user.role, user.status, user.createdDate, user.lastLogin];
    });
    const csv = [header, ...rows].map((row) => row.map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "admin-users-export.csv";
    link.click();
    URL.revokeObjectURL(url);
    showToast("Users CSV exported", "success");
  }

  function exportUsersExcel(exportUsers: any[]) {
    const header = ["User ID", "Name", "Email", "Role", "Status", "Created Date", "Last Login"];
    const rows = exportUsers.map((u: any) => {
      const user = formatUser(u);
      return [user.id, user.name, user.email, user.role, user.status, user.createdDate, user.lastLogin];
    });
    const table = [header, ...rows]
      .map((row) => `<tr>${row.map((cell) => `<td>${String(cell ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;")}</td>`).join("")}</tr>`)
      .join("");
    const excelHtml = `<html><head><meta charset="UTF-8" /></head><body><table>${table}</table></body></html>`;
    const blob = new Blob([excelHtml], { type: "application/vnd.ms-excel;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "admin-users-export.xls";
    link.click();
    URL.revokeObjectURL(url);
    showToast("Users Excel exported", "success");
  }

  function exportUsersPdf() {
  const users = dashboardUsers.map((u: any) => {
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
  }).join("");

  const printWindow = window.open(
    "",
    "_blank"
  );

  if (!printWindow) return;

  printWindow.document.write(`
    <html>
      <head>
        <title>User Table Export</title>

        <style>
          body {
            font-family: Arial;
            padding: 24px;
          }

          h1 {
            margin-bottom: 20px;
          }

          table {
            width: 100%;
            border-collapse: collapse;
          }

          th,
          td {
            border: 1px solid #ccc;
            padding: 10px;
            text-align: left;
          }

          th {
            background: #f3f4f6;
          }
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
            ${users}
          </tbody>
        </table>
      </body>
    </html>
  `);

  printWindow.document.close();

  printWindow.print();

  showToast(
    "Users table exported to PDF",
    "success"
  );
}

  function downloadAuditReport() {
    const text = `Audit Report\nGenerated: ${new Date().toLocaleString()}\nTotal Users: ${counts.totalUsers}\nLocked Users: ${counts.lockedUsers}\nDisabled Users: ${counts.disabledUsers}`;
    const blob = new Blob([text], { type: "text/plain;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "audit-report.txt";
    link.click();
    URL.revokeObjectURL(url);
    showToast("Audit report downloaded", "success");
  }

  function startTemporaryState(setter: (value: boolean) => void, message: string, type: string = "success", delay = 1200) {
    setter(true);
    setTimeout(() => {
      setter(false);
      showToast(message, type as any);
    }, delay);
  }

  function simulateExportProgress() {
    setExportProgress(true);
    setTimeout(() => {
      setExportProgress(false);
      showToast("Export completed", "success");
    }, 1600);
  }

  function simulateBackgroundSync() {
    showToast("Background sync completed", "success");
  }

  return (
    <section className="admin-dashboard enterprise-dashboard" data-testid="admin-dashboard-page">
      <div className="dashboard-hero" data-testid="admin-dashboard-overview-widget">
        <div>
          <span className="eyebrow">Enterprise Admin Portal</span>
          <h1>Admin Dashboard</h1>
          <p className="muted">User governance, access monitoring, audit insights, and automation testing practice in one modern dashboard.</p>
        </div>
        <button className="role-badge purple clickable" data-testid="super-user-badge" aria-label="Open super user details" onClick={() => setModal({ type: "superUserProfile", title: "Super User Details" })}>
          🛡️ {canUseSuperActions ? "Super User" : "Admin User"}
        </button>
      </div>

      <section className="card dashboard-section" data-testid="admin-dashboard-quick-actions-section">
        <SectionTitle icon="⚡" title="Quick Actions" subtitle="Common admin workflows and export actions for testing." />
        <div className="quick-action-grid modern-actions">
          {quickActions.map((action) => (
            <button key={action.testId} className="action-card" data-testid={action.testId} onClick={action.action} disabled={!canUseAdminActions}>
              <span>{action.icon}</span>
              <strong>{action.label}</strong>
            </button>
          ))}
        </div>
      </section>

      <section className="summary-card-grid compact-two-column" data-testid="admin-dashboard-summary-cards-section">
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
  <div className="section-title">
    <span>📊</span>

    <div>
      <h2>User Analytics</h2>

      <p className="muted">
        User statistics, role distribution,
        system health, and activity insights.
      </p>
    </div>
  </div>
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

        <div className="dashboard-widget-grid">
          <MiniChart title="Login Statistics" testId="login-statistics-chart" values={[8, 14, 10, 18, 24, 21, 29]} />
          <MiniChart title="User Growth" testId="user-growth-chart" values={[3, 5, 8, 9, 12, 14, counts.totalUsers]} />
          <DonutWidget title="Active vs Disabled" testId="active-disabled-chart" active={counts.activeUsers} disabled={counts.disabledUsers} />
          <HealthWidget title="System Health Status" icon="🟢" value="Operational" detail="99.98% uptime" testId="system-health-widget" />
          <HealthWidget title="API Status" icon="🟣" value="Healthy" detail="182ms avg response" testId="api-status-widget" />
          <HealthWidget title="Server Status" icon="🔵" value="Stable" detail="CPU 42% · Memory 61%" testId="server-status-widget" />
        </div>
      </section>

      <section id="recent-activity-section" className="card dashboard-section" data-testid="admin-dashboard-recent-activity-section">
        <SectionTitle icon="📌" title="Recent Activity" subtitle="Searchable activity stream with test-friendly rows and status badges." />
        <div className="activity-toolbar">
          {["today", "7days", "30days"].map((filter) => (
            <button key={filter} className={activityFilter === filter ? "filter-active" : "filter-button"} data-testid={`admin-dashboard-activity-filter-${filter}`} onClick={() => setActivityFilter(filter)}>
              {filter === "today" ? "Today" : filter === "7days" ? "Last 7 Days" : "Last 30 Days"}
            </button>
          ))}
          <input data-testid="admin-dashboard-activity-search-input" placeholder="Search activity logs..." value={activitySearch} onChange={(event) => setActivitySearch(event.target.value)} />
        </div>
        <div className="activity-list" data-testid="admin-dashboard-activity-log-list">
          {!activityRows.length && <div className="practice-message empty" data-testid="admin-dashboard-no-recent-activity">No recent activity yet. Login, create users, update users, or export data to populate this stream.</div>}
          {activityRows.map((row: any, index: number) => (
            <div className="activity-row" data-testid={`admin-dashboard-activity-row-${testIdSlug(`${row.type}-${row.user}-${row.dateTime}`)}`} key={`${row.type}-${index}`}>
              <span className={`activity-icon ${row.status.toLowerCase()}`}>{row.icon}</span>
              <div>
                <strong>{row.type}</strong>
                <p>{row.user} · Performed by {row.performedBy}</p>
              </div>
              <time>{row.dateTime}</time>
              <span className={`status-badge ${row.status.toLowerCase()}`} data-testid={`admin-dashboard-activity-status-badge-${testIdSlug(`${row.type}-${row.user}`)}`}>{row.status}</span>
            </div>
          ))}
        </div>
      </section>
      <section id="system-logs-section" className="card dashboard-section" data-testid="admin-dashboard-system-logs-section">
        <SectionTitle icon="🧾" title="System Logs" subtitle="Detailed runtime events generated by authentication, user management, exports, and practice actions." />
        <div className="table-wrap professional-table">
          <table data-testid="admin-dashboard-system-logs-table">
            <thead><tr><th>Level</th><th>Source</th><th>Event</th><th>Details</th><th>Timestamp</th></tr></thead>
            <tbody>
              {systemLogs.map((log: any) => (
                <tr key={log.id} data-testid={`system-log-row-${testIdSlug(log.id)}`}>
                  <td><span className={`status-badge ${String(log.level).toLowerCase()}`}>{log.level}</span></td>
                  <td>{log.source}</td>
                  <td>{log.event}</td>
                  <td className="wide-cell">{log.details}</td>
                  <td>{log.timestamp}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!systemLogs.length && <div className="practice-message empty" data-testid="admin-dashboard-no-system-logs">No system logs captured yet. Perform login or user management actions to generate logs.</div>}
        </div>
      </section>

      <section id="login-attempts-section" className="card dashboard-section" data-testid="admin-dashboard-login-attempts-section">
        <SectionTitle icon="🔐" title="Login Attempts" subtitle="Recent authentication attempts captured from the login flow." />
        <div className="table-wrap professional-table">
          <table data-testid="admin-dashboard-login-attempts-table">
            <thead><tr><th>Username</th><th>Full Name</th><th>Login Status</th><th>Timestamp</th></tr></thead>
            <tbody>
              {loginAttempts.map((attempt: any) => (
                <tr key={attempt.id} data-testid={`login-attempt-row-${testIdSlug(attempt.id)}`}>
                  <td>{attempt.username}</td>
                  <td>{attempt.fullName}</td>
                  <td><span className={`status-badge ${String(attempt.loginStatus).toLowerCase()}`}>{attempt.loginStatus}</span></td>
                  <td>{attempt.timestamp}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!loginAttempts.length && <div className="practice-message empty" data-testid="admin-dashboard-no-login-attempts">No login attempts captured in this session yet.</div>}
        </div>
      </section>

      <DashboardModal
  modal={modal}
  setModal={setModal}
  loggedInProfile={loggedInProfile}
/>

{showScrollTop && (
  <button
    className="scroll-top-button"
    data-testid="dashboard-scroll-top-button"
    onClick={() => {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }}
  >
    ↑
  </button>
)}
    </section>
  );
}

function DashboardSummaryCard({ title, count, icon, tone, onView }: any) {
  return (
    <article className={`dashboard-summary-card ${tone}`} data-testid={`admin-dashboard-${testIdSlug(title)}-card`}>
      <span className="status-dot" />
      <div>
        <p>{title}</p>
        <h2>{count}</h2>
      </div>
      <span className="summary-icon">{icon}</span>
      <button data-testid={`admin-dashboard-${testIdSlug(title)}-view-button`} onClick={onView}>View</button>
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

function AnalyticsCard({ title, testId, children }: any) {
  return (
    <section className="card analytics-card" data-testid={testId}>
      <h2>{title}</h2>
      <div className="analytics-stack">{children}</div>
    </section>
  );
}

function ProgressRow({ label, value, total, tone }: any) {
  const percent = safePercent(value, total);
  return (
    <div className="progress-row" data-testid={`dashboard-widget-${label.toLowerCase().replaceAll(" ", "-")}`}>
      <div className="between"><span>{label}</span><b>{percent}%</b></div>
      <div className="progress-track"><span className={tone} style={{ width: `${percent}%` }} /></div>
      <small>{value} of {total} users</small>
    </div>
  );
}

function MiniChart({ title, values, testId }: any) {
  const max = Math.max(...values, 1);
  return (
    <section className="card mini-chart-card" data-testid={testId}>
      <h3>{title}</h3>
      <div className="mini-bars" data-testid={`chart-${testId}`}>
        {values.map((value: number, index: number) => <span key={index} style={{ height: `${Math.max((value / max) * 100, 12)}%` }} />)}
      </div>
      <p className="muted">Last 7 data points</p>
    </section>
  );
}

function DonutWidget({ title, active, disabled, testId }: any) {
  const total = active + disabled || 1;
  const percent = safePercent(active, total);
  return (
    <section className="card donut-card" data-testid={testId}>
      <h3>{title}</h3>
      <div className="donut" style={{ background: `conic-gradient(#6046e8 ${percent}%, #fecaca 0)` }} data-testid={`chart-${testId}`}>
        <span>{percent}%</span>
      </div>
      <p className="muted">Active users ratio</p>
    </section>
  );
}

function HealthWidget({ title, icon, value, detail, testId }: any) {
  return (
    <section className="card health-widget" data-testid={testId}>
      <span>{icon}</span>
      <div><h3>{title}</h3><strong>{value}</strong><p className="muted">{detail}</p></div>
    </section>
  );
}

function ListWidget({ title, items, empty = "No records", testId }: any) {
  return (
    <section className="card list-widget" data-testid={testId}>
      <h3>{title}</h3>
      {(items.length ? items : [empty]).map((item: string, index: number) => <p key={index}>• {item}</p>)}
    </section>
  );
}

function PracticeButton({ testId, label, onClick }: any) {
  return <button className="practice-button" data-testid={testId} onClick={onClick}>{label}</button>;
}

function DashboardModal({ modal, setModal, loggedInProfile }: any) {
  const [nestedOpen, setNestedOpen] = useState(false);
  if (!modal.type) return null;

  const close = () => {
    setNestedOpen(false);
    setModal({ type: null, title: "" });
  };

  return (
    <div className="modal-backdrop" data-testid={`admin-dashboard-popup-modal-${modal.type}`}>
      <div className="modal enterprise-modal" data-testid={modal.type === "superUserProfile" ? "super-user-popup" : "dashboard-popup-modal"}>
        <div className="between">
          <h2>{modal.title}</h2>
          <button className="modal-close" data-testid={modal.type === "superUserProfile" ? "super-user-close-button" : "admin-dashboard-popup-close-button"} onClick={close}>Close</button>
        </div>

        {modal.type === "superUserProfile" ? (
          <div className="super-user-details">
            <span className="protected-badge">{loggedInProfile.role}</span>
            <DetailGrid rows={[
              ["User ID", loggedInProfile.id], ["Name", loggedInProfile.name], ["Email", loggedInProfile.email], ["Role", loggedInProfile.role], ["Status", loggedInProfile.status], ["Last Login", loggedInProfile.lastLogin], ["Created Date", loggedInProfile.createdDate], ["Permissions", "Full audit, user governance, exports, dashboard monitoring"],
            ]} />
            <p className="muted">This profile shows details for the currently logged-in user.</p>
          </div>
        ) : modal.rows ? (
          <div className="modal-table-wrap">
            <table data-testid="admin-dashboard-modal-user-list-table">
              <thead><tr><th>User ID</th><th>Name</th><th>Email</th><th>Status</th><th>Role</th></tr></thead>
              <tbody>
                {modal.rows.map((row: any, index: number) => (
                  <tr key={row.id} data-testid={`admin-dashboard-modal-user-row-${testIdSlug(row.id)}`}><td>{row.id}</td><td>{row.name}</td><td>{row.email}</td><td>{row.status}</td><td>{row.role}</td></tr>
                ))}
              </tbody>
            </table>
            {!modal.rows.length && <p className="practice-message">No users found for this category.</p>}
          </div>
        ) : (
          <div>
            <p>{modal.details}</p>
            {modal.type === "nested" && <button data-testid="admin-dashboard-open-child-modal-button" onClick={() => setNestedOpen(true)}>Open Child Modal</button>}
            {nestedOpen && <div className="nested-modal" data-testid="admin-dashboard-practice-child-modal"><strong>Nested Modal Level 2</strong><p>Child modal content for nested modal automation testing.</p></div>}
          </div>
        )}
      </div>
    </div>
  );
}

function DetailGrid({ rows }: any) {
  return <div className="detail-grid">{rows.map(([label, value]: string[]) => <div key={label}><span>{label}</span><strong>{value}</strong></div>)}</div>;
}
