import { CSSProperties, KeyboardEvent, ReactNode, useEffect, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";

export interface CustomSelectOption<T extends string | number = string> {
  value: T;
  label: string;
  icon?: ReactNode;
}

interface CustomSelectProps<T extends string | number = string> {
  value: T;
  options: CustomSelectOption<T>[];
  onChange: (value: T) => void;
  id?: string;
  testId?: string;
  ariaLabel?: string;
  style?: CSSProperties;
  triggerStyle?: CSSProperties;
  className?: string;
  fullWidth?: boolean;
}

export default function CustomSelect<T extends string | number = string>({
  value,
  options,
  onChange,
  id,
  testId,
  ariaLabel,
  style,
  triggerStyle,
  className,
  fullWidth = false,
}: CustomSelectProps<T>) {
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const selectedIndex = options.findIndex((o) => o.value === value);
  const selectedOption = options[selectedIndex] ?? options[0];

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open]);

  function openMenu(startAt = selectedIndex) {
    setHighlight(Math.max(0, startAt));
    setOpen(true);
  }

  function choose(nextValue: T) {
    onChange(nextValue);
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
        setHighlight((h) => (h + 1) % options.length);
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlight((h) => (h - 1 + options.length) % options.length);
        break;
      case "Home":
        e.preventDefault();
        setHighlight(0);
        break;
      case "End":
        e.preventDefault();
        setHighlight(options.length - 1);
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        if (options[highlight]) {
          choose(options[highlight].value);
        }
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
    <div
      className={`theme-dropdown${fullWidth ? " full-width" : ""}${className ? ` ${className}` : ""}`}
      ref={rootRef}
      style={style}
      onKeyDown={onKeyDown}
    >
      <button
        ref={triggerRef}
        id={id}
        type="button"
        className={`theme-dropdown-trigger${open ? " open" : ""}`}
        data-testid={testId}
        data-value={String(value)}
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        style={triggerStyle}
        onClick={() => (open ? setOpen(false) : openMenu())}
      >
        {selectedOption?.icon}
        <span data-testid={testId ? `${testId}-label` : undefined}>
          {selectedOption?.label ?? String(value)}
        </span>
        <ChevronDown size={16} className="theme-dropdown-chevron" />
      </button>

      {open && (
        <ul
          className="theme-dropdown-menu"
          role="listbox"
          aria-label={ariaLabel}
          data-testid={testId ? `${testId}-menu` : undefined}
        >
          {options.map((opt, i) => {
            const isSelected = opt.value === value;
            const isHighlighted = i === highlight;
            const slug = String(opt.value).toLowerCase().replace(/\s+/g, "-");
            return (
              <li
                key={String(opt.value)}
                role="option"
                aria-selected={isSelected}
                data-testid={testId ? `${testId}-option-${slug}` : undefined}
                className={`theme-dropdown-option${isSelected ? " selected" : ""}${isHighlighted ? " highlighted" : ""}`}
                onMouseEnter={() => setHighlight(i)}
                onClick={() => choose(opt.value)}
              >
                {opt.icon}
                <span>{opt.label}</span>
                {isSelected && <Check size={16} className="theme-dropdown-check" />}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
