import { useState, useEffect } from "react";
import { Coffee, X, Copy, Check, ExternalLink, Heart, CreditCard, QrCode, Sparkles } from "lucide-react";
import { useApp } from "../context/AppContext";

const DEFAULT_UPI_ID = "abhishekchinta@ybl";
const PAYPAL_LINK = "https://paypal.me/YOUR_HANDLE";
const KOFI_LINK = "https://ko-fi.com/YOUR_HANDLE";

export default function SupportWidget() {
  const { showToast, darkMode } = useApp();
  const [modalOpen, setModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"india" | "global">("india");
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [selectedTier, setSelectedTier] = useState<string>("$5");

  useEffect(() => {
    if (!modalOpen) return;
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
    if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
      navigator.clipboard.writeText(DEFAULT_UPI_ID).catch(() => {});
    }
    setCopiedUpi(true);
    showToast(`Copied UPI ID: ${DEFAULT_UPI_ID}`, "success");
    window.setTimeout(() => setCopiedUpi(false), 2000);
  }

  const supportTiers = [
    {
      amount: "$3",
      label: "Coffee",
      description: "Quick caffeine boost to fuel bug fixes & new test cases",
      icon: "☕",
      highlight: false,
    },
    {
      amount: "$5",
      label: "Snack",
      description: "Support ongoing QA sandbox modules & feature updates",
      icon: "🥨",
      highlight: true,
    },
    {
      amount: "$10",
      label: "Server Sponsor",
      description: "Help cover domain, hosting, and CI/CD automation costs",
      icon: "🚀",
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
          <Coffee size={18} className="support-fab-icon" />
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
                <span>🇮🇳</span>
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
                <span>🌍</span>
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
                      className="support-qr-image"
                      data-testid="support-upi-qr-image"
                      onError={(e) => {
                        // Fallback UI if image fails
                        e.currentTarget.style.display = "none";
                        const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                        if (fallback) fallback.style.display = "flex";
                      }}
                    />
                    <div className="support-qr-fallback" style={{ display: "none" }}>
                      <QrCode size={56} color="#6366f1" />
                      <span>Scan to pay via UPI</span>
                    </div>
                  </div>

                  <div className="support-upi-details">
                    <div className="support-upi-id-box">
                      <span className="support-upi-label">UPI ID</span>
                      <code className="support-upi-code" data-testid="support-upi-id-text">
                        {DEFAULT_UPI_ID}
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
                          <span>Copy UPI ID</span>
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

            {/* Tab 2: Global (USD) Content */}
            {activeTab === "global" && (
              <div className="support-tab-panel" data-testid="support-panel-global">
                <div className="support-tiers-grid">
                  {supportTiers.map((tier) => {
                    const isSelected = selectedTier === tier.amount;
                    return (
                      <div
                        key={tier.amount}
                        className={`support-tier-card ${isSelected ? "selected" : ""} ${tier.highlight ? "popular" : ""}`}
                        data-testid={`support-tier-${tier.amount.replace("$", "")}`}
                        onClick={() => setSelectedTier(tier.amount)}
                      >
                        {tier.highlight && <span className="support-popular-badge">Most Popular</span>}
                        <div className="support-tier-icon">{tier.icon}</div>
                        <div className="support-tier-amount">{tier.amount}</div>
                        <div className="support-tier-label">{tier.label}</div>
                        <p className="support-tier-desc">{tier.description}</p>
                      </div>
                    );
                  })}
                </div>

                <div className="support-global-actions">
                  <a
                    href={PAYPAL_LINK}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="support-primary-action-btn"
                    data-testid="support-paypal-btn"
                  >
                    <CreditCard size={18} />
                    <span>Support {selectedTier} via PayPal / Card</span>
                    <ExternalLink size={15} />
                  </a>

                  <a
                    href={KOFI_LINK}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="support-secondary-action-btn"
                    data-testid="support-kofi-btn"
                  >
                    <Coffee size={16} />
                    <span>Or Buy Me a Coffee / Ko-fi</span>
                    <ExternalLink size={13} />
                  </a>
                </div>

                <p className="support-note">
                  Secure checkout via Credit Card, Debit Card, or PayPal. Works internationally from anywhere in the world.
                </p>
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
