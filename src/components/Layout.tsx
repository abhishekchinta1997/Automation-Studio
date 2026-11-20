import { useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import ThemeSelect from "./ThemeSelect";
import QaGuideModal from "./QaGuideModal";
import FeedbackModal from "./FeedbackModal";
import { Home, Users, FlaskConical, Table, LogOut, BookOpen, MessageSquare, PanelLeftClose, PanelLeftOpen, Terminal, FileCode2 } from "lucide-react";

export default function Layout() {
  const { currentUser, logout, specMode, setSpecMode, showToast } = useApp();
  const navigate = useNavigate();
  const isAdmin = currentUser?.role === "Admin User" || currentUser?.role === "Super User";
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [qaGuideOpen, setQaGuideOpen] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  function handleLogout() {
    logout();
    navigate("/login");
  }

  const navItems = [
    {
      label: "Home",
      icon: <Home size={16} strokeWidth={1.75} />,
      to: isAdmin ? "/admin" : "/test-user",
      testId: "nav-home",
      end: true,
    },
    {
      label: isAdmin ? "User Management" : "Admin Management",
      icon: <Users size={16} strokeWidth={1.75} />,
      to: "/admin/users",
      testId: isAdmin ? "nav-user-management" : "nav-blocked-admin",
    },
    {
      label: "Automation Lab",
      icon: <FlaskConical size={16} strokeWidth={1.75} />,
      to: isAdmin ? "/admin/lab" : "/lab",
      testId: "nav-automation-lab",
    },
    {
      label: "Dynamic Web Tables",
      icon: <Table size={16} strokeWidth={1.75} />,
      to: isAdmin ? "/admin/tables" : "/tables",
      testId: "nav-dynamic-tables",
    },
  ];

  return (
    <div className="shell" data-testid="app-shell">
      <aside
        className={sidebarVisible ? "sidebar expanded" : "sidebar collapsed"}
        data-testid="sidebar"
      >
        <button
          className="sidebar-toggle-btn-modern"
          data-testid="sidebar-toggle-btn"
          title={sidebarVisible ? "Collapse Menu" : "Expand Menu"}
          onClick={() => setSidebarVisible(!sidebarVisible)}
        >
          {sidebarVisible ? <PanelLeftClose size={16} strokeWidth={1.75} /> : <PanelLeftOpen size={16} strokeWidth={1.75} />}
          {sidebarVisible && <span>Collapse Nav</span>}
        </button>

        {sidebarVisible && (
          <div className="sidebar-section-label">Workbench</div>
        )}

        {navItems.map((item) => (
          <NavLink
            key={item.label}
            end={item.end}
            data-testid={item.testId}
            to={item.to}
            title={!sidebarVisible ? item.label : undefined}
            className={({ isActive }) => `sidebar-nav-link${isActive ? " active" : ""}`}
          >
            <span className="sidebar-nav-icon">
              {item.icon}
            </span>
            {sidebarVisible && (
              <span className="sidebar-nav-label">
                {item.label}
              </span>
            )}
          </NavLink>
        ))}

        {sidebarVisible && currentUser && (
          <div className="sidebar-session-meta">
            <div className="sidebar-session-dot" />
            <div className="sidebar-session-info">
              <span className="sidebar-session-role">{currentUser.role}</span>
              <code className="sidebar-session-email">{currentUser.email}</code>
            </div>
          </div>
        )}
      </aside>

      <section
        className={sidebarVisible ? "main-area" : "main-area sidebar-collapsed"}
      >
        <header className="topbar" data-testid="top-navbar">
          <div className="topbar-brand-group">
            <Link
              to={isAdmin ? "/admin" : "/test-user"}
              data-testid="topbar-brand-link"
              className="topbar-brand-link"
            >
              <span className="topbar-brand-mark">
                <Terminal size={15} strokeWidth={2} />
              </span>
              <span>Automation Studio</span>
            </Link>
            <span className="topbar-env-badge">QA Sandbox · v1.0</span>
          </div>

          <div className="topbar-actions">
            <button
              type="button"
              className={`spec-mode-toggle-btn ${specMode ? "active" : ""}`}
              data-testid="spec-mode-toggle-btn"
              onClick={() => {
                setSpecMode(!specMode);
                showToast(
                  !specMode
                    ? "Spec Mode (Caveman) enabled: raw requirements active"
                    : "Standard View enabled: full guide descriptions active",
                  "info"
                );
              }}
              title="Toggle between Standard guide view and Caveman / Raw Spec mode"
            >
              <FileCode2 size={15} strokeWidth={1.75} />
              <span>{specMode ? "Caveman Spec" : "Standard View"}</span>
            </button>

            <button
              type="button"
              className="qa-guide-trigger-btn"
              data-testid="qa-guide-open-btn"
              onClick={() => setQaGuideOpen(true)}
            >
              <BookOpen size={15} strokeWidth={1.75} />
              <span>QA Guide</span>
            </button>

            <button
              type="button"
              className="feedback-trigger-btn"
              data-testid="feedback-open-btn"
              onClick={() => setFeedbackOpen(true)}
              title="Share your suggestions and feedback"
            >
              <MessageSquare size={15} strokeWidth={1.75} />
              <span>Feedback</span>
            </button>

            <ThemeSelect />

            <button
              className="topbar-logout-button"
              data-testid="topbar-logout-button"
              onClick={handleLogout}
            >
              <LogOut size={15} strokeWidth={2} />
              <span>Logout</span>
            </button>
          </div>
        </header>

        <main className="page">
          <Outlet />
        </main>

        <footer
          className="app-footer"
          data-testid="app-footer"
        >
          <div className="footer-inner">
            <span className="footer-copy">© 2026 Automation Studio · Built by Abhishek Chinta</span>
            <div className="footer-links-row">
              <a
                href="https://github.com/abhishekchinta1997/"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-profile-link"
                data-testid="footer-github-link"
                title="GitHub Profile"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                  <path d="M9 18c-4.51 2-5-2-7-2" />
                </svg>
                <span>GitHub</span>
              </a>
              <a
                href="https://www.linkedin.com/in/abhishekchinta1997/"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-profile-link"
                data-testid="footer-linkedin-link"
                title="LinkedIn Profile"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                  <rect width="4" height="12" x="2" y="9" />
                  <circle cx="4" cy="4" r="2" />
                </svg>
                <span>LinkedIn</span>
              </a>
              <a
                href="https://abhishekchinta.online/"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-profile-link"
                data-testid="footer-portfolio-link"
                title="Portfolio Website"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="2" y1="12" x2="22" y2="12" />
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                </svg>
                <span>Portfolio</span>
              </a>
            </div>
          </div>
        </footer>
      </section>

      <QaGuideModal open={qaGuideOpen} onClose={() => setQaGuideOpen(false)} />
      <FeedbackModal open={feedbackOpen} onClose={() => setFeedbackOpen(false)} />
    </div>
  );
}
