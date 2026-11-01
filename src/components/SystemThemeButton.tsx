import { CSSProperties } from "react";
import { Monitor } from "lucide-react";
import { useApp } from "../context/AppContext";

/**
 * "System Default" control: clears the manual light/dark override so the app
 * follows the operating system theme again. Disabled while already following the system.
 */
export default function SystemThemeButton({ style }: { style?: CSSProperties }) {
  const { darkMode, themePreference, resetThemeToSystem, showToast } = useApp();
  const following = themePreference === "system";

  return (
    <button
      type="button"
      className="theme-toggle-button theme-system-button"
      data-testid="theme-system-btn"
      aria-pressed={following}
      disabled={following}
      title={following ? "Following your system theme" : "Stop overriding and follow your system theme"}
      onClick={() => {
        resetThemeToSystem();
        showToast("Theme now follows your system setting", "info");
      }}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        padding: "8px 14px",
        borderRadius: "8px",
        fontWeight: 600,
        fontSize: "14px",
        cursor: following ? "default" : "pointer",
        opacity: following ? 0.6 : 1,
        background: darkMode ? "rgba(255, 255, 255, 0.1)" : "#f1f5f9",
        color: darkMode ? "#ffffff" : "#1e293b",
        border: darkMode ? "1px solid rgba(255, 255, 255, 0.2)" : "1px solid #cbd5e1",
        ...style,
      }}
    >
      <Monitor size={16} color={darkMode ? "#ffffff" : "#1e293b"} />
      <span>{following ? "System" : "Use System"}</span>
    </button>
  );
}
