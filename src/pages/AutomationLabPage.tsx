import { useState, useRef, ChangeEvent } from "react";
import { useApp } from "../context/AppContext";

type ActionLog = {
  id: string;
  time: string;
  text: string;
  type: "success" | "error" | "info" | "warning";
};

type TableRow = {
  id: string;
  name: string;
  department: string;
  role: string;
  status: "Active" | "Inactive" | "Pending";
};

const initialTableData: TableRow[] = [
  { id: "EMP-101", name: "Alice Smith", department: "Engineering", role: "Senior QA", status: "Active" },
  { id: "EMP-102", name: "Bob Johnson", department: "Operations", role: "DevOps", status: "Active" },
  { id: "EMP-103", name: "Charlie Davis", department: "Management", role: "Product Mgr", status: "Pending" },
  { id: "EMP-104", name: "Diana Prince", department: "Engineering", role: "Automation Lead", status: "Active" },
  { id: "EMP-105", name: "Ethan Hunt", department: "Security", role: "Auditor", status: "Inactive" },
];

export default function AutomationLabPage() {
  const { showToast, darkMode } = useApp();

  const [activeTab, setActiveTab] = useState<"forms" | "tables" | "async" | "frames" | "notifications">("forms");
  const [inspectorVisible, setInspectorVisible] = useState(true);
  const [activeAction, setActiveAction] = useState<string>("None");
  const [outputResult, setOutputResult] = useState<{
    title: string;
    message: string;
    type: "success" | "error" | "info" | "warning";
    timestamp: string;
    meta?: Record<string, any>;
  } | null>({
    title: "Automation Studio Ready",
    message: "Select a tab on the left to practice specific UI elements, tables, async waits, or element interactions.",
    type: "info",
    timestamp: new Date().toLocaleTimeString(),
  });

  const [logs, setLogs] = useState<ActionLog[]>([]);

  // Practice Form Controls State
  const [dropdownValue, setDropdownValue] = useState("Selenium");
  const [multiSelectValues, setMultiSelectValues] = useState<string[]>(["Playwright"]);
  const [radioValue, setRadioValue] = useState("standard");
  const [checkboxValues, setCheckboxValues] = useState({
    featureA: true,
    featureB: false,
    featureC: false,
  });
  const [sliderValue, setSliderValue] = useState(75);
  const [textInput, setTextInput] = useState("");
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [sentMessageModal, setSentMessageModal] = useState<string | null>(null);

  // Searchable Country Dropdown State
  const countriesList = [
    "Afghanistan", "Albania", "Algeria", "Argentina", "Australia", "Austria",
    "Bangladesh", "Belgium", "Brazil", "Canada", "Chile", "China", "Colombia",
    "Denmark", "Egypt", "Finland", "France", "Germany", "Greece", "Hong Kong",
    "Hungary", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy",
    "Japan", "Kenya", "Malaysia", "Mexico", "Netherlands", "New Zealand", "Nigeria",
    "Norway", "Pakistan", "Peru", "Philippines", "Poland", "Portugal", "Romania",
    "Russia", "Saudi Arabia", "Singapore", "South Africa", "South Korea", "Spain",
    "Sweden", "Switzerland", "Taiwan", "Thailand", "Turkey", "Ukraine",
    "United Arab Emirates", "United Kingdom", "United States", "Vietnam"
  ];
  const [countryQuery, setCountryQuery] = useState("");
  const [countryOpen, setCountryOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  // Advanced Features State
  const [tableData] = useState<TableRow[]>(initialTableData);
  const [tableSearch, setTableSearch] = useState("");
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [tableSortKey, setTableSortKey] = useState<keyof TableRow>("id");
  const [tableSortDirection, setTableSortDirection] = useState<"asc" | "desc">("asc");
  const [ajaxLoading, setAjaxLoading] = useState(false);
  const [ajaxResultText, setAjaxResultText] = useState("Click button to load delayed AJAX content.");
  const [storageKey, setStorageKey] = useState("automation_token");
  const [storageVal, setStorageVal] = useState("bearer_xyz_998877");
  const [cookieResult, setCookieResult] = useState("No cookie set yet.");
  const [iframeClicked, setIframeClicked] = useState(false);
  const [shadowDomClicked, setShadowDomClicked] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  function logAction(title: string, message: string, type: "success" | "error" | "info" | "warning", meta?: Record<string, any>) {
    const time = new Date().toLocaleTimeString();
    setActiveAction(title);
    setOutputResult({ title, message, type, timestamp: time, meta });
    setLogs((prev) => [
      { id: "LOG-" + Date.now(), time, text: `${title}: ${message}`, type },
      ...prev,
    ].slice(0, 30));
  }

  function handleTriggerToast(type: "success" | "error" | "info" | "warning") {
    showToast(`Practice ${type} toast triggered!`, type);
    logAction(`Trigger ${type.toUpperCase()} Toast`, `Successfully displayed ${type} toast notification banner.`, type);
  }

  const [loadingState, setLoadingState] = useState(false);

  function handleAsyncLoading() {
    setLoadingState(true);
    logAction("Show Loading State", "Loading state initiated...", "info");
    setTimeout(() => {
      setLoadingState(false);
      logAction("Show Loading State", "Loading operation completed successfully after 1.5s.", "success");
    }, 1500);
  }

  function handleSimulateApiDelay() {
    setLoadingState(true);
    logAction("Simulate API Delay", "Network request sent to mock server (/api/practice/delay)...", "info");
    setTimeout(() => {
      setLoadingState(false);
      logAction("Simulate API Delay", "API response received: HTTP 200 OK (1840ms latency).", "success", { endpoint: "/api/practice/delay", status: 200, latencyMs: 1840 });
    }, 1840);
  }

  function handleAjaxWait(delayMs: number) {
    setAjaxLoading(true);
    setAjaxResultText("Loading AJAX data...");
    logAction("AJAX Wait Simulation", `Waiting ${delayMs}ms for async data load...`, "info");
    setTimeout(() => {
      setAjaxLoading(false);
      const res = `Successfully loaded AJAX payload after ${delayMs}ms delay! Record count: 42.`;
      setAjaxResultText(res);
      logAction("AJAX Wait Simulation", res, "success", { delayMs, recordsLoaded: 42 });
    }, delayMs);
  }

  function handleFileUpload(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFileName(file.name);
      logAction("File Upload", `Selected file: ${file.name} (${file.size} bytes)`, "success", { fileName: file.name, fileSize: file.size });
    }
  }

  const filteredTableRows = tableData
    .filter((row) =>
      `${row.id} ${row.name} ${row.department} ${row.role} ${row.status}`.toLowerCase().includes(tableSearch.toLowerCase())
    )
    .sort((a, b) => {
      let aVal = a[tableSortKey];
      let bVal = b[tableSortKey];
      let result = 0;
      if (typeof aVal === "string" && typeof bVal === "string") {
        result = aVal.localeCompare(bVal);
      } else {
        result = String(aVal).localeCompare(String(bVal));
      }
      return tableSortDirection === "asc" ? result : -result;
    });

  function handleTableSort(key: keyof TableRow) {
    if (tableSortKey === key) {
      const nextDir = tableSortDirection === "asc" ? "desc" : "asc";
      setTableSortDirection(nextDir);
      logAction("Table Sort", `Sorted table by ${key} (${nextDir})`, "info", { sortKey: key, direction: nextDir });
    } else {
      setTableSortKey(key);
      setTableSortDirection("asc");
      logAction("Table Sort", `Sorted table by ${key} (asc)`, "info", { sortKey: key, direction: "asc" });
    }
  }

  function getTableSortIcon(key: keyof TableRow) {
    if (tableSortKey !== key) return "↕";
    return tableSortDirection === "asc" ? "▲" : "▼";
  }

  return (
    <div className="lab-page" data-testid="automation-lab-page">
      <div className="lab-header" data-testid="automation-lab-header">
        <div>
          <h1>Interactive QA Sandbox & Live Inspector</h1>
          <p className="muted">
            Professional testbed for Selenium, Playwright, and Cypress. Build test scripts, practice element interactions, and inspect telemetry in real time.
          </p>
        </div>
      </div>

      {/* Tab Navigation & Inspector Toggle Bar */}
      <div className="between" style={{ marginBottom: "16px", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
        <div className="lab-tabs" data-testid="automation-lab-tabs" style={{ margin: 0, borderBottom: "none" }}>
          <button
            className={activeTab === "forms" ? "lab-tab-btn active" : "lab-tab-btn"}
            data-testid="lab-tab-forms"
            onClick={() => setActiveTab("forms")}
          >
            📝 Form Controls
          </button>
          <button
            className={activeTab === "tables" ? "lab-tab-btn active" : "lab-tab-btn"}
            data-testid="lab-tab-tables"
            onClick={() => setActiveTab("tables")}
          >
            📊 Data Tables
          </button>
          <button
            className={activeTab === "async" ? "lab-tab-btn active" : "lab-tab-btn"}
            data-testid="lab-tab-async"
            onClick={() => setActiveTab("async")}
          >
            ⏱️ Async & Waits
          </button>
          <button
            className={activeTab === "frames" ? "lab-tab-btn active" : "lab-tab-btn"}
            data-testid="lab-tab-frames"
            onClick={() => setActiveTab("frames")}
          >
            🔲 Frames & Storage
          </button>
          <button
            className={activeTab === "notifications" ? "lab-tab-btn active" : "lab-tab-btn"}
            data-testid="lab-tab-notifications"
            onClick={() => setActiveTab("notifications")}
          >
            🔔 Toasts & Modals
          </button>
        </div>

        <div>
          <button
            data-testid="toggle-inspector-btn"
            className="inspector-toggle-pill"
            onClick={() => {
              const newState = !inspectorVisible;
              setInspectorVisible(newState);
              logAction("Toggle Inspector", newState ? "Live Inspector shown." : "Live Inspector hidden.", "info");
            }}
          >
            {inspectorVisible ? "✕ Hide Inspector" : "🔍 Show Inspector"}
          </button>
        </div>
      </div>

      <div className={`lab-container ${!inspectorVisible ? "inspector-hidden" : ""}`}>
        {/* LEFT COLUMN: Tab Content */}
        <div className="lab-left" data-testid="automation-lab-scroll-view">

          {activeTab === "forms" && (
            <section className="card lab-section animate-fade" data-testid="lab-section-form-controls">
              <h3>Form Controls & Input Elements</h3>
              <p className="muted">Practice web form elements with explicit subheadings, horizontal radio buttons, and vertical checkboxes.</p>

              <div className="lab-form-group">
                <div className="lab-element-header">
                  <h4>Searchable Country Dropdown</h4>
                  <small className="muted">Type to filter, use keyboard arrows or click to select</small>
                </div>
                <div className="country-dropdown-wrapper">
                  <input
                    data-testid="country-search-input"
                    placeholder="Type to search country..."
                    value={countryQuery}
                    onChange={(e) => {
                      const val = e.target.value;
                      setCountryQuery(val);
                      setCountryOpen(val.trim().length > 0);
                      setHighlightedIndex(0);
                    }}
                    onKeyDown={(e) => {
                      const filtered = countriesList.filter((c) => c.toLowerCase().includes(countryQuery.toLowerCase()));
                      if (!countryOpen && (e.key === "ArrowDown" || e.key === "Enter") && countryQuery.trim().length > 0) {
                        setCountryOpen(true);
                        return;
                      }
                      if (e.key === "ArrowDown") {
                        e.preventDefault();
                        if (countryOpen && filtered.length) {
                          setHighlightedIndex((prev) => (prev + 1) % filtered.length);
                        }
                      } else if (e.key === "ArrowUp") {
                        e.preventDefault();
                        if (countryOpen && filtered.length) {
                          setHighlightedIndex((prev) => (prev - 1 + filtered.length) % filtered.length);
                        }
                      } else if (e.key === "Enter" && countryOpen && filtered.length > 0) {
                        e.preventDefault();
                        const selected = filtered[highlightedIndex] || filtered[0];
                        setCountryQuery(selected);
                        setCountryOpen(false);
                        logAction("Country Selected", `Selected country via keyboard: ${selected}`, "success", { country: selected });
                      } else if (e.key === "Escape") {
                        setCountryOpen(false);
                      }
                    }}
                  />
                  {countryOpen && countryQuery.trim().length > 0 && (
                    <ul className="country-dropdown-list" data-testid="country-dropdown-list">
                      {countriesList
                        .filter((c) => c.toLowerCase().includes(countryQuery.toLowerCase()))
                        .length === 0 ? (
                        <li className="country-option-empty" data-testid="country-option-empty">
                          No matching countries found
                        </li>
                      ) : (
                        countriesList
                          .filter((c) => c.toLowerCase().includes(countryQuery.toLowerCase()))
                          .map((country, index) => (
                            <li
                              key={country}
                              className={`country-option-item ${index === highlightedIndex ? "highlighted" : ""}`}
                              data-testid="country-option-item"
                              onMouseEnter={() => setHighlightedIndex(index)}
                              onClick={() => {
                                setCountryQuery(country);
                                setCountryOpen(false);
                                logAction("Country Selected", `Selected country via click: ${country}`, "success", { country });
                              }}
                            >
                              {country}
                            </li>
                          ))
                      )}
                    </ul>
                  )}
                </div>
              </div>

              <div className="lab-form-group">
                <div className="lab-element-header">
                  <h4>Dropdown Select</h4>
                  <small className="muted">Single-select options menu</small>
                </div>
                <select
                  id="lab-dropdown-select"
                  data-testid="lab-dropdown-select"
                  value={dropdownValue}
                  onChange={(e) => {
                    setDropdownValue(e.target.value);
                    logAction("Dropdown Change", `Selected framework: ${e.target.value}`, "info", { value: e.target.value });
                  }}
                >
                  <option value="Selenium">Selenium WebDriver</option>
                  <option value="Playwright">Playwright</option>
                  <option value="Cypress">Cypress</option>
                </select>
              </div>

              <div className="lab-form-group">
                <div className="lab-element-header">
                  <h4>Multi-Select List</h4>
                  <small className="muted">Multi-selection options list</small>
                </div>
                <select
                  id="lab-multiselect"
                  data-testid="lab-multiselect"
                  multiple
                  value={multiSelectValues}
                  onChange={(e) => {
                    const options = Array.from(e.target.selectedOptions, (option) => option.value);
                    setMultiSelectValues(options);
                    logAction("Multi-Select Change", `Selected items: ${options.join(", ")}`, "info", { values: options });
                  }}
                >
                  <option value="Selenium">Selenium</option>
                  <option value="Playwright">Playwright</option>
                  <option value="Cypress">Cypress</option>
                  <option value="Appium">Appium</option>
                </select>
                <small className="muted">Hold Ctrl/Cmd to select multiple</small>
              </div>

              <div className="lab-form-group">
                <div className="lab-element-header">
                  <h4>Radio Buttons (Horizontal Layout)</h4>
                  <small className="muted">Mutually exclusive options aligned side-by-side</small>
                </div>
                <div className="lab-radio-group" data-testid="lab-radio-group">
                  {[
                    { key: "standard", label: "Standard Execution" },
                    { key: "parallel", label: "Parallel Execution" },
                    { key: "headless", label: "Headless Execution" },
                  ].map((opt) => (
                    <label key={opt.key} className="inline-label">
                      <input
                        type="radio"
                        name="practiceRadio"
                        data-testid={`lab-radio-${opt.key}`}
                        checked={radioValue === opt.key}
                        onChange={() => {
                          setRadioValue(opt.key);
                          logAction("Radio Button Change", `Selected execution mode: ${opt.label}`, "info", { radioValue: opt.key });
                        }}
                      />
                      {opt.label}
                    </label>
                  ))}
                </div>
              </div>

              <div className="lab-form-group">
                <div className="lab-element-header">
                  <h4>Checkboxes (Vertical Stack)</h4>
                  <small className="muted">Independent multi-select options aligned vertically</small>
                </div>
                <div className="lab-checkbox-group" data-testid="lab-checkbox-group">
                  <label className="inline-label">
                    <input
                      type="checkbox"
                      data-testid="lab-checkbox-screenshots"
                      checked={checkboxValues.featureA}
                      onChange={(e) => {
                        const val = e.target.checked;
                        setCheckboxValues((prev) => ({ ...prev, featureA: val }));
                        logAction("Checkbox Change", `Capture Screenshots on Failure set to ${val}`, "info", { screenshots: val });
                      }}
                    />
                    Capture Screenshots on Failure
                  </label>
                  <label className="inline-label">
                    <input
                      type="checkbox"
                      data-testid="lab-checkbox-report"
                      checked={checkboxValues.featureB}
                      onChange={(e) => {
                        const val = e.target.checked;
                        setCheckboxValues((prev) => ({ ...prev, featureB: val }));
                        logAction("Checkbox Change", `Generate HTML Test Report set to ${val}`, "info", { report: val });
                      }}
                    />
                    Generate HTML Test Report
                  </label>
                  <label className="inline-label">
                    <input
                      type="checkbox"
                      data-testid="lab-checkbox-retry"
                      checked={checkboxValues.featureC}
                      onChange={(e) => {
                        const val = e.target.checked;
                        setCheckboxValues((prev) => ({ ...prev, featureC: val }));
                        logAction("Checkbox Change", `Retry Failed Tests Automatically set to ${val}`, "info", { retry: val });
                      }}
                    />
                    Retry Failed Tests Automatically
                  </label>
                </div>
              </div>

              <div className="lab-form-group">
                <div className="lab-element-header">
                  <h4>Range Slider</h4>
                  <small className="muted">Adjustable numerical slider with live percentage indicator</small>
                </div>
                <div className="between" style={{ marginBottom: "4px" }}>
                  <label htmlFor="lab-range-slider" style={{ margin: 0 }}>Threshold Level</label>
                  <span data-testid="lab-slider-value-display" style={{ fontWeight: "900", color: "#6046e8", background: "#f3f0ff", padding: "2px 10px", borderRadius: "999px", fontSize: "13px" }}>
                    {sliderValue}%
                  </span>
                </div>
                <input
                  id="lab-range-slider"
                  type="range"
                  min="0"
                  max="100"
                  data-testid="lab-range-slider"
                  value={sliderValue}
                  onChange={(e) => setSliderValue(Number(e.target.value))}
                  onMouseUp={() => logAction("Range Slider Change", `Slider threshold set to ${sliderValue}%`, "info", { sliderValue })}
                />
              </div>

              <div className="lab-form-group">
                <div className="lab-element-header">
                  <h4>Text Input & Send Confirmation</h4>
                  <small className="muted">Type text, click Send, and view modal confirmation popup</small>
                </div>
                <div style={{ display: "flex", gap: "10px", marginTop: "4px" }}>
                  <input
                    id="lab-text-input"
                    data-testid="lab-text-input"
                    placeholder="Type message to send..."
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                  />
                  <button
                    type="button"
                    data-testid="lab-text-send-btn"
                    style={{ whiteSpace: "nowrap", padding: "10px 20px" }}
                    onClick={() => {
                      if (!textInput.trim()) {
                        showToast("Please enter some text first", "warning");
                        return;
                      }
                      setSentMessageModal(textInput);
                      logAction("Send Message", `Successfully sent message: "${textInput}"`, "success", { text: textInput });
                    }}
                  >
                    Send
                  </button>
                </div>
              </div>

              <div className="lab-form-group">
                <div className="lab-element-header">
                  <h4>File Upload</h4>
                  <small className="muted">Select and upload local test files</small>
                </div>
                <input
                  id="lab-file-input"
                  type="file"
                  data-testid="lab-file-input"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                />
                {selectedFileName && <small className="muted" data-testid="lab-uploaded-file-name">Uploaded: {selectedFileName}</small>}
              </div>
            </section>
          )}

          {activeTab === "tables" && (
            <section className="card lab-section animate-fade" data-testid="lab-section-tables">
              <h3>Dynamic Data Tables & Pagination</h3>
              <p className="muted">Test table sorting, row selection, filtering, and data extraction.</p>

              <div className="lab-form-group">
                <input
                  data-testid="lab-table-search-input"
                  placeholder="Filter table rows across all columns..."
                  value={tableSearch}
                  onChange={(e) => setTableSearch(e.target.value)}
                />
              </div>

              <div className="table-wrap" style={{ maxHeight: "320px", marginTop: "12px" }}>
                <table data-testid="lab-dynamic-table">
                  <thead>
                    <tr>
                      <th>
                        <input
                          type="checkbox"
                          data-testid="lab-table-select-all"
                          checked={filteredTableRows.length > 0 && selectedRows.length === filteredTableRows.length}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedRows(filteredTableRows.map((r) => r.id));
                              logAction("Table Select All", `Selected all ${filteredTableRows.length} rows.`, "info");
                            } else {
                              setSelectedRows([]);
                              logAction("Table Deselect All", "Cleared row selection.", "info");
                            }
                          }}
                        />
                      </th>
                      <th>
                        <button
                          type="button"
                          className="sortable-header"
                          data-testid="sort-header-id"
                          onClick={() => handleTableSort("id")}
                        >
                          ID {getTableSortIcon("id")}
                        </button>
                      </th>
                      <th>
                        <button
                          type="button"
                          className="sortable-header"
                          data-testid="sort-header-name"
                          onClick={() => handleTableSort("name")}
                        >
                          Name {getTableSortIcon("name")}
                        </button>
                      </th>
                      <th>
                        <button
                          type="button"
                          className="sortable-header"
                          data-testid="sort-header-department"
                          onClick={() => handleTableSort("department")}
                        >
                          Dept {getTableSortIcon("department")}
                        </button>
                      </th>
                      <th>
                        <button
                          type="button"
                          className="sortable-header"
                          data-testid="sort-header-role"
                          onClick={() => handleTableSort("role")}
                        >
                          Role {getTableSortIcon("role")}
                        </button>
                      </th>
                      <th>
                        <button
                          type="button"
                          className="sortable-header"
                          data-testid="sort-header-status"
                          onClick={() => handleTableSort("status")}
                        >
                          Status {getTableSortIcon("status")}
                        </button>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTableRows.length === 0 ? (
                      <tr data-testid="lab-table-empty-row">
                        <td colSpan={6} style={{ textAlign: "center", color: "#667085" }}>No matching records found</td>
                      </tr>
                    ) : (
                      filteredTableRows.map((row) => (
                        <tr key={row.id} data-testid={`lab-table-row-${row.id.toLowerCase()}`}>
                          <td>
                            <input
                              type="checkbox"
                              data-testid={`lab-table-row-checkbox-${row.id.toLowerCase()}`}
                              checked={selectedRows.includes(row.id)}
                              onChange={() => {
                                setSelectedRows((prev) =>
                                  prev.includes(row.id) ? prev.filter((id) => id !== row.id) : [...prev, row.id]
                                );
                                logAction("Table Row Select", `Toggled row ${row.id}`, "info", { rowId: row.id });
                              }}
                            />
                          </td>
                          <td data-testid={`cell-id-${row.id.toLowerCase()}`}>{row.id}</td>
                          <td data-testid={`cell-name-${row.id.toLowerCase()}`}>{row.name}</td>
                          <td data-testid={`cell-department-${row.id.toLowerCase()}`}>{row.department}</td>
                          <td data-testid={`cell-role-${row.id.toLowerCase()}`}>{row.role}</td>
                          <td data-testid={`cell-status-${row.id.toLowerCase()}`}>
                            <span className={`status-badge ${row.status.toLowerCase()}`}>{row.status}</span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              <div className="between" style={{ marginTop: "14px" }}>
                <small className="muted" data-testid="lab-table-selected-count">Selected: {selectedRows.length} row(s)</small>
                <button
                  style={{ padding: "8px 16px" }}
                  data-testid="lab-table-bulk-action-btn"
                  disabled={selectedRows.length === 0}
                  onClick={() => {
                    logAction("Table Bulk Action", `Performed bulk action on ${selectedRows.length} rows.`, "success", { selectedRows });
                  }}
                >
                  Perform Bulk Action
                </button>
              </div>
            </section>
          )}

          {activeTab === "async" && (
            <section className="card lab-section animate-fade" data-testid="lab-section-async">
              <h3>Async Waits & Network Simulations</h3>
              <p className="muted">Practice explicit waits (`WebDriverWait`, `cy.wait()`, `page.waitForSelector()`) and loaders.</p>

              <div className="lab-button-grid" style={{ gridTemplateColumns: "repeat(2, 1fr)" }}>
                <button data-testid="lab-loading-state-btn" onClick={handleAsyncLoading}>Show Loading State (1.5s)</button>
                <button data-testid="lab-api-delay-btn" onClick={handleSimulateApiDelay}>Simulate API Delay (1.8s)</button>
                <button data-testid="lab-ajax-fast-btn" onClick={() => handleAjaxWait(1000)}>Load AJAX (1s Wait)</button>
                <button data-testid="lab-ajax-slow-btn" onClick={() => handleAjaxWait(3500)}>Load AJAX (3.5s Wait)</button>
              </div>

              {loadingState && (
                <div className="practice-message" data-testid="lab-loading-indicator">
                  <span>⌛</span> Processing background operation...
                </div>
              )}

              <div className="practice-message" data-testid="lab-ajax-result-box" style={{ marginTop: "16px" }}>
                {ajaxLoading ? <span className="export-progress"><span /> Loading async data...</span> : <strong data-testid="lab-ajax-result-text">{ajaxResultText}</strong>}
              </div>
            </section>
          )}

          {activeTab === "frames" && (
            <section className="card lab-section animate-fade" data-testid="lab-section-frames-storage">
              <h3>Frames, Shadow DOM & Web Storage</h3>
              <p className="muted">Practice iframe context switching, shadow DOM piercing, and web storage.</p>

              <div className="lab-form-group">
                <label>Simulated Iframe Document</label>
                <div className="iframe-box" data-testid="lab-iframe-container" style={{ border: "2px dashed #6366f1", borderRadius: "14px", padding: "16px", background: darkMode ? "#0f172a" : "#f8faff", color: darkMode ? "#f1f5f9" : "#0f172a" }}>
                  <p className="muted" style={{ margin: "0 0 10px" }}>[Iframe Context Window]</p>
                  <button
                    data-testid="lab-iframe-btn"
                    onClick={() => {
                      setIframeClicked(true);
                      logAction("Iframe Interaction", "Clicked button inside simulated iframe context.", "success");
                    }}
                  >
                    {iframeClicked ? "Clicked Inside Iframe! 🎯" : "Click Button Inside Iframe"}
                  </button>
                </div>
              </div>

              <div className="lab-form-group" style={{ marginTop: "16px" }}>
                <label>Shadow DOM Root Container</label>
                <div className="shadow-box" data-testid="lab-shadow-container" style={{ border: "2px solid #6366f1", borderRadius: "14px", padding: "16px", background: darkMode ? "#0f172a" : "#f5f3ff", color: darkMode ? "#f1f5f9" : "#0f172a" }}>
                  <p className="muted" style={{ margin: "0 0 10px" }}>[Closed/Open Shadow Root]</p>
                  <button
                    data-testid="lab-shadow-btn"
                    onClick={() => {
                      setShadowDomClicked(true);
                      logAction("Shadow DOM Interaction", "Interacted with element inside Shadow DOM boundary.", "success");
                    }}
                  >
                    {shadowDomClicked ? "Shadow Element Triggered! ✨" : "Interact with Shadow DOM Element"}
                  </button>
                </div>
              </div>

              <div className="lab-form-group" style={{ marginTop: "20px" }}>
                <label>Web Storage & Cookies</label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginTop: "6px" }}>
                  <input data-testid="lab-storage-key-input" value={storageKey} onChange={(e) => setStorageKey(e.target.value)} placeholder="Key" />
                  <input data-testid="lab-storage-val-input" value={storageVal} onChange={(e) => setStorageVal(e.target.value)} placeholder="Value" />
                </div>
                <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                  <button
                    data-testid="lab-set-storage-btn"
                    onClick={() => {
                      localStorage.setItem(storageKey, storageVal);
                      logAction("Set LocalStorage", `Set ${storageKey} = ${storageVal}`, "success", { key: storageKey, value: storageVal });
                    }}
                  >
                    Set LocalStorage
                  </button>
                  <button
                    data-testid="lab-get-storage-btn"
                    onClick={() => {
                      const val = localStorage.getItem(storageKey);
                      logAction("Get LocalStorage", `Retrieved ${storageKey}: "${val || "null"}"`, "info", { key: storageKey, value: val });
                    }}
                  >
                    Get LocalStorage
                  </button>
                </div>
              </div>

              <div className="lab-form-group" style={{ marginTop: "16px" }}>
                <div style={{ display: "flex", gap: "10px" }}>
                  <button
                    data-testid="lab-set-cookie-btn"
                    onClick={() => {
                      document.cookie = "automation_session=active_99; path=/;";
                      setCookieResult("automation_session=active_99 cookie successfully set.");
                      logAction("Set Cookie", "Set document.cookie = automation_session=active_99", "success");
                    }}
                  >
                    Set Test Cookie
                  </button>
                  <button
                    data-testid="lab-get-cookie-btn"
                    onClick={() => {
                      const cookies = document.cookie;
                      setCookieResult(cookies ? `Current cookies: ${cookies}` : "No cookies found.");
                      logAction("Get Cookie", `Read document.cookie: "${cookies}"`, "info", { cookies });
                    }}
                  >
                    Inspect Cookies
                  </button>
                </div>
                <small className="muted" data-testid="lab-cookie-status" style={{ marginTop: "6px" }}>{cookieResult}</small>
              </div>
            </section>
          )}

          {activeTab === "notifications" && (
            <section className="card lab-section animate-fade" data-testid="lab-section-notifications">
              <h3>Toasts, Alerts & Modals</h3>
              <p className="muted">Test notification banners and modal assertions.</p>
              <div className="lab-button-grid">
                <button data-testid="lab-toast-success-btn" onClick={() => handleTriggerToast("success")}>Success Toast</button>
                <button data-testid="lab-toast-error-btn" onClick={() => handleTriggerToast("error")}>Error Toast</button>
                <button data-testid="lab-toast-warning-btn" onClick={() => handleTriggerToast("warning")}>Warning Toast</button>
                <button data-testid="lab-toast-info-btn" onClick={() => handleTriggerToast("info")}>Info Toast</button>
                <button data-testid="lab-open-modal-btn" onClick={() => { setModalOpen(true); logAction("Open Modal", "Practice modal opened.", "info"); }}>Open Modal</button>
                <button data-testid="lab-random-popup-btn" onClick={() => logAction("Trigger Random Popup", "Random practice popup event triggered.", "success", { popupId: "POPUP-" + Math.floor(Math.random() * 1000) })}>Random Popup</button>
              </div>
            </section>
          )}

        </div>

        {/* RIGHT COLUMN: Live Result Inspector & Output Console */}
        {inspectorVisible && (
          <div className="lab-right inspector-panel animate-fade" data-testid="automation-lab-inspector-panel">
            <div className="card inspector-card">
              <div className="between inspector-header">
                <h3>🔍 Live Inspector Console</h3>
                <span className={`status-badge ${outputResult?.type || "info"}`} data-testid="inspector-status-badge">
                  {outputResult?.type?.toUpperCase() || "READY"}
                </span>
              </div>

              <div className="inspector-summary" data-testid="inspector-summary-box">
                <div className="inspector-field">
                  <span>Active Action</span>
                  <strong data-testid="inspector-active-action">{activeAction}</strong>
                </div>
                <div className="inspector-field">
                  <span>Timestamp</span>
                  <strong data-testid="inspector-timestamp">{outputResult?.timestamp || "-"}</strong>
                </div>
              </div>

              <div className="inspector-message-box" data-testid="inspector-message-box">
                <h4>{outputResult?.title}</h4>
                <p data-testid="inspector-message-text">{outputResult?.message}</p>
                {outputResult?.meta && (
                  <pre data-testid="inspector-meta-json" className="inspector-json">
                    {JSON.stringify(outputResult.meta, null, 2)}
                  </pre>
                )}
              </div>

              <div className="inspector-logs-section">
                <h4>📋 Action History Log</h4>
                <div className="inspector-logs-list" data-testid="inspector-logs-list">
                  {logs.length === 0 ? (
                    <p className="muted" style={{ padding: "10px 0" }}>No actions performed yet. Interact with the left panel.</p>
                  ) : (
                    logs.map((log) => (
                      <div key={log.id} className={`inspector-log-row ${log.type}`} data-testid={`inspector-log-${log.id}`}>
                        <time>{log.time}</time>
                        <span>{log.text}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {logs.length > 0 && (
                <button
                  className="full"
                  style={{ marginTop: "16px", background: "#eef2ff", color: "#4f46e5" }}
                  data-testid="inspector-clear-logs-btn"
                  onClick={() => {
                    setLogs([]);
                    setOutputResult({ title: "Cleared", message: "Action history logs cleared.", type: "info", timestamp: new Date().toLocaleTimeString() });
                  }}
                >
                  Clear Logs
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {modalOpen && (
        <div className="modal-backdrop" data-testid="lab-practice-modal-backdrop">
          <div className="modal" data-testid="lab-practice-modal">
            <h2>Automation Practice Modal</h2>
            <p>This modal is designed for Selenium, Playwright, and Cypress automation assertions and dismissal testing.</p>
            <div className="right">
              <button
                data-testid="lab-modal-close-btn"
                onClick={() => {
                  setModalOpen(false);
                  logAction("Close Modal", "Practice modal closed.", "info");
                }}
              >
                Close Modal
              </button>
            </div>
          </div>
        </div>
      )}

      {sentMessageModal && (
        <div className="modal-backdrop" data-testid="lab-sent-confirmation-modal-backdrop">
          <div className="modal" data-testid="lab-sent-confirmation-modal" style={{ textAlign: "center" }}>
            <div style={{ fontSize: "42px", marginBottom: "10px" }}></div>
            <h2>Message Sent Successfully!</h2>
            <p className="muted" style={{ margin: "10px 0" }}>Your message was transmitted and confirmed:</p>
            <div style={{ background: darkMode ? "#0f172a" : "#f8faff", border: darkMode ? "1px solid #334155" : "1px solid #e2e8f0", padding: "12px", borderRadius: "10px", fontWeight: "700", color: darkMode ? "#f1f5f9" : "#0f172a", margin: "16px 0" }}>
              "{sentMessageModal}"
            </div>
            <div className="right" style={{ justifyContent: "center" }}>
              <button
                data-testid="lab-sent-modal-close-btn"
                onClick={() => setSentMessageModal(null)}
              >
                OK / Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
