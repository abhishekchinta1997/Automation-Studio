import { useEffect } from "react";
import { MessageSquare, ExternalLink, X } from "lucide-react";

interface FeedbackModalProps {
  open: boolean;
  onClose: () => void;
}

const GOOGLE_FORM_EMBED_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLSdSLSehVvvL7wxpHbjuUw9zpqeyeqLXZ2Z9O8cOZNq8hpXgTQ/viewform?embedded=true";
const GOOGLE_FORM_DIRECT_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLSdSLSehVvvL7wxpHbjuUw9zpqeyeqLXZ2Z9O8cOZNq8hpXgTQ/viewform?usp=dialog";

export default function FeedbackModal({ open, onClose }: FeedbackModalProps) {
  useEffect(() => {
    if (!open) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="modal-backdrop feedback-modal-backdrop"
      data-testid="feedback-modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="modal feedback-modal"
        data-testid="feedback-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="feedback-modal-title"
      >
        <div className="feedback-modal-header">
          <div className="feedback-modal-title-row">
            <span className="feedback-modal-badge-icon">
              <MessageSquare size={20} />
            </span>
            <div>
              <h2 id="feedback-modal-title">Suggestion Box &amp; Feedback</h2>
              <p className="muted">
                Share your ideas, feature requests, or report bugs to help improve Automation Studio.
              </p>
            </div>
          </div>

          <div className="feedback-modal-header-actions">
            <a
              href={GOOGLE_FORM_DIRECT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="feedback-open-tab-btn"
              data-testid="feedback-open-new-tab-btn"
              title="Open Google Form in a new tab"
            >
              <ExternalLink size={14} />
              <span>Open in new tab</span>
            </a>

            <button
              type="button"
              className="modal-close feedback-modal-close-btn"
              data-testid="feedback-modal-close-btn"
              aria-label="Close suggestion box"
              onClick={onClose}
            >
              <X size={16} />
            </button>
          </div>
        </div>

        <div className="feedback-iframe-wrapper">
          <iframe
            src={GOOGLE_FORM_EMBED_URL}
            width="100%"
            height="600px"
            frameBorder="0"
            title="Suggestion Box Form"
            data-testid="feedback-google-form-iframe"
            className="feedback-google-form-iframe"
          >
            Loading suggestion form…
          </iframe>
        </div>
      </div>
    </div>
  );
}
