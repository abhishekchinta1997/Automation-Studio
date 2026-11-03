import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary-screen" data-testid="error-boundary-fallback">
          <div className="error-boundary-card">
            <div className="error-boundary-icon">
              <AlertTriangle size={28} />
            </div>
            <h2>Something went wrong</h2>
            <p className="muted">
              An unexpected rendering error occurred. You can reset the view to continue your test session.
            </p>
            {this.state.error?.message && (
              <pre className="error-boundary-message" data-testid="error-boundary-message">
                {this.state.error.message}
              </pre>
            )}
            <button
              type="button"
              className="error-boundary-reset-btn"
              data-testid="error-boundary-reset-btn"
              onClick={this.handleReset}
            >
              <RotateCcw size={16} />
              <span>Reset &amp; Reload Application</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

