import { CSSProperties } from "react";
import { Monitor, Moon, Sun } from "lucide-react";
import { ThemePreference, useApp } from "../context/AppContext";

const OPTIONS: { value: ThemePreference; label: string }[] = [
  { value: "system", label: "System" },
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
];

/**
 * Theme dropdown: System (follow the OS), Light or Dark.
 * Light/Dark are saved as a manual override; System clears it.
 */
export default function ThemeSelect({ style }: { style?: CSSProperties }) {
  const { darkMode, themePreference, setTheme } = useApp();
  const iconColor = darkMode ? "#ffffff" : "#1e293b";
  const Icon = themePreference === "system" ? Monitor : themePreference === "dark" ? Moon : Sun;

  return (
    <label
      className="theme-select"
      style={{ position: "relative", display: "inline-flex", alignItems: "center", ...style }}
    >
      <span className="sr-only" style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>
        Theme
      </span>
      <span style={{ position: "absolute", left: 12, display: "flex", pointerEvents: "none" }}>
        <Icon size={16} color={iconColor} />
      </span>
      <select
        data-testid="theme-select"
        aria-label="Theme"
        value={themePreference}
        onChange={(e) => setTheme(e.target.value as ThemePreference)}
        style={{ cursor: "pointer" }}
      >
        {OPTIONS.map((o) => (
          <option key={o.value} value={o.value} data-testid={`theme-option-${o.value}`}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
