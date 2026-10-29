import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { Sun, Moon } from "lucide-react";

export default function LoginPage() {
  const { login, showToast, users, darkMode, toggleDarkMode } = useApp();
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

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const ok = await login(email, password);
    setLoading(false);

    if (!ok) {
      setError("Invalid credentials or disabled user");
      return;
    }

    showToast("Login successful", "success");
    const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    const isAdmin = user?.role === "Admin User" || user?.role === "Super User";
    navigate(isAdmin ? "/admin" : "/test-user");
  }

  return (
    <main className={`login-page ${darkMode ? "dark" : ""}`} data-testid="login-page" aria-label="Login page" style={{ position: "relative" }}>
      <button
        className="theme-toggle-button login-theme-toggle"
        data-testid="dark-mode-toggle"
        onClick={toggleDarkMode}
        style={{
          position: "absolute",
          top: "20px",
          right: "20px",
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
          zIndex: 10,
        }}
      >
        {darkMode ? <Sun size={16} color="#ffffff" /> : <Moon size={16} color="#1f2937" />}
        <span style={{ color: darkMode ? "#ffffff" : "#1f2937" }}>{darkMode ? "Light Mode" : "Dark Mode"}</span>
      </button>
      <section className="login-hero" data-testid="login-hero-section" aria-label="Automation practice introduction">
        <h1 data-testid="login-page-title">Automation Studio</h1>
        <p data-testid="login-page-subtitle">Practice. Automate. Master.</p>
        <div className="mock-screen" data-testid="login-illustration" aria-hidden="true">
          ▦
        </div>
        <div className="feature" data-testid="login-feature-role-access">Role based access</div>
        <div className="feature" data-testid="login-feature-crud">CRUD operations</div>
        <div className="feature" data-testid="login-feature-validations">Forms & validations</div>
        <div className="feature" data-testid="login-feature-tables">Tables, filters & modals</div>
      </section>

      <form className="login-card" data-testid="login-form" aria-label="Login form" onSubmit={submit}>
        <h2 data-testid="login-form-title">Welcome Back!</h2>
        <p data-testid="login-form-subtitle">Please login to your account</p>

        <label htmlFor="login-email-input">Email</label>
        <input
          id="login-email-input"
          data-testid="login-username-input"
          aria-label="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter email"
          autoComplete="username"
        />

        <label htmlFor="login-password-input">Password</label>
        <div className="password-row" data-testid="login-password-row">
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
            data-testid="login-show-password-button"
            aria-label={showPassword ? "Hide password" : "Show password"}
            onClick={() => setShowPassword(!showPassword)}
          >
            👁
          </button>
        </div>

        <div className="between" data-testid="login-options-row" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "16px 0" }}>
          <label htmlFor="login-remember-checkbox" style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", margin: 0, fontSize: "14px" }}>
            <input
              id="login-remember-checkbox"
              data-testid="login-remember-me-checkbox"
              aria-label="Remember me"
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              style={{ width: "16px", height: "16px", borderRadius: "4px", margin: 0 }}
            />
            <span>Remember me</span>
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
          className="primary full"
          data-testid="login-submit-button"
          aria-label="Login"
          disabled={loading}
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        {loading && <div data-testid="login-page-loader" aria-live="polite">Logging in...</div>}

        <aside
            className="credentials"
            data-testid="login-demo-credentials-box"
            aria-label="Demo credentials"
          >
            <h3 data-testid="demo-credentials-title">
              Demo Credentials <span style={{ fontSize: "11px", color: "#6046e8", fontWeight: "normal" }}>(Click to auto-fill)</span>
            </h3>

            <div
              className="credential-row clickable-credential"
              data-testid="super-user-credentials"
              onClick={() => {
                setEmail("admin@example.com");
                setPassword("admin123");
                showToast("Super User credentials loaded", "info");
              }}
              style={{ cursor: "pointer" }}
              title="Click to fill Super User credentials"
            >
              <strong>Super User</strong>
              <span>admin@example.com / admin123</span>
            </div>

            <div
              className="credential-row clickable-credential"
              data-testid="admin-user-credentials"
              onClick={() => {
                setEmail("manager@example.com");
                setPassword("manager123");
                showToast("Admin User credentials loaded", "info");
              }}
              style={{ cursor: "pointer" }}
              title="Click to fill Admin User credentials"
            >
              <strong>Admin User</strong>
              <span>manager@example.com / manager123</span>
            </div>

            <div
              className="credential-row clickable-credential"
              data-testid="test-user-credentials"
              onClick={() => {
                setEmail("test@example.com");
                setPassword("test123");
                showToast("Test User credentials loaded", "info");
              }}
              style={{ cursor: "pointer" }}
              title="Click to fill Test User credentials"
            >
              <strong>Test User</strong>
              <span>test@example.com / test123</span>
            </div>

            <div
              className="credential-note"
              data-testid="login-page-note"
            >
              Role-based access and permissions are enabled for automation practice.
            </div>
          </aside>

        {forgotPasswordModal && (
          <div className="modal-backdrop" data-testid="forgot-password-modal">
            <div className="modal">
              <h2>Reset Password</h2>
              <p>Enter your account email to receive a password reset link.</p>

              <label>Email Address</label>
              <input
                data-testid="forgot-password-email-input"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                placeholder="Enter your email"
              />

              {forgotSent && (
                <div className="practice-message" style={{ color: "#16703a", background: "#dcfce7" }} data-testid="forgot-password-success-message">
                  Password reset link sent to {forgotEmail || "your email"} successfully!
                </div>
              )}

              <div className="right">
                <button
                  type="button"
                  data-testid="forgot-password-cancel-button"
                  onClick={() => {
                    setForgotPasswordModal(false);
                    setForgotSent(false);
                    setForgotEmail("");
                  }}
                >
                  Close
                </button>
                <button
                  type="button"
                  data-testid="forgot-password-submit-button"
                  onClick={() => {
                    if (!forgotEmail) {
                      showToast("Please enter an email", "error");
                      return;
                    }
                    setForgotSent(true);
                    showToast("Password reset link sent", "success");
                  }}
                >
                  Send Reset Link
                </button>
              </div>
            </div>
          </div>
        )}
      </form>
    </main>
  );
}
