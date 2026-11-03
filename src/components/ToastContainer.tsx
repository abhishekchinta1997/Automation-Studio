import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from "lucide-react";
import { useApp } from "../context/AppContext";

export default function ToastContainer() {
  const { toast, dismissToast } = useApp();

  if (!toast) return null;

  const iconMap = {
    success: <CheckCircle2 size={18} className="toast-icon" />,
    error: <AlertCircle size={18} className="toast-icon" />,
    warning: <AlertTriangle size={18} className="toast-icon" />,
    info: <Info size={18} className="toast-icon" />,
  };

  return (
    <div
      className={`toast toast-bottom-right ${toast.type}`}
      data-testid="toast-message"
      role="status"
      aria-live="polite"
    >
      <div className="toast-content">
        {iconMap[toast.type]}
        <span data-testid="toast-text">{toast.message}</span>
      </div>
      <button
        type="button"
        className="toast-close-btn"
        data-testid="toast-close-btn"
        aria-label="Dismiss notification"
        onClick={dismissToast}
      >
        <X size={15} />
      </button>
    </div>
  );
}
