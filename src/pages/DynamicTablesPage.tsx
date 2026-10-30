import { useState, useMemo } from "react";
import { useApp } from "../context/AppContext";
import { Table, Search, Download, Edit2, Save, X, ChevronUp, ChevronDown, CheckCircle, AlertCircle, Clock } from "lucide-react";

type DynamicRecord = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: "Active" | "Pending" | "Inactive";
  joinDate: string;
};

const initialRecords: DynamicRecord[] = [
  { id: "REC-1001", name: "Alice Smith", email: "alice.smith@example.com", role: "Engineering Lead", status: "Active", joinDate: "2024-01-15" },
  { id: "REC-1002", name: "Bob Johnson", email: "bob.johnson@example.com", role: "DevOps Engineer", status: "Active", joinDate: "2024-02-10" },
  { id: "REC-1003", name: "Charlie Davis", email: "charlie.davis@example.com", role: "Product Manager", status: "Pending", joinDate: "2024-03-05" },
  { id: "REC-1004", name: "Diana Prince", email: "diana.prince@example.com", role: "Automation QA", status: "Active", joinDate: "2024-03-20" },
  { id: "REC-1005", name: "Ethan Hunt", email: "ethan.hunt@example.com", role: "Security Auditor", status: "Inactive", joinDate: "2024-04-11" },
  { id: "REC-1006", name: "Fiona Gallagher", email: "fiona.g@example.com", role: "Frontend Developer", status: "Active", joinDate: "2024-05-02" },
  { id: "REC-1007", name: "George Clark", email: "george.clark@example.com", role: "Backend Engineer", status: "Active", joinDate: "2024-05-18" },
  { id: "REC-1008", name: "Hannah Abbott", email: "hannah.a@example.com", role: "UI/UX Designer", status: "Pending", joinDate: "2024-06-01" },
  { id: "REC-1009", name: "Ian Malcolm", email: "ian.malcolm@example.com", role: "Data Scientist", status: "Active", joinDate: "2024-06-14" },
  { id: "REC-1010", name: "Julia Roberts", email: "julia.r@example.com", role: "HR Manager", status: "Inactive", joinDate: "2024-07-09" },
  { id: "REC-1011", name: "Kevin Bacon", email: "kevin.b@example.com", role: "Software Architect", status: "Active", joinDate: "2024-07-22" },
  { id: "REC-1012", name: "Laura Croft", email: "laura.c@example.com", role: "Penetration Tester", status: "Active", joinDate: "2024-08-03" },
  { id: "REC-1013", name: "Michael Scott", email: "michael.s@example.com", role: "Regional Manager", status: "Pending", joinDate: "2024-08-19" },
  { id: "REC-1014", name: "Natalie Portman", email: "natalie.p@example.com", role: "AI Research Lead", status: "Active", joinDate: "2024-09-01" },
  { id: "REC-1015", name: "Oscar Isaac", email: "oscar.i@example.com", role: "Full Stack Engineer", status: "Active", joinDate: "2024-09-15" },
  { id: "REC-1016", name: "Peter Parker", email: "peter.p@example.com", role: "Junior Developer", status: "Active", joinDate: "2024-10-02" },
  { id: "REC-1017", name: "Quinn Fabray", email: "quinn.f@example.com", role: "QA Engineer", status: "Inactive", joinDate: "2024-10-18" },
  { id: "REC-1018", name: "Rachel Green", email: "rachel.g@example.com", role: "Product Designer", status: "Active", joinDate: "2024-11-05" },
  { id: "REC-1019", name: "Steve Rogers", email: "steve.r@example.com", role: "System Administrator", status: "Active", joinDate: "2024-11-20" },
  { id: "REC-1020", name: "Tony Stark", email: "tony.s@example.com", role: "Chief Technology Officer", status: "Active", joinDate: "2024-12-01" },
  { id: "REC-1021", name: "Uma Thurman", email: "uma.t@example.com", role: "Security Engineer", status: "Pending", joinDate: "2024-12-12" },
  { id: "REC-1022", name: "Victor Stone", email: "victor.s@example.com", role: "Cloud Architect", status: "Active", joinDate: "2025-01-08" },
  { id: "REC-1023", name: "Wanda Maximoff", email: "wanda.m@example.com", role: "Automation Expert", status: "Active", joinDate: "2025-01-20" },
  { id: "REC-1024", name: "Xavier Woods", email: "xavier.w@example.com", role: "Developer Advocate", status: "Inactive", joinDate: "2025-02-04" },
  { id: "REC-1025", name: "Yara Shahidi", email: "yara.s@example.com", role: "Software Engineer", status: "Active", joinDate: "2025-02-15" },
  { id: "REC-1026", name: "Zachary Levi", email: "zachary.l@example.com", role: "QA Lead", status: "Active", joinDate: "2025-03-01" },
];

export default function DynamicTablesPage() {
  const { showToast, darkMode } = useApp();

  const [records, setRecords] = useState<DynamicRecord[]>(initialRecords);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [sortKey, setSortKey] = useState<keyof DynamicRecord>("id");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
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

  // Handle Sorting
  function handleSort(key: keyof DynamicRecord) {
    if (sortKey === key) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }
  }

  // Filter and Sort Data
  const filteredRecords = useMemo(() => {
    return records.filter((rec) => {
      const matchesSearch =
        rec.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rec.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rec.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rec.role.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === "All" || rec.status === statusFilter;

      return matchesSearch && matchesStatus;
    }).sort((a, b) => {
      let valA = a[sortKey];
      let valB = b[sortKey];
      if (typeof valA === "string" && typeof valB === "string") {
        return sortDirection === "asc"
          ? valA.localeCompare(valB)
          : valB.localeCompare(valA);
      }
      return 0;
    });
  }, [records, searchQuery, statusFilter, sortKey, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(filteredRecords.length / pageSize) || 1;
  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredRecords.slice(start, start + pageSize);
  }, [filteredRecords, currentPage, pageSize]);

  // Export CSV
  function exportCSV() {
    const headers = ["ID", "Full Name", "Email", "Role", "Status", "Join Date"];
    const rows = filteredRecords.map((r) => [r.id, r.name, r.email, r.role, r.status, r.joinDate]);
    const csvContent = [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "dynamic_web_tables_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Exported table data to CSV successfully!", "success");
  }

  // Export JSON
  function exportJSON() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(filteredRecords, null, 2));
    const link = document.createElement("a");
    link.href = dataStr;
    link.setAttribute("download", "dynamic_web_tables_export.json");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Exported table data to JSON successfully!", "success");
  }

  return (
    <div className="dynamic-tables-page" data-testid="dynamic-tables-page" style={{ padding: "8px 0" }}>
      <div className="between" style={{ marginBottom: "20px", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h1 style={{ fontSize: "28px", fontWeight: 800, margin: 0, display: "flex", alignItems: "center", gap: "12px", color: darkMode ? "#f8fafc" : "#0f172a" }}>
            <Table size={28} color="#6366f1" /> Dynamic Web Tables
          </h1>
          <p className="muted" style={{ margin: "4px 0 0", fontSize: "14px", color: darkMode ? "#94a3b8" : "#64748b" }}>
            Advanced data grid with instant search, multi-column sorting, pagination, inline editing, and robust test locators.
          </p>
        </div>

        <div className="actions" style={{ display: "flex", gap: "10px" }}>
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
          <div style={{ position: "relative", width: "100%", maxWidth: "380px" }}>
            <span style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: darkMode ? "#94a3b8" : "#64748b", display: "flex" }}>
              <Search size={18} />
            </span>
            <input
              data-testid="table-global-search-input"
              placeholder="Search ID, name, email, role..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              style={{
                width: "100%",
                paddingLeft: "42px",
                background: darkMode ? "rgba(15, 23, 42, 0.8)" : "#f8fafc",
                color: darkMode ? "#f8fafc" : "#0f172a",
                border: darkMode ? "1px solid #475569" : "1px solid #cbd5e1",
                borderRadius: "12px",
                paddingTop: "10px",
                paddingBottom: "10px",
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
              background: darkMode ? "rgba(15, 23, 42, 0.8)" : "#f8fafc",
              color: darkMode ? "#f8fafc" : "#0f172a",
              border: darkMode ? "1px solid #475569" : "1px solid #cbd5e1",
              borderRadius: "12px",
              padding: "10px 14px",
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
              width: "90px",
              background: darkMode ? "rgba(15, 23, 42, 0.8)" : "#f8fafc",
              color: darkMode ? "#f8fafc" : "#0f172a",
              border: darkMode ? "1px solid #475569" : "1px solid #cbd5e1",
              borderRadius: "12px",
              padding: "8px 12px",
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
          overflow: "x-auto",
          boxShadow: darkMode ? "0 10px 30px rgba(0,0,0,0.3)" : "0 10px 30px rgba(15, 23, 42, 0.06)",
        }}
      >
        <table>
          <thead>
            <tr>
              <th data-testid="sort-header-id" onClick={() => handleSort("id")} style={{ cursor: "pointer", userSelect: "none" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span>User ID</span>
                  {sortKey === "id" && (sortDirection === "asc" ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
                </div>
              </th>
              <th data-testid="sort-header-name" onClick={() => handleSort("name")} style={{ cursor: "pointer", userSelect: "none" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span>Full Name & Email</span>
                  {sortKey === "name" && (sortDirection === "asc" ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
                </div>
              </th>
              <th data-testid="sort-header-role" onClick={() => handleSort("role")} style={{ cursor: "pointer", userSelect: "none" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span>Role / Title</span>
                  {sortKey === "role" && (sortDirection === "asc" ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
                </div>
              </th>
              <th data-testid="sort-header-status" onClick={() => handleSort("status")} style={{ cursor: "pointer", userSelect: "none" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span>Status</span>
                  {sortKey === "status" && (sortDirection === "asc" ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
                </div>
              </th>
              <th data-testid="sort-header-joindate" onClick={() => handleSort("joinDate")} style={{ cursor: "pointer", userSelect: "none" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span>Join Date</span>
                  {sortKey === "joinDate" && (sortDirection === "asc" ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
                </div>
              </th>
              <th style={{ textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
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
                          onChange={(e) => setEditForm({ ...editForm, status: e.target.value as any })}
                          style={{ padding: "6px 10px", borderRadius: "8px", fontSize: "13px" }}
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
                            onClick={() => {
                              setRecords(records.map((r) => (r.id === rec.id ? editForm : r)));
                              setEditingId(null);
                              showToast(`Updated record ${rec.id} successfully`, "success");
                            }}
                            style={{ background: "#10b981", color: "white", padding: "6px 10px", borderRadius: "8px", display: "flex", alignItems: "center", gap: "4px", fontSize: "12px" }}
                            title="Save Changes"
                          >
                            <Save size={14} /> Save
                          </button>
                          <button
                            data-testid={`cancel-btn-${rec.id}`}
                            onClick={() => setEditingId(null)}
                            style={{ background: darkMode ? "#475569" : "#cbd5e1", color: darkMode ? "white" : "#1e293b", padding: "6px 10px", borderRadius: "8px", display: "flex", alignItems: "center", gap: "4px", fontSize: "12px" }}
                            title="Cancel"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ) : (
                        <button
                          data-testid={`edit-btn-${rec.id}`}
                          onClick={() => {
                            setEditingId(rec.id);
                            setEditForm(rec);
                          }}
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
          Showing {filteredRecords.length === 0 ? 0 : (currentPage - 1) * pageSize + 1} to{" "}
          {Math.min(currentPage * pageSize, filteredRecords.length)} of {filteredRecords.length} records
        </div>

        <div className="pagination-controls" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <button
            data-testid="pagination-prev"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
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
              onClick={() => setCurrentPage(num)}
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "10px",
                background: currentPage === num ? "#6366f1" : darkMode ? "#1e293b" : "#ffffff",
                border: currentPage === num ? "1px solid #6366f1" : darkMode ? "1px solid #334155" : "1px solid #cbd5e1",
                color: currentPage === num ? "#ffffff" : darkMode ? "#f8fafc" : "#1e293b",
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
            disabled={currentPage === totalPages || totalPages === 0}
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
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
