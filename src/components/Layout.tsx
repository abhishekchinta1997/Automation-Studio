import { useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { Home, Users, FlaskConical, Sun, Moon, LogOut } from "lucide-react";

export default function Layout() {
  const { currentUser, logout, darkMode, toggleDarkMode, toast } = useApp();
  const navigate = useNavigate();
  const isAdmin = currentUser?.role === "Admin User" || currentUser?.role === "Super User";
  const [sidebarVisible, setSidebarVisible] = useState(true);

  function handleLogout() {
    logout();
    navigate("/login");
  }

  const navItems = [
    {
      label: "Home",
      icon: <Home size={20} />,
      to: isAdmin ? "/admin" : "/test-user",
      testId: "nav-home",
      end: true,
    },
    {
      label: isAdmin ? "User Management" : "Admin Management",
      icon: <Users size={20} />,
      to: "/admin/users",
      testId: isAdmin ? "nav-user-management" : "nav-blocked-admin",
    },
    {
      label: "Automation Lab",
      icon: <FlaskConical size={20} />,
      to: isAdmin ? "/admin/lab" : "/lab",
      testId: "nav-automation-lab",
    },
  ];

  return (
    <div className="shell" data-testid="app-shell" style={{ display: "flex", minHeight: "100vh" }}>
      {toast && (
        <div className={`toast ${toast.type}`} data-testid="toast-message">
          {toast.message}
        </div>
      )}

      <aside className={sidebarVisible ? "sidebar expanded" : "sidebar collapsed"} data-testid="sidebar" style={{ display: "flex", flexDirection: "column" }}>
        {/* Toggle Button at top of sidebar */}
        <button
          className="sidebar-toggle-btn-modern"
          data-testid="sidebar-toggle-btn"
          title={sidebarVisible ? "Collapse Menu" : "Expand Menu"}
          onClick={() => setSidebarVisible(!sidebarVisible)}
          style={{
            background: "rgba(255, 255, 255, 0.1)",
            color: "#ffffff",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            padding: "12px 14px",
            borderRadius: "10px",
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            cursor: "pointer",
            fontSize: "14px",
            marginBottom: "16px",
            width: "100%",
            whiteSpace: "nowrap",
          }}
        >
          <span>{sidebarVisible ? "☰ Menu" : "☰"}</span>
        </button>

        {/* Navigation items with icons and tooltips */}
        {navItems.map((item) => (
          <NavLink
            key={item.label}
            end={item.end}
            data-testid={item.testId}
            to={item.to}
            title={!sidebarVisible ? item.label : undefined}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: sidebarVisible ? "14px 16px" : "14px",
              justifyContent: sidebarVisible ? "flex-start" : "center",
              borderRadius: "12px",
              color: "white",
              textDecoration: "none",
              transition: "0.2s",
              marginBottom: "8px",
            }}
          >
            <span style={{ display: "flex", alignItems: "center", justifyContent: "center", minWidth: "24px" }}>
              {item.icon}
            </span>
            {sidebarVisible && (
              <span style={{ whiteSpace: "nowrap", fontSize: "15px", fontWeight: 500 }}>
                {item.label}
              </span>
            )}
          </NavLink>
        ))}
      </aside>

      <section className="main-area" style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
        <header className="topbar" data-testid="top-navbar" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 24px", borderBottom: darkMode ? "1px solid #27272a" : "1px solid #e6ebf3" }}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <Link
              to={isAdmin ? "/admin" : "/test-user"}
              data-testid="topbar-brand-link"
              style={{
                fontWeight: 800,
                fontSize: "18px",
                color: darkMode ? "#f8fafc" : "#172033",
                textDecoration: "none",
                cursor: "pointer",
              }}
            >
              Automation Studio
            </Link>
          </div>

          <div className="topbar-actions" style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <button
              className="theme-toggle-button"
              data-testid="dark-mode-toggle"
              onClick={toggleDarkMode}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "8px 14px",
                borderRadius: "8px",
                fontWeight: 600,
                fontSize: "14px",
                cursor: "pointer",
                background: darkMode ? "rgba(255, 255, 255, 0.1)" : "#f3f4f6",
                color: darkMode ? "#ffffff" : "#1f2937",
                border: darkMode ? "1px solid rgba(255, 255, 255, 0.2)" : "1px solid #e5e7eb",
              }}
            >
              {darkMode ? <Sun size={16} color="#ffffff" /> : <Moon size={16} color="#1f2937" />}
              <span style={{ color: darkMode ? "#ffffff" : "#1f2937" }}>{darkMode ? "Light Mode" : "Dark Mode"}</span>
            </button>

            <button
              className="topbar-logout-button"
              data-testid="topbar-logout-button"
              onClick={handleLogout}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                background: "linear-gradient(135deg, #7c3aed, #9333ea)",
                color: "#ffffff",
                border: "none",
                borderRadius: "8px",
                padding: "8px 14px",
                fontSize: "14px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              <LogOut size={16} color="#ffffff" />
              <span style={{ color: "#ffffff" }}>Logout</span>
            </button>
          </div>
        </header>

        <main className="page" style={{ flex: 1, padding: "24px" }}>
          <Outlet />
        </main>

        <footer className="app-footer" style={{ borderTop: darkMode ? "1px solid #27272a" : "1px solid #e6ebf3", padding: "16px 24px", textAlign: "center", fontSize: "13px", color: darkMode ? "#9ca3af" : "#667085", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", background: darkMode ? "#172033" : "#ffffff" }}>
          <span>© 2026 Automation Studio · Developed by Abhishek Chinta</span>
          <a
            href="https://github.com/abhishekchinta1997/"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "inherit", display: "flex", alignItems: "center", transition: "color 0.2s" }}
            title="GitHub Profile"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"></path><path d="M9 18c-4.51 2-5-2-7-2"></path></svg>
          </a>
        </footer>
      </section>
    </div>
  );
}
