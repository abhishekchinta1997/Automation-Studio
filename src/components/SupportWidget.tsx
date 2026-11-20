import { useState, useEffect, useMemo } from "react";
import { Coffee, X, Copy, Check, Heart, QrCode, ExternalLink, Globe, IndianRupee, Utensils, Server, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { useApp } from "../context/AppContext";

// Assemble default VPA (abhishekchinta@ibl, matching the PhonePe QR payload) and Ko-fi URL
// at runtime from char codes if VITE_SUPPORT_* env vars are not provided, preventing static bundle scrapers.
const FALLBACK_VPA_CODES = [97, 98, 104, 105, 115, 104, 101, 107, 99, 104, 105, 110, 116, 97, 64, 105, 98, 108];
const FALLBACK_KOFI_CODES = [
  104, 116, 116, 112, 115, 58, 47, 47, 107, 111, 45, 102, 105, 46, 99, 111, 109, 47,
  99, 104, 105, 110, 116, 97, 95, 97, 98, 104, 105, 115, 104, 101, 107,
];

function resolveSupportUpiId(): string {
  const envVal = import.meta.env.VITE_SUPPORT_UPI_ID?.trim();
  if (envVal) {
    const sanitized = envVal.replace(/[^a-zA-Z0-9.\-_@]/g, "");
    if (sanitized.includes("@")) return sanitized;
  }
  return String.fromCharCode(...FALLBACK_VPA_CODES);
}

function resolveSupportKofiUrl(): string {
  const envVal = import.meta.env.VITE_SUPPORT_KOFI_URL?.trim();
  if (envVal && /^https:\/\/(www\.)?ko-fi\.com\/[a-zA-Z0-9_\-]+$/i.test(envVal)) return envVal;
  return String.fromCharCode(...FALLBACK_KOFI_CODES);
}

function maskUpiId(vpa: string): string {
  const atIndex = vpa.indexOf("@");
  if (atIndex <= 4) return "••••@upi";
  const prefix = vpa.slice(0, 4);
  const handle = vpa.slice(atIndex);
  return `${prefix}••••••••${handle}`;
}

export default function SupportWidget() {
  const { showToast } = useApp();
  const [modalOpen, setModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"india" | "global">("india");
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [upiRevealed, setUpiRevealed] = useState(false);
  const [selectedTier, setSelectedTier] = useState<string>("$5");

  const upiId = useMemo(() => resolveSupportUpiId(), []);
  const kofiUrl = useMemo(() => resolveSupportKofiUrl(), []);
  const maskedUpiId = useMemo(() => maskUpiId(upiId), [upiId]);

  useEffect(() => {
    if (!modalOpen) {
      setUpiRevealed(false);
      return;
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        setModalOpen(false);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [modalOpen]);

  function handleCopyUpi() {
    setUpiRevealed(true);
    if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
      navigator.clipboard.writeText(upiId).catch(() => {});
    }
    setCopiedUpi(true);
    showToast(`Copied UPI ID: ${upiId}`, "success");
    window.setTimeout(() => setCopiedUpi(false), 2000);
  }

  const supportTiers = [
    {
      amount: "$3",
      label: "Coffee",
      description: "Quick caffeine boost to fuel bug fixes & new test cases",
      icon: <Coffee size={18} strokeWidth={1.75} className="text-amber-500 dark:text-amber-400" />,
      highlight: false,
    },
    {
      amount: "$5",
      label: "Snack",
      description: "Support ongoing QA sandbox modules & feature updates",
      icon: <Utensils size={18} strokeWidth={1.75} />,
      highlight: true,
    },
    {
      amount: "$10",
      label: "Server Sponsor",
      description: "Help cover domain, hosting, and CI/CD automation costs",
      icon: <Server size={18} strokeWidth={1.75} />,
      highlight: false,
    },
  ];

  return (
    <>
      {/* Floating Action Button (FAB) */}
      <button
        type="button"
        className="support-fab"
        data-testid="support-fab-btn"
        aria-label="Support Automation Studio"
        title="Support Automation Studio (Buy me a coffee / UPI)"
        onClick={() => setModalOpen(true)}
      >
        <span className="support-fab-icon-wrapper">
          <Coffee size={18} className="support-fab-icon text-amber-500 dark:text-amber-400" />
        </span>
        <span className="support-fab-text">Support</span>
      </button>

      {/* Dual-Region Support Modal */}
      {modalOpen && (
        <div
          className="modal-backdrop support-modal-backdrop"
          data-testid="support-modal-backdrop"
          onClick={(e) => {
            if (e.target === e.currentTarget) setModalOpen(false);
          }}
        >
          <div
            className="modal support-modal"
            data-testid="support-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="support-modal-title"
          >
            {/* Modal Header */}
            <div className="support-modal-header">
              <div className="support-modal-title-row">
                <span className="support-modal-badge-icon">
                  <Coffee size={20} />
                </span>
                <div>
                  <h2 id="support-modal-title">Support Automation Studio</h2>
                  <p className="support-modal-subtitle">
                    Help keep this open-source QA sandbox free, ad-free, and continuously updated.
                  </p>
                </div>
              </div>

              <button
                type="button"
                className="support-modal-close-btn"
                data-testid="support-modal-close-btn"
                aria-label="Close support dialog"
                onClick={() => setModalOpen(false)}
              >
                <X size={16} />
              </button>
            </div>

            {/* Region Switcher Tabs */}
            <div className="support-modal-tabs" role="tablist" aria-label="Support region options">
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === "india"}
                className={`support-tab-btn ${activeTab === "india" ? "active" : ""}`}
                data-testid="support-tab-india"
                onClick={() => setActiveTab("india")}
              >
                <IndianRupee size={14} strokeWidth={1.75} />
                <span>India (UPI)</span>
                <span className="support-tab-badge">0% Fee</span>
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === "global"}
                className={`support-tab-btn ${activeTab === "global" ? "active" : ""}`}
                data-testid="support-tab-global"
                onClick={() => setActiveTab("global")}
              >
                <Globe size={14} strokeWidth={1.75} />
                <span>Global (USD / PayPal)</span>
              </button>
            </div>

            {/* Tab 1: India (UPI) Content */}
            {activeTab === "india" && (
              <div className="support-tab-panel" data-testid="support-panel-india">
                <div className="support-upi-card">
                  <div className="support-qr-box">
                    <img
                      src="/upi-qr.png"
                      alt="UPI QR Code to support Automation Studio"
                      className={`support-qr-image ${upiRevealed ? "" : "support-qr-blurred"}`}
                      data-testid="support-upi-qr-image"
                      onError={(e) => {
                        // Fallback UI if image fails
                        e.currentTarget.style.display = "none";
                        const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                        if (fallback) fallback.style.display = "flex";
                      }}
                    />
                    <div className="support-qr-fallback" style={{ display: "none" }}>
                      <QrCode size={56} color="#14b8a6" />
                      <span>Scan to pay via UPI</span>
                    </div>
                    {!upiRevealed && (
                      <button
                        type="button"
                        className="support-qr-privacy-overlay"
                        data-testid="support-reveal-upi-btn"
                        aria-label="Reveal UPI QR code and VPA"
                        onClick={() => setUpiRevealed(true)}
                      >
                        <ShieldCheck size={18} />
                        <span>Click to Reveal QR</span>
                      </button>
                    )}
                  </div>

                  <div className="support-upi-details">
                    <div className="support-upi-id-box">
                      <div className="between" style={{ alignItems: "center", gap: "8px", marginBottom: "2px" }}>
                        <span className="support-upi-label">UPI ID (Anti-Spam Protected)</span>
                        <button
                          type="button"
                          className="support-upi-visibility-btn"
                          data-testid="support-toggle-upi-visibility-btn"
                          aria-label={upiRevealed ? "Hide UPI ID" : "Reveal UPI ID"}
                          title={upiRevealed ? "Hide UPI ID" : "Reveal full UPI ID"}
                          onClick={() => setUpiRevealed((prev) => !prev)}
                        >
                          {upiRevealed ? <EyeOff size={13} /> : <Eye size={13} />}
                          <span>{upiRevealed ? "Hide" : "Reveal"}</span>
                        </button>
                      </div>
                      <code className="support-upi-code" data-testid="support-upi-id-text">
                        {upiRevealed ? upiId : maskedUpiId}
                      </code>
                    </div>

                    <button
                      type="button"
                      className="support-copy-btn"
                      data-testid="support-copy-upi-btn"
                      onClick={handleCopyUpi}
                    >
                      {copiedUpi ? (
                        <>
                          <Check size={16} />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy size={16} />
                          <span>{upiRevealed ? "Copy UPI ID" : "Reveal & Copy UPI ID"}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div className="support-upi-apps-row">
                  <span className="support-pill">PhonePe</span>
                  <span className="support-pill">GPay</span>
                  <span className="support-pill">Paytm</span>
                  <span className="support-pill">BHIM</span>
                  <span className="support-pill">Cred</span>
                </div>

                <p className="support-note">
                  Scan using PhonePe, GPay, Paytm, or any UPI app. Instant &amp; direct 0% commission support.
                </p>
              </div>
            )}

            {/* Tab 2: Global (USD) Content - Active Ko-fi Support */}
            {activeTab === "global" && (
              <div className="support-tab-panel" data-testid="support-panel-global">
                <div className="support-kofi-card" data-testid="support-kofi-card">
                  {/* Header & Description */}
                  <div className="support-kofi-header">
                    <span className="support-kofi-icon-badge">
                      <Coffee size={20} className="text-amber-400" />
                    </span>
                    <div className="support-kofi-header-text">
                      <h3 className="support-kofi-title" data-testid="support-kofi-title">
                        Support via PayPal / Global Cards
                      </h3>
                      <p className="support-kofi-desc" data-testid="support-kofi-desc">
                        Support the continuous development of Automation Studio from anywhere in the world. Accepts PayPal, International Credit/Debit Cards, Apple Pay, and Google Pay (securely processed via Ko-fi).
                      </p>
                    </div>
                  </div>

                  {/* Preset Visual Tier Cards */}
                  <div className="support-tiers-grid">
                    {supportTiers.map((tier) => {
                      const isSelected = selectedTier === tier.amount;
                      return (
                        <div
                          key={tier.amount}
                          role="button"
                          tabIndex={0}
                          aria-pressed={isSelected}
                          aria-label={`Select ${tier.amount} ${tier.label} tier`}
                          className={`support-tier-card ${isSelected ? "selected" : ""} ${tier.highlight ? "popular" : ""}`}
                          data-testid={`support-tier-${tier.amount.replace("$", "")}`}
                          onClick={() => setSelectedTier(tier.amount)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              setSelectedTier(tier.amount);
                            }
                          }}
                        >
                          {tier.highlight && <span className="support-popular-badge">Most Popular</span>}
                          <div className="support-tier-icon">{tier.icon}</div>
                          <div className="support-tier-amount">{tier.amount}</div>
                          <div className="support-tier-label">{tier.label}</div>
                          <p className="support-tier-desc">{tier.description}</p>
                          {isSelected && (
                            <span className="support-tier-check-pill" aria-hidden="true">
                              <Check size={11} strokeWidth={3} />
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Main Action Button */}
                  <div className="support-kofi-actions">
                    <a
                      href={kofiUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="support-kofi-main-btn bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold py-2.5 px-4 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2.5 w-full"
                      data-testid="support-kofi-main-btn"
                    >
                      <Coffee size={18} />
                      <span>Continue with PayPal / Card on Ko-fi</span>
                      <span className="support-selected-pill">{selectedTier}</span>
                      <ExternalLink size={16} />
                    </a>
                  </div>

                  {/* Secondary Note at Bottom */}
                  <p className="support-kofi-note" data-testid="support-kofi-note">
                    Zero platform fees on tips. 100% directly supports hosting and open-source QA tooling.
                  </p>
                </div>
              </div>
            )}

            {/* Footer Thank You Note */}
            <div className="support-modal-footer">
              <span className="support-footer-heart">
                <Heart size={14} className="support-heart-icon" />
              </span>
              <span>Every cup of coffee helps create more test cases and keeps servers online. Thank you!</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
