import { useEffect, useMemo, useState } from "react";
import { BookOpen, Check, Copy, RotateCcw, Search, X } from "lucide-react";
import { useApp } from "../context/AppContext";

type LocatorCategory =
  | "All"
  | "Authentication"
  | "Navigation & Theme"
  | "Admin Dashboard"
  | "User Management"
  | "Dynamic Web Tables"
  | "Automation Lab";

interface LocatorEntry {
  module: Exclude<LocatorCategory, "All">;
  element: string;
  testId: string;
  description: string;
}

const LOCATOR_ENTRIES: LocatorEntry[] = [
  // Authentication
  { module: "Authentication", element: "Email Input", testId: "email-input", description: "Login form email field" },
  { module: "Authentication", element: "Password Input", testId: "password-input", description: "Login form password field" },
  { module: "Authentication", element: "Sign In Button", testId: "login-button", description: "Submits login credentials" },
  { module: "Authentication", element: "Login Error Alert", testId: "error-alert", description: "Validation or auth failure banner" },
  { module: "Authentication", element: "Quick Fill Super Admin", testId: "fill-superadmin-btn", description: "One-click credential fill for Super Admin" },
  { module: "Authentication", element: "Quick Fill Admin", testId: "fill-admin-btn", description: "One-click credential fill for Admin User" },
  { module: "Authentication", element: "Quick Fill Test User", testId: "fill-user-btn", description: "One-click credential fill for Test User" },

  // Navigation & Theme
  { module: "Navigation & Theme", element: "Sidebar Navigation", testId: "sidebar", description: "Fixed left navigation menu panel" },
  { module: "Navigation & Theme", element: "Sidebar Collapse Toggle", testId: "sidebar-toggle-btn", description: "Expands or collapses left sidebar" },
  { module: "Navigation & Theme", element: "Home Nav Link", testId: "nav-home", description: "Navigates to Dashboard Home" },
  { module: "Navigation & Theme", element: "User Management Nav Link", testId: "nav-user-management", description: "Navigates to User Management" },
  { module: "Navigation & Theme", element: "Automation Lab Nav Link", testId: "nav-automation-lab", description: "Navigates to Automation Lab" },
  { module: "Navigation & Theme", element: "Dynamic Tables Nav Link", testId: "nav-dynamic-tables", description: "Navigates to Dynamic Web Tables" },
  { module: "Navigation & Theme", element: "Theme Dropdown Trigger", testId: "theme-select", description: "Opens System / Light / Dark theme menu" },
  { module: "Navigation & Theme", element: "QA Guide Button", testId: "qa-guide-open-btn", description: "Opens the QA Test Guide & Locators modal" },
  { module: "Navigation & Theme", element: "Logout Button", testId: "topbar-logout-button", description: "Ends current user session" },
  { module: "Navigation & Theme", element: "Toast Notification", testId: "toast-message", description: "Global bottom-right toast notification banner" },

  // Admin Dashboard
  { module: "Admin Dashboard", element: "Export CSV Action", testId: "admin-dashboard-export-csv-button", description: "Downloads user table as CSV" },
  { module: "Admin Dashboard", element: "Export Excel Action", testId: "admin-dashboard-export-excel-button", description: "Downloads user table as Excel" },
  { module: "Admin Dashboard", element: "Export PDF Action", testId: "admin-dashboard-export-pdf-button", description: "Opens printable PDF report" },
  { module: "Admin Dashboard", element: "Total Users Card", testId: "admin-dashboard-total-users-card", description: "Summary counter for total users" },
  { module: "Admin Dashboard", element: "Activity Search Input", testId: "admin-dashboard-activity-search-input", description: "Filters recent session activity stream" },
  { module: "Admin Dashboard", element: "Recent Activity Table", testId: "admin-dashboard-recent-activity-table", description: "Session activity audit table" },
  { module: "Admin Dashboard", element: "System Logs Table", testId: "admin-dashboard-system-logs-table", description: "Runtime system logs table" },
  { module: "Admin Dashboard", element: "Login Attempts Table", testId: "admin-dashboard-login-attempts-table", description: "Authentication history table" },

  // User Management
  { module: "User Management", element: "Search Users Input", testId: "user-management-search-input", description: "Filters users by name or email" },
  { module: "User Management", element: "Exact Match Radio", testId: "user-management-search-mode-exact-radio", description: "Sets search mode to Exact Match" },
  { module: "User Management", element: "Partial Match Radio", testId: "user-management-search-mode-partial-radio", description: "Sets search mode to Partial Match" },
  { module: "User Management", element: "Starts With Radio", testId: "user-management-search-mode-starts-radio", description: "Sets search mode to Starts With" },
  { module: "User Management", element: "Active Only Checkbox", testId: "user-management-active-only-filter-checkbox", description: "Filters for active users" },
  { module: "User Management", element: "Create User Button", testId: "user-management-create-user-button", description: "Opens Create User modal" },
  { module: "User Management", element: "Users Data Table", testId: "user-management-users-table", description: "Main user directory table" },
  { module: "User Management", element: "Page Size Dropdown", testId: "user-management-page-size-dropdown", description: "Selects rows per page" },

  // Dynamic Web Tables
  { module: "Dynamic Web Tables", element: "Global Search Input", testId: "table-global-search-input", description: "Searches ID, name, email, or role" },
  { module: "Dynamic Web Tables", element: "Status Filter Dropdown", testId: "table-status-filter-select", description: "Filters table by status (All/Active/Pending/Inactive)" },
  { module: "Dynamic Web Tables", element: "Advanced Search Input", testId: "table-advanced-search-input", description: "Targeted name/email filter using Search Mode" },
  { module: "Dynamic Web Tables", element: "Exact Match Radio", testId: "table-search-mode-exact-radio", description: "Exact match mode for advanced search" },
  { module: "Dynamic Web Tables", element: "Partial Match Radio", testId: "table-search-mode-partial-radio", description: "Partial match mode for advanced search" },
  { module: "Dynamic Web Tables", element: "Starts With Radio", testId: "table-search-mode-starts-radio", description: "Starts-with mode for advanced search" },
  { module: "Dynamic Web Tables", element: "Show Active Only", testId: "table-active-only-filter-checkbox", description: "Filters active table rows" },
  { module: "Dynamic Web Tables", element: "Recently Created", testId: "table-recently-created-filter-checkbox", description: "Filters records created within 7 days" },
  { module: "Dynamic Web Tables", element: "Never Logged In", testId: "table-never-logged-in-filter-checkbox", description: "Filters records with lastLogin = Never" },
  { module: "Dynamic Web Tables", element: "Locked Users", testId: "table-locked-users-filter-checkbox", description: "Filters locked records" },
  { module: "Dynamic Web Tables", element: "Export CSV Button", testId: "export-csv-btn", description: "Exports filtered table rows to CSV" },
  { module: "Dynamic Web Tables", element: "Export JSON Button", testId: "export-json-btn", description: "Exports filtered table rows to JSON" },
  { module: "Dynamic Web Tables", element: "Reset Data Button", testId: "reset-table-data-btn", description: "Restores default seed records and clears filters" },
  { module: "Dynamic Web Tables", element: "Dynamic Web Table", testId: "dynamic-web-table", description: "Sortable, inline-editable data table" },

  // Automation Lab
  { module: "Automation Lab", element: "Country Search Input", testId: "country-search-input", description: "Searchable autocomplete dropdown input" },
  { module: "Automation Lab", element: "Framework Dropdown", testId: "lab-dropdown-select", description: "Single-select custom dropdown menu" },
  { module: "Automation Lab", element: "Multi-Select Listbox", testId: "lab-multiselect", description: "Multi-selection options listbox" },
  { module: "Automation Lab", element: "Range Slider", testId: "lab-range-slider", description: "Interactive range threshold slider" },
  { module: "Automation Lab", element: "Async Loading Button", testId: "lab-loading-state-btn", description: "Triggers 1.5s loading state for explicit wait tests" },
  { module: "Automation Lab", element: "Custom Countdown Input", testId: "lab-custom-countdown-input", description: "Numeric countdown wait input (1–30s max validation)" },
  { module: "Automation Lab", element: "Start Countdown Button", testId: "lab-custom-countdown-btn", description: "Starts the live countdown timer" },
  { module: "Automation Lab", element: "Countdown Timer Display", testId: "lab-custom-countdown-timer", description: "Displays live remaining seconds ('Waiting... Xs remaining')" },
  { module: "Automation Lab", element: "Random Popup Trigger", testId: "lab-random-popup-btn", description: "Triggers a random alert modal and toast popup" },
  { module: "Automation Lab", element: "Random Popup Modal", testId: "lab-random-popup-modal", description: "Random popup dialog with severity badge and acknowledge button" },
  { module: "Automation Lab", element: "Live Inspector Panel", testId: "automation-lab-inspector-panel", description: "Real-time action and state inspector console" },
];

const CATEGORIES: LocatorCategory[] = [
  "All",
  "Authentication",
  "Navigation & Theme",
  "Admin Dashboard",
  "User Management",
  "Dynamic Web Tables",
  "Automation Lab",
];

interface QaGuideModalProps {
  open: boolean;
  onClose: () => void;
}

export default function QaGuideModal({ open, onClose }: QaGuideModalProps) {
  const { showToast } = useApp();
  const [category, setCategory] = useState<LocatorCategory>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  const filteredEntries = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return LOCATOR_ENTRIES.filter((entry) => {
      if (category !== "All" && entry.module !== category) return false;
      if (!q) return true;
      return (
        entry.element.toLowerCase().includes(q) ||
        entry.testId.toLowerCase().includes(q) ||
        entry.module.toLowerCase().includes(q) ||
        entry.description.toLowerCase().includes(q)
      );
    });
  }, [category, searchQuery]);

  if (!open) return null;

  function copySelector(testId: string) {
    const selector = `[data-testid="${testId}"]`;
    if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
      navigator.clipboard.writeText(selector).catch(() => {});
    }
    setCopiedId(testId);
    showToast(`Copied locator ${selector}`, "info");
    window.setTimeout(() => {
      setCopiedId((prev) => (prev === testId ? null : prev));
    }, 1500);
  }

  function resetGuideFilters() {
    setCategory("All");
    setSearchQuery("");
    showToast("QA Guide filters reset", "info");
  }

  return (
    <div
      className="modal-backdrop qa-guide-backdrop"
      data-testid="qa-guide-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="modal qa-guide-modal"
        data-testid="qa-guide-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="qa-guide-title"
      >
        <div className="qa-guide-header">
          <div className="qa-guide-title-group">
            <span className="qa-guide-badge">
              <BookOpen size={18} />
            </span>
            <div>
              <h2 id="qa-guide-title">QA Test Guide &amp; Locators</h2>
              <p className="muted">
                Reference cheat sheet of stable <code>data-testid</code> selectors for Playwright, Cypress, and Selenium.
              </p>
            </div>
          </div>
          <button
            type="button"
            className="modal-close"
            data-testid="qa-guide-close-btn"
            aria-label="Close QA Guide"
            onClick={onClose}
          >
            <X size={16} />
          </button>
        </div>

        <div className="qa-guide-controls">
          <div className="qa-guide-categories" role="tablist" aria-label="Locator categories">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                role="tab"
                aria-selected={category === cat}
                data-testid={`qa-guide-tab-${cat.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
                className={`qa-guide-tab${category === cat ? " active" : ""}`}
                onClick={() => setCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="qa-guide-search-row">
            <div className="table-search-input-wrapper" style={{ maxWidth: "100%", flex: 1 }}>
              <span className="table-search-input-icon">
                <Search size={16} />
              </span>
              <input
                className="table-search-input"
                data-testid="qa-guide-search-input"
                placeholder="Search locator, element, or module (press Enter to filter, Esc to clear)..."
                value={searchQuery}
                style={{ paddingLeft: "42px" }}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    showToast(`Showing ${filteredEntries.length} matching locator(s)`, "info");
                  } else if (e.key === "Escape" && searchQuery) {
                    e.stopPropagation();
                    setSearchQuery("");
                  }
                }}
              />
            </div>
            {(category !== "All" || searchQuery.trim() !== "") && (
              <button
                type="button"
                className="qa-guide-reset-btn"
                data-testid="qa-guide-reset-filters-btn"
                onClick={resetGuideFilters}
              >
                <RotateCcw size={14} /> Reset Filters
              </button>
            )}
          </div>
        </div>

        <div className="modal-table-wrap qa-guide-table-wrap">
          {filteredEntries.length === 0 ? (
            <div className="empty-state-box" data-testid="qa-guide-empty-state">
              <p>No matching records found for your locator search.</p>
              <button
                type="button"
                className="empty-reset-btn"
                data-testid="qa-guide-empty-reset-btn"
                onClick={resetGuideFilters}
              >
                <RotateCcw size={14} /> Reset Filters
              </button>
            </div>
          ) : (
            <table data-testid="qa-guide-locators-table">
              <thead>
                <tr>
                  <th>Module</th>
                  <th>Element</th>
                  <th>data-testid</th>
                  <th>CSS / Playwright Selector</th>
                  <th>Purpose</th>
                  <th style={{ textAlign: "right" }}>Copy</th>
                </tr>
              </thead>
              <tbody>
                {filteredEntries.map((item) => {
                  const selector = `[data-testid="${item.testId}"]`;
                  const isCopied = copiedId === item.testId;
                  return (
                    <tr key={`${item.module}-${item.testId}`} data-testid={`qa-guide-row-${item.testId}`}>
                      <td>
                        <span className="qa-module-pill">{item.module}</span>
                      </td>
                      <td>
                        <strong>{item.element}</strong>
                      </td>
                      <td>
                        <code className="qa-code-chip">{item.testId}</code>
                      </td>
                      <td>
                        <code className="qa-code-chip selector">{selector}</code>
                      </td>
                      <td className="wide-cell">{item.description}</td>
                      <td style={{ textAlign: "right" }}>
                        <button
                          type="button"
                          className="qa-copy-btn"
                          data-testid={`qa-guide-copy-${item.testId}`}
                          onClick={() => copySelector(item.testId)}
                          title={`Copy ${selector}`}
                        >
                          {isCopied ? <Check size={14} /> : <Copy size={14} />}
                          <span>{isCopied ? "Copied" : "Copy"}</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

