import { useState, useRef, useEffect, useMemo, ChangeEvent } from "react";
import {
  Check,
  Sliders,
  Table as TableIcon,
  Timer,
  Layers,
  Bell,
  Terminal,
  EyeOff,
  CheckCircle2,
  Loader2,
  History,
  FileCode2,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import CustomSelect from "../components/CustomSelect";
import { AsyncWaitFlowDiagram } from "../components/QaDiagrams";

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

const COUNTRIES_LIST = [
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

const RESERVED_STORAGE_KEYS = new Set([
  "automation-users",
  "automation-current-user",
  "automation-dark-mode",
  "automation-dynamic-records",
  "automation-spec-mode",
  "__proto__",
  "constructor",
  "prototype",
]);

function containsXssTestPattern(input: string): boolean {
  return /<\s*\/?\s*(script|img|svg|iframe|object|embed|body|style|link|meta)\b|javascript\s*:|on[a-z]+\s*=/i.test(input);
}

function sanitizeControlChars(input: string, maxLen = 500): string {
  return input.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "").slice(0, maxLen);
}

export default function AutomationLabPage() {
  const { showToast, darkMode, specMode, setSpecMode } = useApp();

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
  const [textInputError, setTextInputError] = useState("");
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [sentMessageModal, setSentMessageModal] = useState<string | null>(null);
  const [randomPopup, setRandomPopup] = useState<{
    popupId: string;
    title: string;
    message: string;
    severity: "info" | "warning" | "success" | "error";
    timestamp: string;
  } | null>(null);

  // Custom Countdown Timer & Validation State
  const [countdownInput, setCountdownInput] = useState("5");
  const [countdownError, setCountdownError] = useState("");
  const [countdownRemaining, setCountdownRemaining] = useState<number | null>(null);
  const [countdownCompletedMsg, setCountdownCompletedMsg] = useState("");
  const countdownIntervalRef = useRef<number | null>(null);
  const loadingTimeoutRef = useRef<number | null>(null);
  const ajaxTimeoutRef = useRef<number | null>(null);
  const logSeqRef = useRef<number>(0);

  // Searchable Country Dropdown State
  const [countryQuery, setCountryQuery] = useState("");
  const [countryOpen, setCountryOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const filteredCountries = useMemo(
    () => COUNTRIES_LIST.filter((c) => c.toLowerCase().includes(countryQuery.toLowerCase())),
    [countryQuery]
  );

  // Advanced Features State
  const [tableSearch, setTableSearch] = useState("");
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [tableSortKey, setTableSortKey] = useState<keyof TableRow>("id");
  const [tableSortDirection, setTableSortDirection] = useState<"asc" | "desc">("asc");
  const [ajaxLoading, setAjaxLoading] = useState(false);
  const [ajaxResultText, setAjaxResultText] = useState("Click button to load delayed AJAX content.");
  const [storageKey, setStorageKey] = useState("automation_token");
  const [storageVal, setStorageVal] = useState("bearer_xyz_998877");
  const [storageError, setStorageError] = useState("");
  const [cookieResult, setCookieResult] = useState("No cookie set yet.");
  const [iframeClicked, setIframeClicked] = useState(false);
  const [shadowDomClicked, setShadowDomClicked] = useState(false);

  useEffect(() => {
    return () => {
      if (countdownIntervalRef.current !== null) {
        window.clearInterval(countdownIntervalRef.current);
      }
      if (loadingTimeoutRef.current !== null) {
        window.clearTimeout(loadingTimeoutRef.current);
      }
      if (ajaxTimeoutRef.current !== null) {
        window.clearTimeout(ajaxTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!modalOpen && !sentMessageModal && !countryOpen && !randomPopup) return;
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        if (randomPopup) {
          setRandomPopup(null);
          logAction("Close Random Popup", "Random popup dismissed via Escape key.", "info");
        }
        if (modalOpen) {
          setModalOpen(false);
          logAction("Close Modal", "Practice modal closed via Escape key.", "info");
        }
        if (sentMessageModal) {
          setSentMessageModal(null);
        }
        if (countryOpen) {
          setCountryOpen(false);
        }
      }
    }
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [modalOpen, sentMessageModal, countryOpen, randomPopup]);

  function logAction(title: string, message: string, type: "success" | "error" | "info" | "warning", meta?: Record<string, unknown>) {
    const time = new Date().toLocaleTimeString();
    logSeqRef.current += 1;
    const logId = `LOG-${Date.now()}-${logSeqRef.current}`;
    const safeMessage = sanitizeControlChars(message, 1000);
    const hasXss =
      containsXssTestPattern(safeMessage) ||
      (meta ? Object.values(meta).some((v) => typeof v === "string" && containsXssTestPattern(v)) : false);
    const enrichedMeta = hasXss ? { ...meta, xssPayloadNeutralized: true } : meta;
    setActiveAction(title);
    setOutputResult({ title, message: safeMessage, type, timestamp: time, meta: enrichedMeta });
    setLogs((prev) => [
      { id: logId, time, text: `${title}: ${safeMessage}`, type },
      ...prev,
    ].slice(0, 30));
  }

  function handleTriggerToast(type: "success" | "error" | "info" | "warning") {
    showToast(`Practice ${type} toast triggered!`, type);
    logAction(`Trigger ${type.toUpperCase()} Toast`, `Successfully displayed ${type} toast notification banner.`, type);
  }

  function handleTriggerRandomPopup() {
    const scenarios: Array<{
      title: string;
      message: string;
      severity: "info" | "warning" | "success" | "error";
    }> = [
      {
        title: "Security Session Check",
        message: "Random security verification popup triggered. Session token is valid and active for automation testing.",
        severity: "info",
      },
      {
        title: "API Rate Limit Warning",
        message: "Simulated burst threshold reached (85% of quota). Verify that your test script handles unexpected alert popups.",
        severity: "warning",
      },
      {
        title: "Deployment Gate Passed",
        message: "All 42 smoke suite assertions passed in staging. Build artifact promoted to QA verification.",
        severity: "success",
      },
      {
        title: "Transient Worker Alert",
        message: "Background queue worker reported a simulated retryable timeout on shard #2. Auto-recovery succeeded.",
        severity: "error",
      },
    ];
    const picked = scenarios[Math.floor(Math.random() * scenarios.length)];
    const popupId = "POPUP-" + Math.floor(100 + Math.random() * 900);
    const timestamp = new Date().toLocaleTimeString();

    setRandomPopup({
      popupId,
      title: picked.title,
      message: picked.message,
      severity: picked.severity,
      timestamp,
    });
    showToast(`Random Popup (${popupId}): ${picked.title}`, picked.severity);
    logAction("Trigger Random Popup", `${picked.title} (${popupId}): ${picked.message}`, picked.severity, {
      popupId,
      title: picked.title,
      severity: picked.severity,
    });
  }

  function validateCountdownValue(rawInput: string): { valid: boolean; seconds: number; error: string } {
    const trimmed = rawInput.trim();
    if (!trimmed) {
      return {
        valid: false,
        seconds: 0,
        error: "Please enter a countdown time in seconds (1–30). Maximum allowed wait time is 30 seconds",
      };
    }
    if (!/^\d+$/.test(trimmed)) {
      return {
        valid: false,
        seconds: 0,
        error: "Only numbers are allowed. Maximum allowed wait time is 30 seconds",
      };
    }
    const seconds = Number(trimmed);
    if (seconds < 1) {
      return {
        valid: false,
        seconds: 0,
        error: "Countdown must be at least 1 second. Maximum allowed wait time is 30 seconds",
      };
    }
    if (seconds > 30) {
      return {
        valid: false,
        seconds: 0,
        error: "Maximum allowed wait time is 30 seconds",
      };
    }
    return { valid: true, seconds, error: "" };
  }

  function handleCountdownInputChange(value: string) {
    setCountdownInput(value);
    setCountdownCompletedMsg("");
    if (!value.trim()) {
      setCountdownError("");
      return;
    }
    const check = validateCountdownValue(value);
    setCountdownError(check.valid ? "" : check.error);
  }

  function handleStartCountdown() {
    const check = validateCountdownValue(countdownInput);
    if (!check.valid) {
      setCountdownError(check.error);
      showToast(check.error, "error");
      logAction("Countdown Validation Error", check.error, "error", { input: countdownInput });
      return;
    }

    if (countdownIntervalRef.current !== null) {
      window.clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }

    const totalSeconds = check.seconds;
    setCountdownError("");
    setCountdownCompletedMsg("");
    setCountdownRemaining(totalSeconds);
    logAction("Start Custom Countdown", `Started ${totalSeconds}s live countdown timer.`, "info", { seconds: totalSeconds });

    let current = totalSeconds;
    countdownIntervalRef.current = window.setInterval(() => {
      current -= 1;
      if (current > 0) {
        setCountdownRemaining(current);
      } else {
        if (countdownIntervalRef.current !== null) {
          window.clearInterval(countdownIntervalRef.current);
          countdownIntervalRef.current = null;
        }
        setCountdownRemaining(null);
        const doneText = `Countdown complete! Custom wait of ${totalSeconds}s finished.`;
        setCountdownCompletedMsg(doneText);
        showToast(doneText, "success");
        logAction("Custom Countdown Complete", doneText, "success", { seconds: totalSeconds });
      }
    }, 1000);
  }

  function handleCancelCountdown() {
    if (countdownIntervalRef.current !== null) {
      window.clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    setCountdownRemaining(null);
    setCountdownCompletedMsg("");
    showToast("Countdown cancelled", "info");
    logAction("Cancel Custom Countdown", "Cancelled active countdown timer.", "warning");
  }

  function renderCustomCountdownSection() {
    return (
      <div
        className="lab-form-group"
        data-testid="lab-custom-countdown-section"
        style={{
          marginTop: "20px",
          paddingTop: "16px",
          borderTop: "1px solid var(--border-hairline)",
        }}
      >
        <div className="lab-element-header">
          <h4>Custom Countdown Timer (Max 30s)</h4>
          <small className="muted">Enter a custom wait time in seconds (numbers only, 1–30s limit)</small>
        </div>

        <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap", marginTop: "6px" }}>
          <input
            type="text"
            inputMode="numeric"
            data-testid="lab-custom-countdown-input"
            aria-label="Custom countdown time in seconds"
            placeholder="Enter seconds (1 - 30)"
            value={countdownInput}
            onChange={(e) => handleCountdownInputChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleStartCountdown();
              } else if (e.key === "Escape") {
                e.preventDefault();
                setCountdownError("");
              }
            }}
            style={{ maxWidth: "220px" }}
          />
          <button
            type="button"
            data-testid="lab-custom-countdown-btn"
            disabled={countdownRemaining !== null}
            onClick={handleStartCountdown}
            style={{ whiteSpace: "nowrap", padding: "10px 18px" }}
          >
            {countdownRemaining !== null ? `Running (${countdownRemaining}s)...` : "Start Countdown"}
          </button>
          {countdownRemaining !== null && (
            <button
              type="button"
              className="secondary-btn"
              data-testid="lab-custom-countdown-cancel-btn"
              onClick={handleCancelCountdown}
              style={{
                whiteSpace: "nowrap",
                padding: "10px 14px",
              }}
            >
              Cancel
            </button>
          )}
        </div>

        {countdownError && (
          <div
            className="error"
            data-testid="lab-custom-countdown-error"
            role="alert"
            aria-live="assertive"
            style={{ marginTop: "10px", padding: "10px 14px", borderRadius: "10px", fontSize: "13px", fontWeight: 600 }}
          >
            {countdownError}
          </div>
        )}

        {countdownRemaining !== null && (
          <div
            className="practice-message"
            data-testid="lab-custom-countdown-timer"
            role="status"
            aria-live="polite"
            style={{
              marginTop: "12px",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              fontWeight: 600,
            }}
          >
            <Timer size={16} strokeWidth={1.75} />
            <span>Waiting... {countdownRemaining}s remaining</span>
          </div>
        )}

        {countdownRemaining === null && countdownCompletedMsg && (
          <div
            className="practice-message"
            data-testid="lab-custom-countdown-complete"
            role="status"
            style={{
              marginTop: "12px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontWeight: 600,
              color: darkMode ? "#34d399" : "#15803d",
            }}
          >
            <CheckCircle2 size={16} strokeWidth={1.75} />
            <span>{countdownCompletedMsg}</span>
          </div>
        )}
      </div>
    );
  }

  const [loadingState, setLoadingState] = useState(false);

  function handleAsyncLoading() {
    if (loadingTimeoutRef.current !== null) {
      window.clearTimeout(loadingTimeoutRef.current);
    }
    setLoadingState(true);
    logAction("Show Loading State", "Loading state initiated...", "info");
    loadingTimeoutRef.current = window.setTimeout(() => {
      loadingTimeoutRef.current = null;
      setLoadingState(false);
      logAction("Show Loading State", "Loading operation completed successfully after 1.5s.", "success");
    }, 1500);
  }

  function handleSimulateApiDelay() {
    if (loadingTimeoutRef.current !== null) {
      window.clearTimeout(loadingTimeoutRef.current);
    }
    setLoadingState(true);
    logAction("Simulate API Delay", "Network request sent to mock server (/api/practice/delay)...", "info");
    loadingTimeoutRef.current = window.setTimeout(() => {
      loadingTimeoutRef.current = null;
      setLoadingState(false);
      logAction("Simulate API Delay", "API response received: HTTP 200 OK (1840ms latency).", "success", { endpoint: "/api/practice/delay", status: 200, latencyMs: 1840 });
    }, 1840);
  }

  function handleAjaxWait(delayMs: number) {
    if (ajaxTimeoutRef.current !== null) {
      window.clearTimeout(ajaxTimeoutRef.current);
    }
    setAjaxLoading(true);
    setAjaxResultText("Loading AJAX data...");
    logAction("AJAX Wait Simulation", `Waiting ${delayMs}ms for async data load...`, "info");
    ajaxTimeoutRef.current = window.setTimeout(() => {
      ajaxTimeoutRef.current = null;
      setAjaxLoading(false);
      const res = `Successfully loaded AJAX payload after ${delayMs}ms delay! Record count: 42.`;
      setAjaxResultText(res);
      logAction("AJAX Wait Simulation", res, "success", { delayMs, recordsLoaded: 42 });
    }, delayMs);
  }

  function handleFileUpload(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      const safeName = sanitizeControlChars(file.name, 255);
      setSelectedFileName(safeName);
      logAction("File Upload", `Selected file: ${safeName} (${file.size} bytes)`, "success", { fileName: safeName, fileSize: file.size });
    }
  }

  const filteredTableRows = initialTableData
    .filter((row) =>
      `${row.id} ${row.name} ${row.department} ${row.role} ${row.status}`.toLowerCase().includes(tableSearch.toLowerCase())
    )
    .sort((a, b) => {
      const result = a[tableSortKey].localeCompare(b[tableSortKey]);
      return tableSortDirection === "asc" ? result : -result;
    });

  const allFilteredSelected =
    filteredTableRows.length > 0 && filteredTableRows.every((row) => selectedRows.includes(row.id));

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
            {specMode
              ? "RAW SPEC MODE: Target locators, trigger events, and verify DOM telemetry directly."
              : "Professional testbed for Selenium, Playwright, and Cypress. Build test scripts, practice element interactions, and inspect telemetry in real time."}
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
            <Sliders size={15} strokeWidth={1.75} />
            <span>Form Controls</span>
          </button>
          <button
            className={activeTab === "tables" ? "lab-tab-btn active" : "lab-tab-btn"}
            data-testid="lab-tab-tables"
            onClick={() => setActiveTab("tables")}
          >
            <TableIcon size={15} strokeWidth={1.75} />
            <span>Data Tables</span>
          </button>
          <button
            className={activeTab === "async" ? "lab-tab-btn active" : "lab-tab-btn"}
            data-testid="lab-tab-async"
            onClick={() => setActiveTab("async")}
          >
            <Timer size={15} strokeWidth={1.75} />
            <span>Async &amp; Waits</span>
          </button>
          <button
            className={activeTab === "frames" ? "lab-tab-btn active" : "lab-tab-btn"}
            data-testid="lab-tab-frames"
            onClick={() => setActiveTab("frames")}
          >
            <Layers size={15} strokeWidth={1.75} />
            <span>Frames &amp; Storage</span>
          </button>
          <button
            className={activeTab === "notifications" ? "lab-tab-btn active" : "lab-tab-btn"}
            data-testid="lab-tab-notifications"
            onClick={() => setActiveTab("notifications")}
          >
            <Bell size={15} strokeWidth={1.75} />
            <span>Toasts &amp; Modals</span>
          </button>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <button
            data-testid="lab-spec-mode-toggle-btn"
            className={`inspector-toggle-pill ${specMode ? "active-spec" : ""}`}
            onClick={() => {
              setSpecMode(!specMode);
              showToast(
                !specMode
                  ? "Caveman / Spec Mode enabled: raw test objectives active"
                  : "Standard View enabled: descriptive guides active",
                "info"
              );
            }}
            title="Toggle between Standard Guide view and Caveman / Raw Spec mode"
          >
            <FileCode2 size={14} strokeWidth={1.75} />
            <span>{specMode ? "Caveman Spec" : "Standard View"}</span>
          </button>
          <button
            data-testid="toggle-inspector-btn"
            className="inspector-toggle-pill"
            onClick={() => {
              const newState = !inspectorVisible;
              setInspectorVisible(newState);
              logAction("Toggle Inspector", newState ? "Live Inspector shown." : "Live Inspector hidden.", "info");
            }}
          >
            {inspectorVisible ? <EyeOff size={14} strokeWidth={1.75} /> : <Terminal size={14} strokeWidth={1.75} />}
            <span>{inspectorVisible ? "Hide Inspector" : "Show Inspector"}</span>
          </button>
        </div>
      </div>

      <div className={`lab-container ${!inspectorVisible ? "inspector-hidden" : ""}`}>
        {/* LEFT COLUMN: Tab Content */}
        <div className="lab-left" data-testid="automation-lab-scroll-view">

          {activeTab === "forms" && (
            <section className="card lab-section animate-fade" data-testid="lab-section-form-controls">
              <h3>Form Controls & Input Elements</h3>
              <p className="muted">
                {specMode
                  ? "RAW SPEC: Form controls & inputs · Target locators · Verify DOM change events"
                  : "Practice web form elements with explicit subheadings, horizontal radio buttons, and vertical checkboxes."}
              </p>

              {specMode && (
                <div className="spec-objective-card" data-testid="spec-objective-box">
                  <div className="spec-badge">CAVEMAN SPEC &middot; FORM CONTROLS OBJECTIVES</div>
                  <ul className="spec-list">
                    <li><strong>Country Select:</strong> <code>input[data-testid="country-search-input"]</code> &rarr; Type query &rarr; [Enter] / click <code>[data-testid="country-option-item"]</code> &rarr; Assert input value.</li>
                    <li><strong>Framework Dropdown:</strong> Open <code>[data-testid="lab-dropdown-select"]</code> &rarr; Pick option &rarr; Assert selection logged in inspector.</li>
                    <li><strong>Multiselect List:</strong> Click items in <code>[data-testid="lab-multiselect"]</code> &rarr; Assert <code>aria-selected="true"</code>.</li>
                    <li><strong>Radio Group:</strong> Click <code>[data-testid="lab-radio-*"]</code> &rarr; Assert checked state &amp; inspector output.</li>
                    <li><strong>Checkbox Group:</strong> Toggle <code>[data-testid="lab-checkbox-*"]</code> &rarr; Assert boolean state.</li>
                    <li><strong>Range Slider:</strong> Drag <code>[data-testid="lab-range-slider"]</code> &rarr; Assert <code>[data-testid="lab-slider-value-display"]</code> matches value.</li>
                    <li><strong>Text Send:</strong> Fill <code>#lab-text-input</code> &rarr; Click <code>Send</code> &rarr; Assert modal <code>[data-testid="lab-sent-confirmation-modal"]</code>.</li>
                    <li><strong>File Upload:</strong> Upload file to <code>#lab-file-input</code> &rarr; Assert filename in <code>[data-testid="lab-uploaded-file-name"]</code>.</li>
                  </ul>
                </div>
              )}

              <div className="lab-form-group">
                <div className="lab-element-header">
                  <h4>Searchable Country Dropdown</h4>
                  <small className="muted">{specMode ? "SPEC: input[data-testid=\"country-search-input\"] -> Type -> Select option" : "Type to filter, use keyboard arrows or click to select"}</small>
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
                      if (!countryOpen && (e.key === "ArrowDown" || e.key === "Enter") && countryQuery.trim().length > 0) {
                        setCountryOpen(true);
                        return;
                      }
                      if (e.key === "ArrowDown") {
                        e.preventDefault();
                        if (countryOpen && filteredCountries.length) {
                          setHighlightedIndex((prev) => (prev + 1) % filteredCountries.length);
                        }
                      } else if (e.key === "ArrowUp") {
                        e.preventDefault();
                        if (countryOpen && filteredCountries.length) {
                          setHighlightedIndex((prev) => (prev - 1 + filteredCountries.length) % filteredCountries.length);
                        }
                      } else if (e.key === "Enter" && countryOpen && filteredCountries.length > 0) {
                        e.preventDefault();
                        const selected = filteredCountries[highlightedIndex] || filteredCountries[0];
                        setCountryQuery(selected);
                        setCountryOpen(false);
                        logAction("Country Selected", `Selected country via keyboard: ${selected}`, "success", { country: selected });
                      } else if (e.key === "Escape") {
                        e.stopPropagation();
                        setCountryOpen(false);
                      }
                    }}
                  />
                  {countryOpen && countryQuery.trim().length > 0 && (
                    <ul className="country-dropdown-list" data-testid="country-dropdown-list">
                      {filteredCountries.length === 0 ? (
                        <li className="country-option-empty" data-testid="country-option-empty">
                          No matching countries found
                        </li>
                      ) : (
                        filteredCountries.map((country, index) => (
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
                <CustomSelect
                  id="lab-dropdown-select"
                  testId="lab-dropdown-select"
                  ariaLabel="Dropdown Select"
                  fullWidth
                  value={dropdownValue}
                  onChange={(val) => {
                    setDropdownValue(val);
                    logAction("Dropdown Change", `Selected framework: ${val}`, "info", { value: val });
                  }}
                  triggerStyle={{ padding: "11px 16px", borderRadius: "12px" }}
                  options={[
                    { value: "Selenium", label: "Selenium WebDriver" },
                    { value: "Playwright", label: "Playwright" },
                    { value: "Cypress", label: "Cypress" },
                  ]}
                />
              </div>

              <div className="lab-form-group">
                <div className="lab-element-header">
                  <h4>Multi-Select List</h4>
                  <small className="muted">Multi-selection options list</small>
                </div>
                <ul
                  id="lab-multiselect"
                  data-testid="lab-multiselect"
                  role="listbox"
                  aria-multiselectable="true"
                  aria-label="Multi-Select List"
                  className="custom-multiselect-list"
                >
                  {[
                    { value: "Selenium", label: "Selenium" },
                    { value: "Playwright", label: "Playwright" },
                    { value: "Cypress", label: "Cypress" },
                    { value: "Appium", label: "Appium" },
                  ].map((item) => {
                    const isSelected = multiSelectValues.includes(item.value);
                    return (
                      <li
                        key={item.value}
                        role="option"
                        aria-selected={isSelected}
                        data-testid={`lab-multiselect-option-${item.value.toLowerCase()}`}
                        className={`theme-dropdown-option${isSelected ? " selected" : ""}`}
                        onClick={() => {
                          const next = isSelected
                            ? multiSelectValues.filter((v) => v !== item.value)
                            : [...multiSelectValues, item.value];
                          setMultiSelectValues(next);
                          logAction("Multi-Select Change", `Selected items: ${next.join(", ") || "None"}`, "info", { values: next });
                        }}
                      >
                        <span>{item.label}</span>
                        {isSelected && <Check size={16} className="theme-dropdown-check" />}
                      </li>
                    );
                  })}
                </ul>
                <small className="muted">Click options to toggle multi-selection</small>
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
                  <span data-testid="lab-slider-value-display" style={{ fontWeight: "700", color: "var(--accent)", background: "var(--accent-soft)", border: "1px solid var(--accent-border)", padding: "2px 10px", borderRadius: "999px", fontSize: "12.5px" }}>
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
                    maxLength={200}
                    value={textInput}
                    onChange={(e) => {
                      setTextInput(e.target.value);
                      if (textInputError) setTextInputError("");
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        const trimmed = textInput.trim();
                        if (!trimmed) {
                          setTextInputError("Message text is required before sending");
                          showToast("Please enter some text first", "warning");
                          return;
                        }
                        setTextInputError("");
                        setSentMessageModal(trimmed);
                        logAction("Send Message", `Successfully sent message: "${trimmed}"`, "success", { text: trimmed });
                      } else if (e.key === "Escape") {
                        e.preventDefault();
                        setTextInput("");
                        setTextInputError("");
                      }
                    }}
                  />
                  <button
                    type="button"
                    data-testid="lab-text-send-btn"
                    style={{ whiteSpace: "nowrap", padding: "10px 20px" }}
                    onClick={() => {
                      const trimmed = textInput.trim();
                      if (!trimmed) {
                        setTextInputError("Message text is required before sending");
                        showToast("Please enter some text first", "warning");
                        return;
                      }
                      setTextInputError("");
                      setSentMessageModal(trimmed);
                      logAction("Send Message", `Successfully sent message: "${trimmed}"`, "success", { text: trimmed });
                    }}
                  >
                    Send
                  </button>
                </div>
                {textInputError && (
                  <div className="error" data-testid="lab-text-input-error" role="alert" style={{ marginTop: "8px", padding: "8px 12px", fontSize: "12px" }}>
                    {textInputError}
                  </div>
                )}
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
                  onChange={handleFileUpload}
                />
                {selectedFileName && <small className="muted" data-testid="lab-uploaded-file-name">Uploaded: {selectedFileName}</small>}
              </div>
            </section>
          )}

          {activeTab === "tables" && (
            <section className="card lab-section animate-fade" data-testid="lab-section-tables">
              <h3>Dynamic Data Tables & Pagination</h3>
              <p className="muted">
                {specMode
                  ? "RAW SPEC: Filter across columns · Sort asc/desc · Bulk select rows · Verify empty state"
                  : "Test table sorting, multi-column search filtering, row selection checkboxes, and bulk actions."}
              </p>

              {specMode && (
                <div className="spec-objective-card" data-testid="spec-objective-box">
                  <div className="spec-badge">CAVEMAN SPEC &middot; DATA TABLES OBJECTIVES</div>
                  <ul className="spec-list">
                    <li><strong>Search Filter:</strong> Fill <code>[data-testid="lab-table-search-input"]</code> &rarr; Assert row count updates in real time.</li>
                    <li><strong>Empty State:</strong> Search non-existent term &rarr; Assert <code>[data-testid="lab-table-empty-row"]</code> &rarr; Click <code>[data-testid="lab-table-empty-reset-filters-btn"]</code>.</li>
                    <li><strong>Column Sort:</strong> Click <code>[data-testid^="sort-header-"]</code> &rarr; Assert column text ordering toggles asc/desc.</li>
                    <li><strong>Select All:</strong> Check <code>[data-testid="lab-table-select-all"]</code> &rarr; Assert all filtered rows checked.</li>
                    <li><strong>Row Select:</strong> Check <code>[data-testid^="lab-table-row-checkbox-"]</code> &rarr; Assert <code>[data-testid="lab-table-selected-count"]</code> increments.</li>
                    <li><strong>Bulk Action:</strong> Select row(s) &rarr; Click <code>[data-testid="lab-table-bulk-action-btn"]</code> &rarr; Assert success in inspector.</li>
                  </ul>
                </div>
              )}

              <div className="lab-form-group">
                <input
                  data-testid="lab-table-search-input"
                  placeholder="Filter table rows across all columns..."
                  value={tableSearch}
                  onChange={(e) => setTableSearch(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      showToast(
                        tableSearch.trim()
                          ? `Filtered practice table for "${tableSearch.trim()}"`
                          : "Showing all practice table rows",
                        "info"
                      );
                    } else if (e.key === "Escape" && tableSearch) {
                      e.preventDefault();
                      setTableSearch("");
                    }
                  }}
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
                          checked={allFilteredSelected}
                          onChange={(e) => {
                            const visibleIds = filteredTableRows.map((r) => r.id);
                            if (e.target.checked) {
                              setSelectedRows((prev) => Array.from(new Set([...prev, ...visibleIds])));
                              logAction("Table Select All", `Selected all ${visibleIds.length} rows.`, "info");
                            } else {
                              setSelectedRows((prev) => prev.filter((id) => !visibleIds.includes(id)));
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
                        <td colSpan={6} style={{ textAlign: "center", padding: "28px 16px" }}>
                          <div className="empty-state-box">
                            <div className="empty-state-title">No matching records found</div>
                            <p className="muted" style={{ margin: "4px 0 12px" }}>
                              No table rows match your search filter "{tableSearch}".
                            </p>
                            <button
                              type="button"
                              className="empty-reset-btn"
                              data-testid="lab-table-empty-reset-filters-btn"
                              onClick={() => {
                                setTableSearch("");
                                showToast("Table filters reset", "info");
                                logAction("Reset Table Filter", "Cleared table search filter.", "info");
                              }}
                            >
                              Reset Filters
                            </button>
                          </div>
                        </td>
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
              <p className="muted">
                {specMode
                  ? "RAW SPEC: Explicit waits without hard sleeps · Spinner unmount · AJAX latency · Countdown"
                  : "Practice explicit waits (`WebDriverWait`, `cy.wait()`, `page.waitForSelector()`) and loaders."}
              </p>

              {specMode && (
                <div className="spec-objective-card" data-testid="spec-objective-box">
                  <div className="spec-badge">CAVEMAN SPEC &middot; ASYNC &amp; WAITS OBJECTIVES</div>
                  <ul className="spec-list">
                    <li><strong>Loading Spinner:</strong> Click <code>[data-testid="lab-loading-state-btn"]</code> &rarr; Wait for <code>[data-testid="lab-loading-indicator"]</code> to appear &rarr; Wait until unmounted (1.5s).</li>
                    <li><strong>API Delay:</strong> Click <code>[data-testid="lab-api-delay-btn"]</code> &rarr; Poll until loading clears &rarr; Assert HTTP 200 payload in inspector.</li>
                    <li><strong>AJAX Wait:</strong> Click <code>[data-testid="lab-ajax-fast-btn"]</code> &rarr; Wait until <code>[data-testid="lab-ajax-result-text"]</code> contains "Record count: 42".</li>
                    <li><strong>Countdown Timer:</strong> Enter 1-30 in <code>[data-testid="lab-custom-countdown-input"]</code> &rarr; Click Start &rarr; Wait for completion badge.</li>
                  </ul>
                </div>
              )}

              <AsyncWaitFlowDiagram />

              <div className="lab-button-grid" style={{ gridTemplateColumns: "repeat(2, 1fr)" }}>
                <button data-testid="lab-loading-state-btn" onClick={handleAsyncLoading}>Show Loading State (1.5s)</button>
                <button data-testid="lab-api-delay-btn" onClick={handleSimulateApiDelay}>Simulate API Delay (1.8s)</button>
                <button data-testid="lab-ajax-fast-btn" onClick={() => handleAjaxWait(1000)}>Load AJAX (1s Wait)</button>
                <button data-testid="lab-ajax-slow-btn" onClick={() => handleAjaxWait(3500)}>Load AJAX (3.5s Wait)</button>
              </div>

              {loadingState && (
                <div className="practice-message" data-testid="lab-loading-indicator" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <Loader2 size={16} strokeWidth={1.75} />
                  <span>Processing background operation...</span>
                </div>
              )}

              <div className="practice-message" data-testid="lab-ajax-result-box" style={{ marginTop: "16px" }}>
                {ajaxLoading ? <span className="export-progress"><span /> Loading async data...</span> : <strong data-testid="lab-ajax-result-text">{ajaxResultText}</strong>}
              </div>

              {renderCustomCountdownSection()}
            </section>
          )}

          {activeTab === "frames" && (
            <section className="card lab-section animate-fade" data-testid="lab-section-frames-storage">
              <h3>Frames, Shadow DOM & Web Storage</h3>
              <p className="muted">
                {specMode
                  ? "RAW SPEC: Context switch to iframe · Pierce shadow root · Read/write Web Storage & document.cookie"
                  : "Practice iframe context switching, shadow DOM piercing, and web storage."}
              </p>

              {specMode && (
                <div className="spec-objective-card" data-testid="spec-objective-box">
                  <div className="spec-badge">CAVEMAN SPEC &middot; FRAMES &amp; STORAGE OBJECTIVES</div>
                  <ul className="spec-list">
                    <li><strong>Iframe:</strong> Context switch to <code>[data-testid="lab-iframe-container"]</code> &rarr; Click <code>[data-testid="lab-iframe-btn"]</code> &rarr; Assert button text changes to "Clicked Inside Iframe".</li>
                    <li><strong>Shadow Root:</strong> Pierce <code>[data-testid="lab-shadow-container"]</code> shadow root &rarr; Click <code>[data-testid="lab-shadow-btn"]</code> &rarr; Assert text changes to "Shadow Element Triggered".</li>
                    <li><strong>LocalStorage:</strong> Fill key/value &rarr; Click <code>[data-testid="lab-set-storage-btn"]</code> &rarr; Assert stored. Click <code>[data-testid="lab-get-storage-btn"]</code> &rarr; Assert inspector log.</li>
                    <li><strong>Cookies:</strong> Click <code>[data-testid="lab-set-cookie-btn"]</code> &rarr; Click <code>[data-testid="lab-get-cookie-btn"]</code> &rarr; Assert <code>[data-testid="lab-cookie-status"]</code> contains session cookie.</li>
                  </ul>
                </div>
              )}

              <div className="lab-form-group">
                <label>Simulated Iframe Document</label>
                <div className="iframe-box" data-testid="lab-iframe-container">
                  <p className="muted" style={{ margin: "0 0 10px" }}><code>[Iframe Context Window]</code></p>
                  <button
                    data-testid="lab-iframe-btn"
                    onClick={() => {
                      setIframeClicked(true);
                      logAction("Iframe Interaction", "Clicked button inside simulated iframe context.", "success");
                    }}
                  >
                    {iframeClicked ? "Clicked Inside Iframe" : "Click Button Inside Iframe"}
                  </button>
                </div>
              </div>

              <div className="lab-form-group" style={{ marginTop: "16px" }}>
                <label>Shadow DOM Root Container</label>
                <div className="shadow-box" data-testid="lab-shadow-container">
                  <p className="muted" style={{ margin: "0 0 10px" }}><code>[Closed/Open Shadow Root]</code></p>
                  <button
                    data-testid="lab-shadow-btn"
                    onClick={() => {
                      setShadowDomClicked(true);
                      logAction("Shadow DOM Interaction", "Interacted with element inside Shadow DOM boundary.", "success");
                    }}
                  >
                    {shadowDomClicked ? "Shadow Element Triggered" : "Interact with Shadow DOM Element"}
                  </button>
                </div>
              </div>

              <div className="lab-form-group" style={{ marginTop: "20px" }}>
                <label>Web Storage & Cookies</label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginTop: "6px" }}>
                  <input
                    data-testid="lab-storage-key-input"
                    value={storageKey}
                    maxLength={128}
                    onChange={(e) => {
                      setStorageKey(e.target.value);
                      if (storageError) setStorageError("");
                    }}
                    placeholder="Key"
                  />
                  <input
                    data-testid="lab-storage-val-input"
                    value={storageVal}
                    maxLength={2048}
                    onChange={(e) => {
                      setStorageVal(e.target.value);
                      if (storageError) setStorageError("");
                    }}
                    placeholder="Value"
                  />
                </div>
                {storageError && (
                  <div className="error" data-testid="lab-storage-error" role="alert" style={{ marginTop: "8px", padding: "8px 12px", fontSize: "12px" }}>
                    {storageError}
                  </div>
                )}
                <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                  <button
                    data-testid="lab-set-storage-btn"
                    onClick={() => {
                      const k = sanitizeControlChars(storageKey.trim(), 128);
                      const v = sanitizeControlChars(storageVal.trim(), 2048);
                      if (!k) {
                        setStorageError("Storage key is required");
                        showToast("Storage key is required", "error");
                        return;
                      }
                      if (!v) {
                        setStorageError("Storage value is required");
                        showToast("Storage value is required", "error");
                        return;
                      }
                      if (RESERVED_STORAGE_KEYS.has(k)) {
                        setStorageError("Reserved application storage key cannot be overwritten in sandbox");
                        showToast("Reserved storage key blocked", "error");
                        return;
                      }
                      setStorageError("");
                      localStorage.setItem(k, v);
                      showToast(`Saved "${k}" to localStorage`, "success");
                      logAction("Set LocalStorage", `Set ${k} = ${v}`, "success", { key: k, value: v });
                    }}
                  >
                    Set LocalStorage
                  </button>
                  <button
                    data-testid="lab-get-storage-btn"
                    onClick={() => {
                      const k = sanitizeControlChars(storageKey.trim(), 128);
                      if (!k) {
                        setStorageError("Storage key is required to read localStorage");
                        showToast("Storage key is required", "error");
                        return;
                      }
                      setStorageError("");
                      const val = localStorage.getItem(k);
                      logAction("Get LocalStorage", `Retrieved ${k}: "${val || "null"}"`, "info", { key: k, value: val });
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
                      document.cookie = "automation_session=active_99; path=/; SameSite=Strict;";
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
              <p className="muted">
                {specMode
                  ? "RAW SPEC: Dismiss transient toasts · Assert static modal · Parse random alert popups · Run timer"
                  : "Test notification banners, random alert popups, custom countdown timers, and modal assertions."}
              </p>

              {specMode && (
                <div className="spec-objective-card" data-testid="spec-objective-box">
                  <div className="spec-badge">CAVEMAN SPEC &middot; NOTIFICATIONS &amp; MODALS OBJECTIVES</div>
                  <ul className="spec-list">
                    <li><strong>Toast Banners:</strong> Click <code>[data-testid^="lab-toast-"]</code> &rarr; Assert <code>[data-testid="toast-message"]</code> visible &rarr; Wait 2.8s auto-dismiss.</li>
                    <li><strong>Static Modal:</strong> Click <code>[data-testid="lab-open-modal-btn"]</code> &rarr; Assert <code>[data-testid="lab-practice-modal"]</code> visible &rarr; Click <code>[data-testid="lab-modal-close-btn"]</code> or press Escape.</li>
                    <li><strong>Random Popup:</strong> Click <code>[data-testid="lab-random-popup-btn"]</code> &rarr; Extract <code>[data-testid="lab-random-popup-id"]</code> &rarr; Assert severity badge &rarr; Dismiss via <code>[data-testid="lab-random-popup-close-btn"]</code>.</li>
                    <li><strong>Countdown Timer:</strong> Configure custom countdown &rarr; Assert live timer DOM updates.</li>
                  </ul>
                </div>
              )}

              <div className="lab-button-grid">
                <button data-testid="lab-toast-success-btn" onClick={() => handleTriggerToast("success")}>Success Toast</button>
                <button data-testid="lab-toast-error-btn" onClick={() => handleTriggerToast("error")}>Error Toast</button>
                <button data-testid="lab-toast-warning-btn" onClick={() => handleTriggerToast("warning")}>Warning Toast</button>
                <button data-testid="lab-toast-info-btn" onClick={() => handleTriggerToast("info")}>Info Toast</button>
                <button data-testid="lab-open-modal-btn" onClick={() => { setModalOpen(true); logAction("Open Modal", "Practice modal opened.", "info"); }}>Open Modal</button>
                <button data-testid="lab-random-popup-btn" onClick={handleTriggerRandomPopup}>Random Popup</button>
              </div>

              {renderCustomCountdownSection()}
            </section>
          )}

        </div>

        {/* RIGHT COLUMN: Live Result Inspector & Output Console */}
        {inspectorVisible && (
          <div className="lab-right inspector-panel animate-fade" data-testid="automation-lab-inspector-panel">
            <div className="card inspector-card">
              <div className="between inspector-header">
                <h3 style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
                  <Terminal size={16} strokeWidth={1.75} />
                  <span>Live Inspector Console</span>
                </h3>
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
                <h4 style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                  <History size={14} strokeWidth={1.75} />
                  <span>Action History Log</span>
                </h4>
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
                  className="full secondary-btn"
                  style={{ marginTop: "16px", background: "var(--accent-soft)", color: "var(--accent)", border: "1px solid var(--accent-border)" }}
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
        <div
          className="modal-backdrop"
          data-testid="lab-practice-modal-backdrop"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setModalOpen(false);
              logAction("Close Modal", "Practice modal closed.", "info");
            }
          }}
        >
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
        <div
          className="modal-backdrop"
          data-testid="lab-sent-confirmation-modal-backdrop"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSentMessageModal(null);
          }}
        >
          <div className="modal" data-testid="lab-sent-confirmation-modal" style={{ textAlign: "center" }}>
            <h2>Message Sent Successfully!</h2>
            <p className="muted" style={{ margin: "10px 0" }}>Your message was transmitted and confirmed:</p>
            <div style={{ background: "var(--bg-raised)", border: "1px solid var(--border-hairline)", padding: "12px", borderRadius: "10px", fontWeight: "700", color: "var(--text-primary)", margin: "16px 0" }}>
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

      {randomPopup && (
        <div
          className="modal-backdrop"
          data-testid="lab-random-popup-backdrop"
          onClick={() => setRandomPopup(null)}
        >
          <div
            className="modal"
            data-testid="lab-random-popup-modal"
            role="alertdialog"
            aria-labelledby="lab-random-popup-title"
            aria-describedby="lab-random-popup-message"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="between" style={{ marginBottom: "12px", alignItems: "center" }}>
              <span
                className={`status-badge ${randomPopup.severity}`}
                data-testid="lab-random-popup-badge"
              >
                {randomPopup.severity.toUpperCase()} ALERT
              </span>
              <code
                data-testid="lab-random-popup-id"
                style={{
                  fontSize: "12px",
                  padding: "4px 8px",
                  borderRadius: "6px",
                  background: "var(--bg-raised)",
                  color: "var(--text-secondary)",
                  border: "1px solid var(--border-hairline)",
                }}
              >
                {randomPopup.popupId} · {randomPopup.timestamp}
              </code>
            </div>

            <h2 id="lab-random-popup-title" data-testid="lab-random-popup-title" style={{ margin: "0 0 8px" }}>
              {randomPopup.title}
            </h2>
            <p id="lab-random-popup-message" data-testid="lab-random-popup-message" style={{ lineHeight: 1.5 }}>
              {randomPopup.message}
            </p>

            <div className="right" style={{ marginTop: "18px", gap: "10px" }}>
              <button
                type="button"
                className="secondary-btn"
                data-testid="lab-random-popup-next-btn"
                onClick={handleTriggerRandomPopup}
              >
                Trigger Another
              </button>
              <button
                type="button"
                data-testid="lab-random-popup-close-btn"
                onClick={() => {
                  setRandomPopup(null);
                  logAction("Close Random Popup", `Dismissed random popup ${randomPopup.popupId}.`, "info");
                }}
              >
                Acknowledge & Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
