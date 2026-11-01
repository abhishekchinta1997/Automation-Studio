import { useState, useMemo, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { Table, Search, Download, Edit2, Save, X, ChevronUp, ChevronDown, CheckCircle, AlertCircle, Clock, RotateCcw } from "lucide-react";
import { DynamicRecord, DynamicRecordStatus, TableSortKey, TableSortDirection } from "../types/table";
import { initialDynamicRecords } from "../data/dynamicRecords";
import { recordsToCSV, downloadFile, compareDynamicRecords } from "../utils/tableExport";

const RECORDS_STORAGE_KEY = "automation-dynamic-records";
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const VALID_STATUSES: DynamicRecordStatus[] = ["Active", "Pending", "Inactive"];

function isDynamicRecord(value: unknown): value is DynamicRecord {
  if (!value || typeof value !== "object") return false;
  const r = value as Record<string, unknown>;
  return (
    typeof r.id === "string" &&
    typeof r.name === "string" &&
    typeof r.email === "string" &&
    typeof r.role === "string" &&
    typeof r.joinDate === "string" &&
    VALID_STATUSES.includes(r.status as DynamicRecordStatus)
  );
}

function loadRecords(): DynamicRecord[] {
  try {
    const saved = localStorage.getItem(RECORDS_STORAGE_KEY);
    if (saved) {
      const parsed: unknown = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0 && parsed.every(isDynamicRecord)) return parsed;
    }
  } catch (e) {
    // corrupt storage: fall back to seed data
  }
  return initialDynamicRecords;
}

export default function DynamicTablesPage() {
  const { showToast, darkMode } = useApp();

  const [records, setRecords] = useState<DynamicRecord[]>(loadRecords);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [sortKey, setSortKey] = useState<TableSortKey>("id");
  const [sortDirection, setSortDirection] = useState<TableSortDirection>("asc");
  const [pageSize, setPageSize] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Inline editing state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<DynamicRecord>({
    id: "",
    name: "",
    email: "",
    role: "",
    status: "Active",
    joinDate: "",
  });
  const [editError, setEditError] = useState<string>("");

  // Persist records so edits survive a reload (cleared via the Reset Data button)
  useEffect(() => {
    localStorage.setItem(RECORDS_STORAGE_KEY, JSON.stringify(records));
  }, [records]);

  // Handle Sorting (always return to the first page so the result is predictable)
  function handleSort(key: TableSortKey) {
    if (sortKey === key) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }
    setCurrentPage(1);
  }

  // Filter and Sort Data
  const filteredRecords = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return records
      .filter((rec) => {
        const matchesSearch =
          rec.id.toLowerCase().includes(query) ||
          rec.name.toLowerCase().includes(query) ||
          rec.email.toLowerCase().includes(query) ||
          rec.role.toLowerCase().includes(query);

        const matchesStatus = statusFilter === "All" || rec.status === statusFilter;

        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => compareDynamicRecords(a, b, sortKey, sortDirection));
  }, [records, searchQuery, statusFilter, sortKey, sortDirection]);

  // Pagination (clamp so deleting/filtering can never leave us on a page that no longer exists)
  const totalPages = Math.max(1, Math.ceil(filteredRecords.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedRecords = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return filteredRecords.slice(start, start + pageSize);
  }, [filteredRecords, safePage, pageSize]);

  // Drop an in-progress edit if its row is no longer visible (page, sort or filter changed)
  useEffect(() => {
    if (editingId && !paginatedRecords.some((r) => r.id === editingId)) {
      setEditingId(null);
      setEditError("");
    }
  }, [paginatedRecords, editingId]);

  function startEdit(rec: DynamicRecord) {
    setEditingId(rec.id);
    setEditForm(rec);
    setEditError("");
  }

  function cancelEdit() {
    setEditingId(null);
    setEditError("");
  }

  function saveEdit(id: string) {
    const name = editForm.name.trim();
    const email = editForm.email.trim();
    const role = editForm.role.trim();

    if (!name) return setEditError("Name is required");
    if (!email) return setEditError("Email is required");
    if (!EMAIL_PATTERN.test(email)) return setEditError("Enter a valid email address");
    if (!role) return setEditError("Role is required");
    if (!editForm.joinDate) return setEditError("Join date is required");
    if (records.some((r) => r.id !== id && r.email.toLowerCase() === email.toLowerCase())) {
      return setEditError("Email already exists");
    }

    const updated: DynamicRecord = { ...editForm, id, name, email, role };
    setRecords((prev) => prev.map((r) => (r.id === id ? updated : r)));
    setEditingId(null);
    setEditError("");
    showToast(`Updated record ${id} successfully`, "success");
  }

  function resetData() {
    setRecords(initialDynamicRecords);
    setSearchQuery("");
    setStatusFilter("All");
    setSortKey("id");
    setSortDirection("asc");
    setCurrentPage(1);
    cancelEdit();
    showToast("Table data reset to defaults", "info");
  }

  // Export CSV (exports the full filtered/sorted set, not just the current page)
  function exportCSV() {
    downloadFile(recordsToCSV(filteredRecords), "dynamic_web_tables_export.csv", "text/csv");
    showToast(`Exported ${filteredRecords.length} record(s) to CSV successfully!`, "success");
  }

  // Export JSON
  function exportJSON() {
    downloadFile(JSON.stringify(filteredRecords, null, 2), "dynamic_web_tables_export.json", "application/json");
    showToast(`Exported ${filteredRecords.length} record(s) to JSON successfully!`, "success");
  }

  function ariaSortFor(key: TableSortKey): "ascending" | "descending" | "none" {
    if (sortKey !== key) return "none";
    return sortDirection === "asc" ? "ascending" : "descending";
  }

  return (
    <div className="dynamic-tables-page" data-testid="dynamic-tables-page">
      <div className="between dynamic-tables-header">
        <div>
          <h1 className="dynamic-tables-title">
            <Table size={28} color="#6366f1" /> Dynamic Web Tables
          </h1>
          <p className="muted dynamic-tables-subtitle">
            Advanced data grid with instant search, multi-column sorting, pagination, inline editing, and robust test locators.
          </p>
        </div>

        <div className="actions" style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <button
            data-testid="reset-table-data-btn"
            onClick={resetData}
            title="Restore the original sample records"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              background: "transparent",
              color: darkMode ? "#94a3b8" : "#64748b",
              fontWeight: 600,
              padding: "10px 16px",
              borderRadius: "12px",
              cursor: "pointer",
              border: darkMode ? "1px solid #334155" : "1px solid #cbd5e1",
            }}
          >
            <RotateCcw size={16} /> Reset Data
          </button>
          <button
            data-testid="export-csv-btn"
            onClick={exportCSV}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              background: "#6366f1",
              color: "#ffffff",
              fontWeight: 600,
              padding: "10px 16px",
              borderRadius: "12px",
              cursor: "pointer",
            }}
          >
            <Download size={16} /> Export CSV
          </button>
          <button
            data-testid="export-json-btn"
            onClick={exportJSON}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              background: darkMode ? "#334155" : "#e2e8f0",
              color: darkMode ? "#f8fafc" : "#1e293b",
              fontWeight: 600,
              padding: "10px 16px",
              borderRadius: "12px",
              cursor: "pointer",
              border: darkMode ? "1px solid #475569" : "1px solid #cbd5e1",
            }}
          >
            <Download size={16} /> Export JSON
          </button>
        </div>
      </div>

      {/* Toolbar / Search & Filter Controls */}
      <div
        className="card"
        data-testid="tables-toolbar-card"
        style={{
          background: darkMode ? "#1e293b" : "#ffffff",
          border: darkMode ? "1px solid #334155" : "1px solid #e2e8f0",
          borderRadius: "16px",
          padding: "18px 24px",
          marginBottom: "20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px", flex: 1, minWidth: "280px" }}>
          <div className="table-search-input-wrapper">
            <span className="table-search-input-icon">
              <Search size={18} />
            </span>
            <input
              className="table-search-input"
              data-testid="table-global-search-input"
              placeholder="Search ID, name, email, role..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>

          <select
            data-testid="table-status-filter-select"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            style={{
              width: "160px",
              backgroundColor: darkMode ? "#0f172a" : "#ffffff",
              color: darkMode ? "#f1f5f9" : "#0f172a",
              border: darkMode ? "1px solid #334155" : "1px solid #cbd5e1",
              borderRadius: "12px",
              padding: "10px 40px 10px 14px",
            }}
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Pending">Pending</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ fontSize: "13px", fontWeight: 600, color: darkMode ? "#94a3b8" : "#64748b" }}>Show:</span>
          <select
            data-testid="table-page-size-select"
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
            style={{
              width: "115px",
              backgroundColor: darkMode ? "#0f172a" : "#ffffff",
              color: darkMode ? "#f1f5f9" : "#0f172a",
              border: darkMode ? "1px solid #334155" : "1px solid #cbd5e1",
              borderRadius: "12px",
              padding: "8px 36px 8px 12px",
            }}
          >
            <option value={5}>5 rows</option>
            <option value={10}>10 rows</option>
            <option value={25}>25 rows</option>
          </select>
          <span style={{ fontSize: "13px", color: darkMode ? "#94a3b8" : "#64748b", fontWeight: 500 }} data-testid="table-record-count-label">
            ({filteredRecords.length} total)
          </span>
        </div>
      </div>

      {/* Main Table View */}
      <div
        className="table-wrap"
        data-testid="dynamic-web-table-container"
        style={{
          background: darkMode ? "#1e293b" : "#ffffff",
          border: darkMode ? "1px solid #334155" : "1px solid #e6ebf3",
          borderRadius: "16px",
          overflowX: "auto",
          boxShadow: darkMode ? "0 10px 30px rgba(0,0,0,0.3)" : "0 10px 30px rgba(15, 23, 42, 0.06)",
        }}
      >
        <table data-testid="dynamic-web-table">
          <thead>
            <tr>
              <th data-testid="sort-header-id" aria-sort={ariaSortFor("id")} onClick={() => handleSort("id")} style={{ cursor: "pointer", userSelect: "none" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span>User ID</span>
                  {sortKey === "id" && (sortDirection === "asc" ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
                </div>
              </th>
              <th data-testid="sort-header-name" aria-sort={ariaSortFor("name")} onClick={() => handleSort("name")} style={{ cursor: "pointer", userSelect: "none" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span>Full Name & Email</span>
                  {sortKey === "name" && (sortDirection === "asc" ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
                </div>
              </th>
              <th data-testid="sort-header-role" aria-sort={ariaSortFor("role")} onClick={() => handleSort("role")} style={{ cursor: "pointer", userSelect: "none" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span>Role / Title</span>
                  {sortKey === "role" && (sortDirection === "asc" ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
                </div>
              </th>
              <th data-testid="sort-header-status" aria-sort={ariaSortFor("status")} onClick={() => handleSort("status")} style={{ cursor: "pointer", userSelect: "none" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span>Status</span>
                  {sortKey === "status" && (sortDirection === "asc" ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
                </div>
              </th>
              <th data-testid="sort-header-joindate" aria-sort={ariaSortFor("joinDate")} onClick={() => handleSort("joinDate")} style={{ cursor: "pointer", userSelect: "none" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span>Join Date</span>
                  {sortKey === "joinDate" && (sortDirection === "asc" ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
                </div>
              </th>
              <th data-testid="sort-header-actions" style={{ textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody data-testid="table-body">
            {paginatedRecords.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: "center", padding: "40px", color: darkMode ? "#94a3b8" : "#64748b" }} data-testid="table-empty-state">
                  No matching records found. Try adjusting your search query or filter.
                </td>
              </tr>
            ) : (
              paginatedRecords.map((rec) => {
                const isEditing = editingId === rec.id;
                return (
                  <tr key={rec.id} data-testid={`table-row-${rec.id}`}>
                    <td data-testid={`cell-id-${rec.id}`} style={{ fontWeight: 600, color: darkMode ? "#f8fafc" : "#0f172a" }}>
                      {rec.id}
                    </td>

                    <td data-testid={`cell-name-${rec.id}`}>
                      {isEditing ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                          <input
                            data-testid={`edit-input-name-${rec.id}`}
                            value={editForm.name}
                            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                            style={{ padding: "6px 10px", borderRadius: "8px", fontSize: "13px" }}
                          />
                          <input
                            data-testid={`edit-input-email-${rec.id}`}
                            value={editForm.email}
                            onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                            style={{ padding: "6px 10px", borderRadius: "8px", fontSize: "13px" }}
                          />
                          {editError && (
                            <div
                              role="alert"
                              data-testid={`edit-error-${rec.id}`}
                              style={{ fontSize: "12px", fontWeight: 600, color: darkMode ? "#f87171" : "#b91c1c" }}
                            >
                              {editError}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div>
                          <div style={{ fontWeight: 600, color: darkMode ? "#f8fafc" : "#0f172a" }}>{rec.name}</div>
                          <div style={{ fontSize: "12px", color: darkMode ? "#94a3b8" : "#64748b" }}>{rec.email}</div>
                        </div>
                      )}
                    </td>

                    <td data-testid={`cell-role-${rec.id}`}>
                      {isEditing ? (
                        <input
                          data-testid={`edit-input-role-${rec.id}`}
                          value={editForm.role}
                          onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                          style={{ padding: "6px 10px", borderRadius: "8px", fontSize: "13px" }}
                        />
                      ) : (
                        <span style={{ fontWeight: 500 }}>{rec.role}</span>
                      )}
                    </td>

                    <td data-testid={`cell-status-${rec.id}`}>
                      {isEditing ? (
                        <select
                          data-testid={`edit-select-status-${rec.id}`}
                          value={editForm.status}
                          onChange={(e) => setEditForm({ ...editForm, status: e.target.value as DynamicRecordStatus })}
                          style={{ padding: "6px 34px 6px 10px", borderRadius: "8px", fontSize: "13px" }}
                        >
                          <option value="Active">Active</option>
                          <option value="Pending">Pending</option>
                          <option value="Inactive">Inactive</option>
                        </select>
                      ) : (
                        <span
                          className={`pill ${rec.status}`}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px",
                            padding: "4px 10px",
                            borderRadius: "20px",
                            fontSize: "12px",
                            fontWeight: 600,
                            background:
                              rec.status === "Active"
                                ? darkMode ? "rgba(16, 185, 129, 0.2)" : "#dcfce7"
                                : rec.status === "Pending"
                                ? darkMode ? "rgba(245, 158, 11, 0.2)" : "#fef3c7"
                                : darkMode ? "rgba(239, 68, 68, 0.2)" : "#fee2e2",
                            color:
                              rec.status === "Active"
                                ? darkMode ? "#34d399" : "#16703a"
                                : rec.status === "Pending"
                                ? darkMode ? "#fbbf24" : "#b45309"
                                : darkMode ? "#f87171" : "#b91c1c",
                          }}
                        >
                          {rec.status === "Active" && <CheckCircle size={12} />}
                          {rec.status === "Pending" && <Clock size={12} />}
                          {rec.status === "Inactive" && <AlertCircle size={12} />}
                          {rec.status}
                        </span>
                      )}
                    </td>

                    <td data-testid={`cell-joindate-${rec.id}`} style={{ color: darkMode ? "#94a3b8" : "#64748b", fontSize: "13px" }}>
                      {isEditing ? (
                        <input
                          type="date"
                          data-testid={`edit-input-joindate-${rec.id}`}
                          value={editForm.joinDate}
                          onChange={(e) => setEditForm({ ...editForm, joinDate: e.target.value })}
                          style={{ padding: "6px 10px", borderRadius: "8px", fontSize: "13px" }}
                        />
                      ) : (
                        rec.joinDate
                      )}
                    </td>

                    <td style={{ textAlign: "right" }}>
                      {isEditing ? (
                        <div style={{ display: "flex", gap: "6px", justifyContent: "flex-end" }}>
                          <button
                            data-testid={`save-btn-${rec.id}`}
                            onClick={() => saveEdit(rec.id)}
                            style={{ background: "#10b981", color: "white", padding: "6px 10px", borderRadius: "8px", display: "flex", alignItems: "center", gap: "4px", fontSize: "12px" }}
                            title="Save Changes"
                          >
                            <Save size={14} /> Save
                          </button>
                          <button
                            data-testid={`cancel-btn-${rec.id}`}
                            onClick={cancelEdit}
                            style={{ background: darkMode ? "#475569" : "#cbd5e1", color: darkMode ? "white" : "#1e293b", padding: "6px 10px", borderRadius: "8px", display: "flex", alignItems: "center", gap: "4px", fontSize: "12px" }}
                            title="Cancel"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ) : (
                        <button
                          data-testid={`edit-btn-${rec.id}`}
                          onClick={() => startEdit(rec)}
                          style={{ background: "rgba(99, 102, 241, 0.15)", color: "#6366f1", padding: "6px 12px", borderRadius: "8px", display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "12px", fontWeight: 600 }}
                          title="Edit Row"
                        >
                          <Edit2 size={14} /> Edit
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div
        className="pagination"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: "16px",
          padding: "0 4px",
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        <div style={{ fontSize: "13px", color: darkMode ? "#94a3b8" : "#64748b" }} data-testid="pagination-summary">
          Showing {filteredRecords.length === 0 ? 0 : (safePage - 1) * pageSize + 1} to{" "}
          {Math.min(safePage * pageSize, filteredRecords.length)} of {filteredRecords.length} records
        </div>

        <div className="pagination-controls" data-testid="pagination-controls" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <button
            data-testid="pagination-prev"
            disabled={safePage === 1}
            onClick={() => setCurrentPage(Math.max(safePage - 1, 1))}
            style={{
              padding: "8px 14px",
              borderRadius: "10px",
              background: darkMode ? "#1e293b" : "#ffffff",
              border: darkMode ? "1px solid #334155" : "1px solid #cbd5e1",
              color: darkMode ? "#f8fafc" : "#1e293b",
              fontWeight: 600,
              fontSize: "13px",
            }}
          >
            Previous
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
            <button
              key={num}
              data-testid={`pagination-page-${num}`}
              aria-current={safePage === num ? "page" : undefined}
              onClick={() => setCurrentPage(num)}
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "10px",
                background: safePage === num ? "#6366f1" : darkMode ? "#1e293b" : "#ffffff",
                border: safePage === num ? "1px solid #6366f1" : darkMode ? "1px solid #334155" : "1px solid #cbd5e1",
                color: safePage === num ? "#ffffff" : darkMode ? "#f8fafc" : "#1e293b",
                fontWeight: 700,
                fontSize: "13px",
                cursor: "pointer",
              }}
            >
              {num}
            </button>
          ))}

          <button
            data-testid="pagination-next"
            disabled={safePage === totalPages}
            onClick={() => setCurrentPage(Math.min(safePage + 1, totalPages))}
            style={{
              padding: "8px 14px",
              borderRadius: "10px",
              background: darkMode ? "#1e293b" : "#ffffff",
              border: darkMode ? "1px solid #334155" : "1px solid #cbd5e1",
              color: darkMode ? "#f8fafc" : "#1e293b",
              fontWeight: 600,
              fontSize: "13px",
            }}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
