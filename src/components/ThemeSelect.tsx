import { CSSProperties, KeyboardEvent, useEffect, useRef, useState } from "react";
import { Check, ChevronDown, Monitor, Moon, Sun } from "lucide-react";
import { ThemePreference, useApp } from "../context/AppContext";

const OPTIONS: { value: ThemePreference; label: string; Icon: typeof Sun }[] = [
  { value: "system", label: "System", Icon: Monitor },
  { value: "light", label: "Light", Icon: Sun },
  { value: "dark", label: "Dark", Icon: Moon },
];

/**
 * Custom theme dropdown: System (follow the OS), Light or Dark.
 * Light/Dark are saved as a manual override; System clears it.
 * Keyboard: Enter/Space/ArrowDown open, ArrowUp/Down/Home/End move, Enter selects, Esc/Tab close.
 */
export default function ThemeSelect({ style }: { style?: CSSProperties }) {
  const { themePreference, setTheme } = useApp();
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const selectedIndex = OPTIONS.findIndex((o) => o.value === themePreference);
  const Current = OPTIONS[selectedIndex]?.Icon ?? Monitor;

  // Close when clicking anywhere outside the dropdown
  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open]);

  function openMenu(startAt = selectedIndex) {
    setHighlight(Math.max(0, startAt));
    setOpen(true);
  }

  function choose(value: ThemePreference) {
    setTheme(value);
    setOpen(false);
    triggerRef.current?.focus();
  }

  function onKeyDown(e: KeyboardEvent) {
    if (!open) {
      if (e.key === "ArrowDown" || e.key === "ArrowUp" || e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openMenu();
      }
      return;
    }
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlight((h) => (h + 1) % OPTIONS.length);
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlight((h) => (h - 1 + OPTIONS.length) % OPTIONS.length);
        break;
      case "Home":
        e.preventDefault();
        setHighlight(0);
        break;
      case "End":
        e.preventDefault();
        setHighlight(OPTIONS.length - 1);
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        choose(OPTIONS[highlight].value);
        break;
      case "Escape":
        e.preventDefault();
        setOpen(false);
        triggerRef.current?.focus();
        break;
      case "Tab":
        setOpen(false);
        break;
    }
  }

  return (
    <div className="theme-dropdown" ref={rootRef} style={style} onKeyDown={onKeyDown}>
      <button
        ref={triggerRef}
        type="button"
        className={`theme-dropdown-trigger${open ? " open" : ""}`}
        data-testid="theme-select"
        data-value={themePreference}
        aria-label="Theme"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls="theme-dropdown-menu"
        onClick={() => (open ? setOpen(false) : openMenu())}
      >
        <Current size={16} />
        <span data-testid="theme-select-label">{OPTIONS[selectedIndex]?.label ?? "System"}</span>
        <ChevronDown size={16} className="theme-dropdown-chevron" />
      </button>

      {open && (
        <ul
          id="theme-dropdown-menu"
          className="theme-dropdown-menu"
          role="listbox"
          aria-label="Theme"
          data-testid="theme-menu"
        >
          {OPTIONS.map(({ value, label, Icon }, i) => (
            <li
              key={value}
              role="option"
              aria-selected={value === themePreference}
              data-testid={`theme-option-${value}`}
              className={`theme-dropdown-option${i === highlight ? " highlighted" : ""}${value === themePreference ? " selected" : ""}`}
              onMouseEnter={() => setHighlight(i)}
              onClick={() => choose(value)}
            >
              <Icon size={16} />
              <span>{label}</span>
              {value === themePreference && <Check size={15} className="theme-dropdown-check" />}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
