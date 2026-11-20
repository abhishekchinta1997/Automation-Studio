import { useState } from "react";

interface LocatorTier {
  id: string;
  tier: string;
  strategy: string;
  syntax: string;
  resilience: string;
  note: string;
  accent?: boolean;
}

const LOCATOR_TIERS: LocatorTier[] = [
  {
    id: "testid",
    tier: "P1",
    strategy: "Explicit Test ID",
    syntax: '[data-testid="login-submit-button"]',
    resilience: "Highest",
    note: "Immune to copy, layout, and CSS refactors. Primary contract across Automation Studio.",
    accent: true,
  },
  {
    id: "role",
    tier: "P2",
    strategy: "ARIA Role & Accessible Name",
    syntax: 'getByRole("button", { name: "Sign In" })',
    resilience: "High",
    note: "Verifies accessibility tree and keyboard semantics alongside interaction.",
  },
  {
    id: "label",
    tier: "P3",
    strategy: "Form Label / Placeholder",
    syntax: 'getByLabel("Email address")',
    resilience: "Medium-High",
    note: "Strong for inputs and checkboxes bound via htmlFor or aria-label.",
  },
  {
    id: "css",
    tier: "P4",
    strategy: "Semantic CSS / Text",
    syntax: 'table[data-testid="dynamic-web-table"] tbody tr',
    resilience: "Medium",
    note: "Useful for scoped table traversal when anchored to a stable parent container.",
  },
  {
    id: "xpath",
    tier: "P5",
    strategy: "Positional CSS / Deep XPath",
    syntax: "//div[2]/form/div[3]/button[1]",
    resilience: "Fragile",
    note: "Avoid in assertions; breaks on minor wrapper or DOM order edits.",
  },
];

export function LocatorPriorityDiagram() {
  const [selectedTier, setSelectedTier] = useState<string>("testid");
  const active = LOCATOR_TIERS.find((t) => t.id === selectedTier) ?? LOCATOR_TIERS[0];

  return (
    <figure className="qa-diagram-card" data-testid="qa-locator-priority-diagram">
      <div className="qa-diagram-header">
        <div>
          <div className="qa-diagram-eyebrow">LOCATOR RESOLUTION HIERARCHY</div>
          <h3 className="qa-diagram-title">Selector Priority Pyramid</h3>
        </div>
        <span className="qa-diagram-hint">Click a tier to inspect</span>
      </div>

      <svg
        className="qa-diagram-svg"
        viewBox="0 0 720 228"
        role="img"
        aria-labelledby="locator-pyramid-title locator-pyramid-desc"
      >
        <title id="locator-pyramid-title">QA Automation Locator Priority Pyramid</title>
        <desc id="locator-pyramid-desc">
          Five-tier hierarchy ranking test selectors from most resilient Explicit Test IDs down to fragile positional XPath.
        </desc>

        {/* Left Resilience Axis */}
        <line x1="26" y1="22" x2="26" y2="206" stroke="var(--border-strong)" strokeWidth="1.5" />
        <polygon points="26,14 21,24 31,24" fill="var(--accent)" />
        <text x="16" y="114" fill="var(--text-muted)" fontSize="10" fontFamily="var(--font-mono)" textAnchor="middle" transform="rotate(-90 16 114)">
          RESILIENCE
        </text>

        {LOCATOR_TIERS.map((item, idx) => {
          const y = 16 + idx * 40;
          const inset = (4 - idx) * 24;
          const x = 48 + inset;
          const width = 656 - inset * 2;
          const isSelected = item.id === selectedTier;
          const isFragile = item.id === "xpath";

          return (
            <g
              key={item.id}
              onClick={() => setSelectedTier(item.id)}
              style={{ cursor: "pointer" }}
              role="button"
              tabIndex={0}
              aria-label={`${item.tier} ${item.strategy}`}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setSelectedTier(item.id);
                }
              }}
            >
              <rect
                x={x}
                y={y}
                width={width}
                height={32}
                rx={6}
                fill={
                  isSelected
                    ? isFragile
                      ? "rgba(239, 68, 68, 0.14)"
                      : "var(--accent-soft)"
                    : "var(--bg-raised)"
                }
                stroke={
                  isSelected
                    ? isFragile
                      ? "#ef4444"
                      : "var(--accent)"
                    : "var(--border-hairline)"
                }
                strokeWidth={isSelected ? 1.5 : 1}
              />

              {/* Tier badge */}
              <rect
                x={x + 8}
                y={y + 6}
                width={28}
                height={20}
                rx={4}
                fill={item.accent ? "var(--accent)" : isFragile ? "rgba(239, 68, 68, 0.2)" : "var(--bg-card)"}
                stroke={item.accent ? "none" : "var(--border-hairline)"}
              />
              <text
                x={x + 22}
                y={y + 20}
                textAnchor="middle"
                fontSize="10.5"
                fontWeight="600"
                fontFamily="var(--font-mono)"
                fill={item.accent ? "#ffffff" : isFragile ? "#ef4444" : "var(--text-primary)"}
              >
                {item.tier}
              </text>

              {/* Strategy Label */}
              <text
                x={x + 46}
                y={y + 20}
                fontSize="12"
                fontWeight={isSelected ? "600" : "500"}
                fontFamily="var(--font-sans)"
                fill="var(--text-primary)"
              >
                {item.strategy}
              </text>

              {/* Right Resilience Tag */}
              <text
                x={x + width - 12}
                y={y + 20}
                textAnchor="end"
                fontSize="10.5"
                fontFamily="var(--font-mono)"
                fill={item.accent ? "var(--accent)" : isFragile ? "#ef4444" : "var(--text-muted)"}
              >
                {item.resilience}
              </text>
            </g>
          );
        })}
      </svg>

      <figcaption className="qa-diagram-inspector">
        <div className="qa-diagram-inspector-row">
          <span className="qa-diagram-badge">{active.tier}</span>
          <code className="qa-diagram-code">{active.syntax}</code>
        </div>
        <p className="qa-diagram-note">{active.note}</p>
      </figcaption>
    </figure>
  );
}

export function AsyncWaitFlowDiagram() {
  return (
    <figure className="qa-diagram-card qa-diagram-compact" data-testid="lab-async-flow-diagram">
      <div className="qa-diagram-header">
        <div>
          <div className="qa-diagram-eyebrow">ASYNC STATE &amp; WAIT PIPELINE</div>
          <h4 className="qa-diagram-title">Explicit Wait &amp; DOM Settlement Flow</h4>
        </div>
        <code className="qa-diagram-pill">Avoid sleep() · Assert state</code>
      </div>

      <svg
        className="qa-diagram-svg"
        viewBox="0 0 740 132"
        role="img"
        aria-labelledby="async-flow-title async-flow-desc"
      >
        <title id="async-flow-title">Async State and Explicit Wait Pipeline</title>
        <desc id="async-flow-desc">
          Four-stage flow showing Trigger Action, Pending State indicator, Async Timer or AJAX Settlement, and Deterministic Assertion target.
        </desc>

        <defs>
          <marker id="qa-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 1 L 10 5 L 0 9 z" fill="var(--border-strong)" />
          </marker>
          <marker id="qa-arrow-accent" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 1 L 10 5 L 0 9 z" fill="var(--accent)" />
          </marker>
        </defs>

        {/* Stage 1: Trigger */}
        <g>
          <rect x="8" y="16" width="156" height="84" rx="8" fill="var(--bg-raised)" stroke="var(--border-hairline)" />
          <text x="20" y="36" fontSize="10" fontFamily="var(--font-mono)" fill="var(--text-muted)">01 · TRIGGER</text>
          <text x="20" y="56" fontSize="12.5" fontWeight="600" fontFamily="var(--font-sans)" fill="var(--text-primary)">User / Test Click</text>
          <text x="20" y="75" fontSize="10.5" fontFamily="var(--font-mono)" fill="var(--text-secondary)">lab-ajax-slow-btn</text>
          <text x="20" y="90" fontSize="10" fontFamily="var(--font-sans)" fill="var(--text-muted)">Cancels prior timer</text>
        </g>

        <line x1="164" y1="58" x2="194" y2="58" stroke="var(--border-strong)" strokeWidth="1.5" markerEnd="url(#qa-arrow)" />

        {/* Stage 2: Pending */}
        <g>
          <rect x="198" y="16" width="162" height="84" rx="8" fill="var(--bg-raised)" stroke="var(--accent-border)" />
          <circle cx="212" cy="32" r="3.5" fill="var(--accent)" />
          <text x="222" y="36" fontSize="10" fontFamily="var(--font-mono)" fill="var(--accent)">02 · PENDING</text>
          <text x="210" y="56" fontSize="12.5" fontWeight="600" fontFamily="var(--font-sans)" fill="var(--text-primary)">Loader Mounted</text>
          <text x="210" y="75" fontSize="10.5" fontFamily="var(--font-mono)" fill="var(--text-secondary)">lab-loading-indicator</text>
          <text x="210" y="90" fontSize="10" fontFamily="var(--font-sans)" fill="var(--text-muted)">waitFor visible / hidden</text>
        </g>

        <line x1="360" y1="58" x2="390" y2="58" stroke="var(--accent)" strokeWidth="1.5" strokeDasharray="4 3" markerEnd="url(#qa-arrow-accent)" />

        {/* Stage 3: Latency */}
        <g>
          <rect x="394" y="16" width="154" height="84" rx="8" fill="var(--bg-raised)" stroke="var(--border-hairline)" />
          <text x="406" y="36" fontSize="10" fontFamily="var(--font-mono)" fill="var(--text-muted)">03 · LATENCY</text>
          <text x="406" y="56" fontSize="12.5" fontWeight="600" fontFamily="var(--font-sans)" fill="var(--text-primary)">Simulated Delay</text>
          <text x="406" y="75" fontSize="10.5" fontFamily="var(--font-mono)" fill="var(--text-secondary)">1.0s · 1.5s · 3.5s</text>
          <text x="406" y="90" fontSize="10" fontFamily="var(--font-sans)" fill="var(--text-muted)">or 1–30s countdown</text>
        </g>

        <line x1="548" y1="58" x2="578" y2="58" stroke="var(--border-strong)" strokeWidth="1.5" markerEnd="url(#qa-arrow)" />

        {/* Stage 4: Settled */}
        <g>
          <rect x="582" y="16" width="150" height="84" rx="8" fill="var(--accent-soft)" stroke="var(--accent)" strokeWidth="1.5" />
          <circle cx="596" cy="32" r="3.5" fill="var(--run-green)" />
          <text x="606" y="36" fontSize="10" fontFamily="var(--font-mono)" fill="var(--accent)">04 · SETTLED</text>
          <text x="594" y="56" fontSize="12.5" fontWeight="600" fontFamily="var(--font-sans)" fill="var(--text-primary)">DOM Assertion</text>
          <text x="594" y="75" fontSize="10.5" fontFamily="var(--font-mono)" fill="var(--text-primary)">lab-ajax-result-text</text>
          <text x="594" y="90" fontSize="10" fontFamily="var(--font-sans)" fill="var(--text-secondary)">Logged in Inspector</text>
        </g>

        {/* Bottom Practice Guidance Rail */}
        <text x="8" y="121" fontSize="10.5" fontFamily="var(--font-mono)" fill="var(--text-muted)">
          Playwright: await expect(page.getByTestId(&quot;lab-ajax-result-text&quot;)).toContainText(&quot;42&quot;)
        </text>
      </svg>
    </figure>
  );
}
