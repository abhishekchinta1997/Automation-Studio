import { FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import ThemeSelect from "../components/ThemeSelect";
import { Terminal, Shield, Database, CheckSquare, Table as TableIcon, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const { login, showToast, users, darkMode } = useApp();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [forgotPasswordModal, setForgotPasswordModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSent, setForgotSent] = useState(false);
  const [forgotError, setForgotError] = useState("");

  useEffect(() => {
    if (!forgotPasswordModal) return;
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setForgotPasswordModal(false);
        setForgotSent(false);
        setForgotEmail("");
        setForgotError("");
      }
    }
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [forgotPasswordModal]);

  function handleForgotPasswordSubmit() {
    const trimmed = forgotEmail.trim();
    if (!trimmed) {
      setForgotSent(false);
      setForgotError("Email address is required");
      showToast("Please enter an email", "error");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setForgotSent(false);
      setForgotError("Please enter a valid email address");
      showToast("Please enter a valid email address", "error");
      return;
    }
    setForgotError("");
    setForgotSent(true);
    showToast("Password reset link sent", "success");
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError("");
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      setError("Email and password are required");
      showToast("Email and password are required", "error");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setError("Please enter a valid email address");
      showToast("Please enter a valid email address", "error");
      return;
    }

    setLoading(true);

    const ok = await login(trimmedEmail, password);
    setLoading(false);

    if (!ok) {
      setError("Invalid credentials or disabled user");
      return;
    }

    showToast("Login successful", "success");
    const user = users.find((u) => u.email.toLowerCase() === trimmedEmail.toLowerCase());
    const isAdmin = user?.role === "Admin User" || user?.role === "Super User";
    navigate(isAdmin ? "/admin" : "/test-user");
  }

  return (
    <main
      className={`login-page ${darkMode ? "dark" : ""}`}
      data-testid="login-page"
      aria-label="Login page"
    >
      <ThemeSelect style={{ position: "absolute", top: "16px", right: "24px", zIndex: 50 }} />

      <div className="login-workbench-grid">
        <section
          className="login-hero"
          data-testid="login-hero-section"
          aria-label="Automation practice introduction"
        >
          <div className="login-brand-header">
            <div className="login-brand-mark">
              <Terminal size={22} strokeWidth={2} />
            </div>
            <div>
              <div className="login-eyebrow">Deterministic QA Testbed · Playwright · Selenium · Cypress</div>
              <h1 data-testid="login-page-title">Automation Studio</h1>
            </div>
          </div>

          <p data-testid="login-page-subtitle" className="login-lead">
            End-to-end web automation workbench with stable <code>data-testid</code> contracts, role-based routing, async wait targets, and live DOM telemetry
          </p>

          <div
            data-testid="login-illustration"
            className="login-specs-panel"
            aria-hidden="true"
          >
            <div className="login-specs-header">
              <span className="login-specs-dot" />
              <code>test-targets.manifest.json</code>
              <span className="login-specs-count">4 modules ready</span>
            </div>

            <div className="login-specs-list">
              <div className="feature login-spec-row" data-testid="login-feature-role-access">
                <Shield size={16} strokeWidth={1.75} className="login-spec-icon" />
                <div className="login-spec-body">
                  <div className="login-spec-title">Role-Based Access Control</div>
                  <div className="login-spec-meta">Super User, Admin User, and Test User route guards</div>
                </div>
                <code className="login-spec-tag">/admin/*</code>
              </div>

              <div className="feature login-spec-row" data-testid="login-feature-crud">
                <Database size={16} strokeWidth={1.75} className="login-spec-icon" />
                <div className="login-spec-body">
                  <div className="login-spec-title">Directory CRUD &amp; Bulk State</div>
                  <div className="login-spec-meta">Create, edit, lock, reset password, and seed batch users</div>
                </div>
                <code className="login-spec-tag">USR-1001</code>
              </div>

              <div className="feature login-spec-row" data-testid="login-feature-validations">
                <CheckSquare size={16} strokeWidth={1.75} className="login-spec-icon" />
                <div className="login-spec-body">
                  <div className="login-spec-title">Interactive Sandbox &amp; Waits</div>
                  <div className="login-spec-meta">Typeahead, multi-select, timers, storage, and live inspector</div>
                </div>
                <code className="login-spec-tag">/lab</code>
              </div>

              <div className="feature login-spec-row" data-testid="login-feature-tables">
                <TableIcon size={16} strokeWidth={1.75} className="login-spec-icon" />
                <div className="login-spec-body">
                  <div className="login-spec-title">Dynamic Web Tables</div>
                  <div className="login-spec-meta">Multi-column natural sort, inline row edit, CSV/JSON export</div>
                </div>
                <code className="login-spec-tag">/tables</code>
              </div>
            </div>
          </div>
        </section>

        <form
          className="login-card"
          data-testid="login-form"
          aria-label="Login form"
          onSubmit={submit}
        >
          <div className="login-card-header">
            <h2 data-testid="login-form-title">Sign in to Workbench</h2>
            <p data-testid="login-form-subtitle">
              Authenticate with a test role or select a preset profile below
            </p>
          </div>

          <label htmlFor="login-email-input">Email</label>
          <input
            id="login-email-input"
            data-testid="login-username-input"
            aria-label="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@example.com"
            autoComplete="username"
          />

          <label htmlFor="login-password-input">Password</label>
          <div
            className="password-row"
            data-testid="login-password-row"
          >
            <input
              id="login-password-input"
              data-testid="login-password-input"
              aria-label="Password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              autoComplete="current-password"
            />
            <button
              type="button"
              className="password-toggle-btn"
              data-testid="login-show-password-button"
              aria-label={showPassword ? "Hide password" : "Show password"}
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={16} strokeWidth={1.75} /> : <Eye size={16} strokeWidth={1.75} />}
            </button>
          </div>

          <div className="between login-options-row" data-testid="login-options-row">
            <label htmlFor="login-remember-checkbox" className="login-remember-label">
              <input
                id="login-remember-checkbox"
                data-testid="login-remember-me-checkbox"
                aria-label="Remember me"
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
              />
              <span>Remember session</span>
            </label>
            <button
              type="button"
              className="link"
              data-testid="login-forgot-password-link"
              aria-label="Forgot password"
              onClick={() => setForgotPasswordModal(true)}
            >
              Forgot password?
            </button>
          </div>

          {error && (
            <div className="error" data-testid="login-error-alert" role="alert" aria-live="assertive">
              {error}
            </div>
          )}

          <button
            className="primary full login-submit-btn"
            data-testid="login-submit-button"
            aria-label="Login"
            disabled={loading}
          >
            {loading ? "Authenticating..." : "Sign In"}
          </button>

          {loading && (
            <div data-testid="login-page-loader" aria-live="polite" className="login-loader-text">
              Logging in...
            </div>
          )}

          <aside
            className="credentials"
            data-testid="login-demo-credentials-box"
            aria-label="Demo credentials"
          >
            <div className="credentials-header">
              <h3 data-testid="demo-credentials-title">Test Fixtures</h3>
              <span>Click row to populate</span>
            </div>

            <div
              className="credential-row clickable-credential"
              data-testid="super-user-credentials"
              onClick={() => {
                setEmail("admin@example.com");
                setPassword("admin123");
                showToast("Super User credentials loaded", "info");
              }}
              title="Click to fill Super User credentials"
            >
              <strong>Super User</strong>
              <code>admin@example.com / admin123</code>
            </div>

            <div
              className="credential-row clickable-credential"
              data-testid="admin-user-credentials"
              onClick={() => {
                setEmail("manager@example.com");
                setPassword("manager123");
                showToast("Admin User credentials loaded", "info");
              }}
              title="Click to fill Admin User credentials"
            >
              <strong>Admin User</strong>
              <code>manager@example.com / manager123</code>
            </div>

            <div
              className="credential-row clickable-credential"
              data-testid="test-user-credentials"
              onClick={() => {
                setEmail("test@example.com");
                setPassword("test123");
                showToast("Test User credentials loaded", "info");
              }}
              title="Click to fill Test User credentials"
            >
              <strong>Test User</strong>
              <code>test@example.com / test123</code>
            </div>

            <div
              className="credential-note"
              data-testid="login-page-note"
            >
              Role-based access enabled for automation practice
            </div>
          </aside>

          {forgotPasswordModal && (
            <div
              className="modal-backdrop"
              data-testid="forgot-password-modal"
              onClick={(e) => {
                if (e.target === e.currentTarget) {
                  setForgotPasswordModal(false);
                  setForgotSent(false);
                  setForgotEmail("");
                  setForgotError("");
                }
              }}
            >
              <div className="modal">
                <h2>Reset Password</h2>
                <p className="muted">Enter your account email to receive a password reset link</p>

                <label>Email Address</label>
                <input
                  data-testid="forgot-password-email-input"
                  value={forgotEmail}
                  onChange={(e) => {
                    setForgotEmail(e.target.value);
                    if (forgotError) setForgotError("");
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleForgotPasswordSubmit();
                    }
                  }}
                  placeholder="Enter your email"
                />

                {forgotError && (
                  <div className="error" data-testid="forgot-password-error-message" role="alert">
                    {forgotError}
                  </div>
                )}

                {forgotSent && (
                  <div className="practice-message" data-testid="forgot-password-success-message">
                    Password reset link sent to {forgotEmail || "your email"} successfully
                  </div>
                )}

                <div className="right">
                  <button
                    type="button"
                    className="secondary-btn"
                    data-testid="forgot-password-cancel-button"
                    onClick={() => {
                      setForgotPasswordModal(false);
                      setForgotSent(false);
                      setForgotEmail("");
                      setForgotError("");
                    }}
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    data-testid="forgot-password-submit-button"
                    onClick={handleForgotPasswordSubmit}
                  >
                    Send Reset Link
                  </button>
                </div>
              </div>
            </div>
          )}
        </form>
      </div>

      <footer
        data-testid="login-footer"
        className="login-footer"
      >
        <div className="footer-inner">
          <div className="footer-copy-group">
            <span className="footer-copy">© 2026 Automation Studio · Built by Abhishek Chinta</span>
            <span className="footer-badge" title="Developed with OmniRoute (Claude Code) & Antigravity">
              Developed with OmniRoute (Claude Code) & Antigravity
            </span>
          </div>
          <div className="footer-links-row">
            <a
              href="https://github.com/abhishekchinta1997/"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-profile-link"
              data-testid="login-footer-github-link"
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
              data-testid="login-footer-linkedin-link"
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
              data-testid="login-footer-portfolio-link"
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
    </main>
  );
}
