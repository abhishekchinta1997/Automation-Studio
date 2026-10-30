import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { Sun, Moon, Bot, Shield, Database, CheckSquare, Table as TableIcon, Eye, EyeOff } from "lucide-react";

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
    <main
      className={`login-page ${darkMode ? "dark" : ""}`}
      data-testid="login-page"
      aria-label="Login page"
      style={{
        position: "relative",
        minHeight: "100vh",
        maxHeight: "100vh",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        background: darkMode ? "#0f172a" : "#f8fafc",
      }}
    >
      {/* Decorative background glow orb */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          width: "500px",
          height: "500px",
          borderRadius: "50%",
          background: darkMode
            ? "radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, rgba(15, 23, 42, 0) 70%)"
            : "radial-gradient(circle, rgba(99, 102, 241, 0.12) 0%, rgba(248, 250, 252, 0) 70%)",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      <button
        className="theme-toggle-button login-theme-toggle"
        data-testid="dark-mode-toggle"
        onClick={toggleDarkMode}
        style={{
          position: "absolute",
          top: "20px",
          right: "24px",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          padding: "6px 12px",
          borderRadius: "12px",
          fontWeight: 600,
          fontSize: "13px",
          cursor: "pointer",
          background: darkMode ? "rgba(255, 255, 255, 0.1)" : "#ffffff",
          color: darkMode ? "#ffffff" : "#1e293b",
          border: darkMode ? "1px solid rgba(255, 255, 255, 0.2)" : "1px solid #cbd5e1",
          boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
          zIndex: 50,
        }}
      >
        {darkMode ? <Sun size={15} color="#ffffff" /> : <Moon size={15} color="#1e293b" />}
        <span style={{ color: darkMode ? "#ffffff" : "#1e293b" }}>{darkMode ? "Light Mode" : "Dark Mode"}</span>
      </button>

      <div
        style={{
          position: "relative",
          zIndex: 1,
          width: "100%",
          maxWidth: "1080px",
          display: "grid",
          gridTemplateColumns: "1.1fr 0.9fr",
          alignItems: "center",
          gap: "48px",
          margin: "0 auto",
        }}
      >
        <section
          className="login-hero"
          data-testid="login-hero-section"
          aria-label="Automation practice introduction"
          style={{ paddingLeft: "12px" }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "20px" }}>
            <div
              style={{
                width: "60px",
                height: "60px",
                borderRadius: "16px",
                background: darkMode ? "linear-gradient(135deg, #6366f1 0%, #4338ca 100%)" : "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: darkMode ? "0 0 24px rgba(99, 102, 241, 0.5)" : "0 8px 20px rgba(99, 102, 241, 0.25)",
                border: darkMode ? "1px solid rgba(255, 255, 255, 0.2)" : "1px solid rgba(255, 255, 255, 0.4)",
              }}
            >
              <Bot size={34} color="#ffffff" />
            </div>
            <div>
              <h1
                data-testid="login-page-title"
                style={{
                  fontSize: "38px",
                  margin: 0,
                  fontWeight: 800,
                  letterSpacing: "-0.5px",
                  color: darkMode ? "#ffffff" : "#0f172a",
                }}
              >
                Automation Studio
              </h1>
              <p
                data-testid="login-page-subtitle"
                style={{
                  fontSize: "15px",
                  margin: "4px 0 0",
                  color: darkMode ? "#94a3b8" : "#475569",
                  fontWeight: 600,
                }}
              >
                Practice. Automate. Master.
              </p>
            </div>
          </div>

          <div
            data-testid="login-illustration"
            aria-hidden="true"
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "14px",
              marginTop: "20px",
            }}
          >
            <div
              className="feature"
              data-testid="login-feature-role-access"
              style={{
                background: darkMode ? "rgba(30, 41, 59, 0.8)" : "#ffffff",
                border: darkMode ? "1px solid rgba(51, 65, 85, 0.9)" : "1px solid #e2e8f0",
                padding: "16px",
                borderRadius: "16px",
                display: "flex",
                alignItems: "center",
                gap: "12px",
                boxShadow: darkMode ? "0 4px 12px rgba(0,0,0,0.2)" : "0 4px 12px rgba(15, 23, 42, 0.04)",
              }}
            >
              <div style={{ padding: "10px", borderRadius: "12px", background: "rgba(99, 102, 241, 0.15)", color: "#6366f1" }}>
                <Shield size={22} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: "14px", color: darkMode ? "#f8fafc" : "#0f172a" }}>Role Based Access</div>
                <div style={{ fontSize: "11px", color: darkMode ? "#94a3b8" : "#475569", marginTop: "2px", fontWeight: 500 }}>Super User, Admin, Test</div>
              </div>
            </div>

            <div
              className="feature"
              data-testid="login-feature-crud"
              style={{
                background: darkMode ? "rgba(30, 41, 59, 0.8)" : "#ffffff",
                border: darkMode ? "1px solid rgba(51, 65, 85, 0.9)" : "1px solid #e2e8f0",
                padding: "16px",
                borderRadius: "16px",
                display: "flex",
                alignItems: "center",
                gap: "12px",
                boxShadow: darkMode ? "0 4px 12px rgba(0,0,0,0.2)" : "0 4px 12px rgba(15, 23, 42, 0.04)",
              }}
            >
              <div style={{ padding: "10px", borderRadius: "12px", background: "rgba(16, 185, 129, 0.15)", color: "#059669" }}>
                <Database size={22} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: "14px", color: darkMode ? "#f8fafc" : "#0f172a" }}>CRUD Operations</div>
                <div style={{ fontSize: "11px", color: darkMode ? "#94a3b8" : "#475569", marginTop: "2px", fontWeight: 500 }}>Create, read, update, delete</div>
              </div>
            </div>

            <div
              className="feature"
              data-testid="login-feature-validations"
              style={{
                background: darkMode ? "rgba(30, 41, 59, 0.8)" : "#ffffff",
                border: darkMode ? "1px solid rgba(51, 65, 85, 0.9)" : "1px solid #e2e8f0",
                padding: "16px",
                borderRadius: "16px",
                display: "flex",
                alignItems: "center",
                gap: "12px",
                boxShadow: darkMode ? "0 4px 12px rgba(0,0,0,0.2)" : "0 4px 12px rgba(15, 23, 42, 0.04)",
              }}
            >
              <div style={{ padding: "10px", borderRadius: "12px", background: "rgba(245, 158, 11, 0.15)", color: "#d97706" }}>
                <CheckSquare size={22} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: "14px", color: darkMode ? "#f8fafc" : "#0f172a" }}>Forms & Validations</div>
                <div style={{ fontSize: "11px", color: darkMode ? "#94a3b8" : "#475569", marginTop: "2px", fontWeight: 500 }}>Typeahead & dropdowns</div>
              </div>
            </div>

            <div
              className="feature"
              data-testid="login-feature-tables"
              style={{
                background: darkMode ? "rgba(30, 41, 59, 0.8)" : "#ffffff",
                border: darkMode ? "1px solid rgba(51, 65, 85, 0.9)" : "1px solid #e2e8f0",
                padding: "16px",
                borderRadius: "16px",
                display: "flex",
                alignItems: "center",
                gap: "12px",
                boxShadow: darkMode ? "0 4px 12px rgba(0,0,0,0.2)" : "0 4px 12px rgba(15, 23, 42, 0.04)",
              }}
            >
              <div style={{ padding: "10px", borderRadius: "12px", background: "rgba(236, 72, 153, 0.15)", color: "#db2777" }}>
                <TableIcon size={22} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: "14px", color: darkMode ? "#f8fafc" : "#0f172a" }}>Tables & Filters</div>
                <div style={{ fontSize: "11px", color: darkMode ? "#94a3b8" : "#475569", marginTop: "2px", fontWeight: 500 }}>Sorting & instant search</div>
              </div>
            </div>
          </div>
        </section>

        <form
          className="login-card"
          data-testid="login-form"
          aria-label="Login form"
          onSubmit={submit}
          style={{
            background: darkMode ? "#1e293b" : "#ffffff",
            color: darkMode ? "#f8fafc" : "#0f172a",
            border: darkMode ? "1px solid #334155" : "1px solid #e2e8f0",
            borderRadius: "20px",
            padding: "26px 30px",
            width: "100%",
            boxShadow: darkMode ? "0 20px 40px rgba(0, 0, 0, 0.35)" : "0 20px 40px rgba(15, 23, 42, 0.08)",
          }}
        >
          <h2 data-testid="login-form-title" style={{ textAlign: "center", margin: "0 0 2px", fontSize: "22px", fontWeight: 700, color: darkMode ? "#f8fafc" : "#0f172a" }}>
            Welcome!
          </h2>
          <p data-testid="login-form-subtitle" style={{ textAlign: "center", color: darkMode ? "#94a3b8" : "#475569", margin: "0 0 16px", fontSize: "13px", fontWeight: 500 }}>
            Please login to your account
          </p>

          <label htmlFor="login-email-input" style={{ display: "block", marginTop: "10px", fontWeight: 600, fontSize: "12px", color: darkMode ? "#cbd5e1" : "#334155" }}>
            Email
          </label>
          <input
            id="login-email-input"
            data-testid="login-username-input"
            aria-label="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter email"
            autoComplete="username"
            style={{
              width: "100%",
              border: darkMode ? "1px solid #475569" : "1px solid #cbd5e1",
              borderRadius: "12px",
              padding: "11px 16px",
              marginTop: "4px",
              background: darkMode ? "rgba(15, 23, 42, 0.8)" : "#f8fafc",
              color: darkMode ? "#f8fafc" : "#0f172a",
              fontSize: "13px",
              outline: "none",
              transition: "all 0.2s ease",
            }}
            onFocus={(e) => {
              e.target.style.borderColor = "#6366f1";
              e.target.style.boxShadow = "0 0 0 3px rgba(99, 102, 241, 0.25)";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = darkMode ? "#475569" : "#cbd5e1";
              e.target.style.boxShadow = "none";
            }}
          />

          <label htmlFor="login-password-input" style={{ display: "block", marginTop: "12px", fontWeight: 600, fontSize: "12px", color: darkMode ? "#cbd5e1" : "#334155" }}>
            Password
          </label>
          <div
            className="password-row"
            data-testid="login-password-row"
            style={{
              position: "relative",
              display: "flex",
              alignItems: "center",
              marginTop: "4px",
              borderRadius: "12px",
              border: darkMode ? "1px solid #475569" : "1px solid #cbd5e1",
              background: darkMode ? "rgba(15, 23, 42, 0.8)" : "#f8fafc",
              transition: "all 0.2s ease",
            }}
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
              style={{
                width: "100%",
                border: "none",
                borderRadius: "12px",
                padding: "11px 44px 11px 16px",
                background: "transparent",
                color: darkMode ? "#f8fafc" : "#0f172a",
                fontSize: "13px",
                outline: "none",
                margin: 0,
              }}
            />
            <button
              type="button"
              data-testid="login-show-password-button"
              aria-label={showPassword ? "Hide password" : "Show password"}
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: "absolute",
                right: "12px",
                background: "transparent",
                color: darkMode ? "#94a3b8" : "#64748b",
                border: "none",
                padding: "4px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginTop: 0,
              }}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          <div className="between" data-testid="login-options-row" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "14px 0" }}>
            <label htmlFor="login-remember-checkbox" style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer", margin: 0, fontSize: "12px", color: darkMode ? "#cbd5e1" : "#475569" }}>
              <input
                id="login-remember-checkbox"
                data-testid="login-remember-me-checkbox"
                aria-label="Remember me"
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                style={{ width: "15px", height: "15px", borderRadius: "4px", margin: 0 }}
              />
              <span>Remember me</span>
            </label>
            <button
              type="button"
              className="link"
              data-testid="login-forgot-password-link"
              aria-label="Forgot password"
              onClick={() => setForgotPasswordModal(true)}
              style={{ background: "transparent", color: "#6366f1", padding: 0, fontSize: "12px", fontWeight: 600 }}
            >
              Forgot password?
            </button>
          </div>

          {error && (
            <div className="error" data-testid="login-error-alert" role="alert" aria-live="assertive" style={{ margin: "8px 0", padding: "8px 10px", fontSize: "12px" }}>
              {error}
            </div>
          )}

          <button
            className="primary full"
            data-testid="login-submit-button"
            aria-label="Login"
            disabled={loading}
            style={{
              width: "100%",
              background: "#6366f1",
              color: "white",
              padding: "11px 16px",
              borderRadius: "12px",
              fontWeight: 600,
              marginTop: "2px",
              cursor: "pointer",
              fontSize: "13px",
              boxShadow: "0 4px 12px rgba(99, 102, 241, 0.3)",
              transition: "all 0.2s ease",
            }}
          >
            {loading ? "Logging in..." : "Login"}
          </button>

          {loading && <div data-testid="login-page-loader" aria-live="polite" style={{ textAlign: "center", marginTop: "6px", fontSize: "12px", color: "#6366f1" }}>Logging in...</div>}

          <aside
            className="credentials"
            data-testid="login-demo-credentials-box"
            aria-label="Demo credentials"
            style={{
              marginTop: "14px",
              textAlign: "center",
              background: darkMode ? "#0f172a" : "#f1f5f9",
              border: darkMode ? "1px solid #334155" : "1px solid #e2e8f0",
              borderRadius: "12px",
              padding: "12px",
              lineHeight: "1.5",
            }}
          >
            <h3 data-testid="demo-credentials-title" style={{ margin: "0 0 6px", fontSize: "12px", fontWeight: 700, color: darkMode ? "#f8fafc" : "#0f172a" }}>
              Demo Credentials <span style={{ fontSize: "10px", color: "#6366f1", fontWeight: 600 }}>(Click to auto-fill)</span>
            </h3>

            <div
              className="credential-row clickable-credential"
              data-testid="super-user-credentials"
              onClick={() => {
                setEmail("admin@example.com");
                setPassword("admin123");
                showToast("Super User credentials loaded", "info");
              }}
              style={{ cursor: "pointer", fontSize: "11px", padding: "2px 0", display: "flex", justifyContent: "space-between", color: darkMode ? "#cbd5e1" : "#334155" }}
              title="Click to fill Super User credentials"
            >
              <strong style={{ color: darkMode ? "#f8fafc" : "#0f172a" }}>Super User</strong>
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
              style={{ cursor: "pointer", fontSize: "11px", padding: "2px 0", display: "flex", justifyContent: "space-between", color: darkMode ? "#cbd5e1" : "#334155" }}
              title="Click to fill Admin User credentials"
            >
              <strong style={{ color: darkMode ? "#f8fafc" : "#0f172a" }}>Admin User</strong>
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
              style={{ cursor: "pointer", fontSize: "11px", padding: "2px 0", display: "flex", justifyContent: "space-between", color: darkMode ? "#cbd5e1" : "#334155" }}
              title="Click to fill Test User credentials"
            >
              <strong style={{ color: darkMode ? "#f8fafc" : "#0f172a" }}>Test User</strong>
              <span>test@example.com / test123</span>
            </div>

            <div
              className="credential-note"
              data-testid="login-page-note"
              style={{ fontSize: "10px", color: darkMode ? "#94a3b8" : "#475569", marginTop: "6px", borderTop: darkMode ? "1px solid #334155" : "1px solid #e2e8f0", paddingTop: "4px", fontWeight: 500 }}
            >
              Role-based access enabled for automation practice.
            </div>
          </aside>

          {forgotPasswordModal && (
            <div className="modal-backdrop" data-testid="forgot-password-modal">
              <div className="modal" style={{ background: darkMode ? "#1e293b" : "#ffffff", color: darkMode ? "#f8fafc" : "#0f172a" }}>
                <h2>Reset Password</h2>
                <p>Enter your account email to receive a password reset link.</p>

                <label style={{ color: darkMode ? "#cbd5e1" : "#334155" }}>Email Address</label>
                <input
                  data-testid="forgot-password-email-input"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="Enter your email"
                  style={{
                    background: darkMode ? "rgba(15, 23, 42, 0.8)" : "#f8fafc",
                    color: darkMode ? "#f8fafc" : "#0f172a",
                    border: darkMode ? "1px solid #475569" : "1px solid #cbd5e1",
                    borderRadius: "12px",
                    padding: "11px 16px",
                    outline: "none",
                  }}
                />

                {forgotSent && (
                  <div className="practice-message" style={{ color: "#16703a", background: "#dcfce7", padding: "10px", borderRadius: "8px", marginTop: "10px" }} data-testid="forgot-password-success-message">
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
                    style={{ background: darkMode ? "#334155" : "#e2e8f0", color: darkMode ? "#f8fafc" : "#1e293b", borderRadius: "10px" }}
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
                    style={{ background: "#6366f1", color: "#ffffff", borderRadius: "10px" }}
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
        style={{
          position: "absolute",
          bottom: "12px",
          left: 0,
          right: 0,
          textAlign: "center",
          fontSize: "12px",
          color: darkMode ? "#94a3b8" : "#64748b",
          zIndex: 10,
        }}
      >
        <span>© 2026 Automation Studio. Built by </span>
        <a
          href="https://github.com/abhishekchinta1997"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            color: "#6366f1",
            textDecoration: "none",
            fontWeight: 600,
            transition: "color 0.2s ease",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#818cf8")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#6366f1")}
        >
          Abhishek Chinta
        </a>
      </footer>
    </main>
  );
}
